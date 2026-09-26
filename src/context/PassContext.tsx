import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_CONDUCTOR,
  INITIAL_FARE_RULES,
  INITIAL_PASSES,
  INITIAL_ROUTES,
  INITIAL_SCAN_LOGS,
} from '../data/initialData';
import {
  BusPass,
  BusRoute,
  ConductorProfile,
  FareRule,
  PassValidityType,
  ValidationScanLog,
} from '../types';
import { sound } from '../utils/audio';
import { getValidityDays } from '../utils/formatters';

interface ScanOutcome {
  result: 'VALID' | 'EXPIRED' | 'INVALID_ROUTE' | 'SUSPENDED' | 'NOT_FOUND';
  pass?: BusPass;
  reason: string;
}

interface PassContextType {
  passes: BusPass[];
  routes: BusRoute[];
  fareRules: FareRule[];
  scanLogs: ValidationScanLog[];
  conductor: ConductorProfile;
  currentCommuterPassId: string;
  activeTab: 'commuter' | 'conductor' | 'admin' | 'routes';
  setActiveTab: (tab: 'commuter' | 'conductor' | 'admin' | 'routes') => void;
  setCurrentCommuterPassId: (id: string) => void;
  setConductor: (conductor: ConductorProfile) => void;
  applyForPass: (
    data: Omit<
      BusPass,
      'id' | 'applicationNumber' | 'status' | 'appliedAt' | 'rfidCardNumber' | 'tripsTaken'
    >
  ) => Promise<BusPass>;
  approvePass: (passId: string, reviewedBy?: string) => void;
  rejectPass: (passId: string, reason: string, reviewedBy?: string) => void;
  renewPass: (passId: string, validityType: PassValidityType, amountPaid: number) => void;
  suspendPass: (passId: string, reason: string) => void;
  reactivatePass: (passId: string) => void;
  recordScan: (
    identifier: string,
    busNumber: string,
    activeRouteId: string,
    conductorName: string,
    stopLocation?: string
  ) => ScanOutcome;
  addRoute: (route: BusRoute) => void;
  updateRoute: (route: BusRoute) => void;
  deleteRoute: (routeId: string) => void;
  resetDatabase: () => void;
}

const STORAGE_KEYS = {
  PASSES: 'transpass_passes_v1',
  ROUTES: 'transpass_routes_v1',
  SCAN_LOGS: 'transpass_scan_logs_v1',
  CONDUCTOR: 'transpass_conductor_v1',
  COMMUTER_ID: 'transpass_commuter_id_v1',
};

const PassContext = createContext<PassContextType | undefined>(undefined);

export const PassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [passes, setPasses] = useState<BusPass[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PASSES);
      return saved ? JSON.parse(saved) : INITIAL_PASSES;
    } catch {
      return INITIAL_PASSES;
    }
  });

  const [routes, setRoutes] = useState<BusRoute[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROUTES);
      return saved ? JSON.parse(saved) : INITIAL_ROUTES;
    } catch {
      return INITIAL_ROUTES;
    }
  });

  const [fareRules] = useState<FareRule[]>(INITIAL_FARE_RULES);

  const [scanLogs, setScanLogs] = useState<ValidationScanLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCAN_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_SCAN_LOGS;
    } catch {
      return INITIAL_SCAN_LOGS;
    }
  });

  const [conductor, setConductor] = useState<ConductorProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONDUCTOR);
      return saved ? JSON.parse(saved) : INITIAL_CONDUCTOR;
    } catch {
      return INITIAL_CONDUCTOR;
    }
  });

  const [currentCommuterPassId, setCurrentCommuterPassId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMUTER_ID);
      return saved || 'BP-2026-9041';
    } catch {
      return 'BP-2026-9041';
    }
  });

  const [activeTab, setActiveTab] = useState<'commuter' | 'conductor' | 'admin' | 'routes'>('commuter');

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PASSES, JSON.stringify(passes));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [passes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [routes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCAN_LOGS, JSON.stringify(scanLogs));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [scanLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONDUCTOR, JSON.stringify(conductor));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [conductor]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMUTER_ID, currentCommuterPassId);
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }, [currentCommuterPassId]);

  // Apply for pass
  const applyForPass = async (
    data: Omit<
      BusPass,
      'id' | 'applicationNumber' | 'status' | 'appliedAt' | 'rfidCardNumber' | 'tripsTaken'
    >
  ): Promise<BusPass> => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newPassId = `BP-2026-${randomSuffix}`;
    const newAppNumber = `APP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRfid = `RFID-${randomSuffix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPass: BusPass = {
      ...data,
      id: newPassId,
      applicationNumber: newAppNumber,
      status: 'PENDING_APPROVAL',
      appliedAt: new Date().toISOString(),
      rfidCardNumber: newRfid,
      tripsTaken: 0,
    };

    setPasses((prev) => [newPass, ...prev]);
    setCurrentCommuterPassId(newPass.id);
    return newPass;
  };

  // Approve pass
  const approvePass = (passId: string, reviewedBy = 'Authority Officer') => {
    setPasses((prev) =>
      prev.map((pass) => {
        if (pass.id === passId) {
          return {
            ...pass,
            status: 'ACTIVE',
            issuedAt: new Date().toISOString(),
            reviewedAt: new Date().toISOString(),
            reviewedBy,
            rejectionReason: undefined,
          };
        }
        return pass;
      })
    );
  };

  // Reject pass
  const rejectPass = (passId: string, reason: string, reviewedBy = 'Authority Officer') => {
    setPasses((prev) =>
      prev.map((pass) => {
        if (pass.id === passId) {
          return {
            ...pass,
            status: 'REJECTED',
            reviewedAt: new Date().toISOString(),
            reviewedBy,
            rejectionReason: reason,
          };
        }
        return pass;
      })
    );
  };

  // Renew pass
  const renewPass = (passId: string, validityType: PassValidityType, amountPaid: number) => {
    const daysToAdd = getValidityDays(validityType);
    setPasses((prev) =>
      prev.map((pass) => {
        if (pass.id === passId) {
          const now = new Date();
          const currentEnd = new Date(pass.endDate);
          const baseDate = currentEnd > now ? currentEnd : now;
          const newEndDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

          return {
            ...pass,
            status: 'ACTIVE',
            validityType,
            startDate: now.toISOString().split('T')[0],
            endDate: newEndDate.toISOString().split('T')[0],
            amountPaid: pass.amountPaid + amountPaid,
            issuedAt: new Date().toISOString(),
          };
        }
        return pass;
      })
    );
  };

  // Suspend pass
  const suspendPass = (passId: string, reason: string) => {
    setPasses((prev) =>
      prev.map((pass) => {
        if (pass.id === passId) {
          return {
            ...pass,
            status: 'SUSPENDED',
            rejectionReason: reason,
          };
        }
        return pass;
      })
    );
  };

  // Reactivate pass
  const reactivatePass = (passId: string) => {
    setPasses((prev) =>
      prev.map((pass) => {
        if (pass.id === passId) {
          return {
            ...pass,
            status: 'ACTIVE',
            rejectionReason: undefined,
          };
        }
        return pass;
      })
    );
  };

  // Conductor Scanner logic
  const recordScan = (
    identifier: string,
    busNumber: string,
    activeRouteId: string,
    conductorName: string,
    stopLocation = 'Station Stop'
  ): ScanOutcome => {
    const trimmed = identifier.trim();
    // Match by ID, RFID, application number, or passenger name
    const foundPass = passes.find(
      (p) =>
        p.id.toLowerCase() === trimmed.toLowerCase() ||
        p.rfidCardNumber.toLowerCase() === trimmed.toLowerCase() ||
        p.applicationNumber.toLowerCase() === trimmed.toLowerCase() ||
        p.passengerName.toLowerCase() === trimmed.toLowerCase()
    );

    const now = new Date();
    const routeObj = routes.find((r) => r.id === activeRouteId);
    const routeCode = routeObj ? routeObj.code : activeRouteId;

    if (!foundPass) {
      sound.playInvalidPass();
      const logEntry: ValidationScanLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        passId: trimmed,
        passengerName: 'Unknown / Unregistered Card',
        category: 'COMMUTER_STANDARD',
        timestamp: now.toISOString(),
        busNumber,
        routeCode,
        conductorName,
        scanResult: 'NOT_FOUND',
        notes: `Identifier ${trimmed} not found in Transit Registry`,
        stopLocation,
      };
      setScanLogs((prev) => [logEntry, ...prev]);
      return {
        result: 'NOT_FOUND',
        reason: 'Pass record not found in Transit Authority central database.',
      };
    }

    // Check status
    if (foundPass.status === 'SUSPENDED') {
      sound.playInvalidPass();
      const logEntry: ValidationScanLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        passId: foundPass.id,
        passengerName: foundPass.passengerName,
        passengerPhoto: foundPass.photoUrl,
        category: foundPass.category,
        timestamp: now.toISOString(),
        busNumber,
        routeCode,
        conductorName,
        scanResult: 'SUSPENDED',
        notes: `CARD SUSPENDED: ${foundPass.rejectionReason || 'Security restriction'}`,
        stopLocation,
      };
      setScanLogs((prev) => [logEntry, ...prev]);
      return {
        result: 'SUSPENDED',
        pass: foundPass,
        reason: `Pass suspended: ${foundPass.rejectionReason || 'Contact transit headquarters.'}`,
      };
    }

    if (foundPass.status === 'PENDING_APPROVAL' || foundPass.status === 'REJECTED') {
      sound.playInvalidPass();
      const logEntry: ValidationScanLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        passId: foundPass.id,
        passengerName: foundPass.passengerName,
        passengerPhoto: foundPass.photoUrl,
        category: foundPass.category,
        timestamp: now.toISOString(),
        busNumber,
        routeCode,
        conductorName,
        scanResult: 'NOT_FOUND',
        notes: `Pass is ${foundPass.status} - Not active for boarding`,
        stopLocation,
      };
      setScanLogs((prev) => [logEntry, ...prev]);
      return {
        result: 'NOT_FOUND',
        pass: foundPass,
        reason: `Pass application is ${foundPass.status}. Document review required.`,
      };
    }

    // Check expiration
    const endDate = new Date(foundPass.endDate + 'T23:59:59');
    if (now > endDate || foundPass.status === 'EXPIRED') {
      sound.playInvalidPass();
      const logEntry: ValidationScanLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        passId: foundPass.id,
        passengerName: foundPass.passengerName,
        passengerPhoto: foundPass.photoUrl,
        category: foundPass.category,
        timestamp: now.toISOString(),
        busNumber,
        routeCode,
        conductorName,
        scanResult: 'EXPIRED',
        notes: `Expired on ${foundPass.endDate}`,
        stopLocation,
      };
      setScanLogs((prev) => [logEntry, ...prev]);
      return {
        result: 'EXPIRED',
        pass: foundPass,
        reason: `Pass validity expired on ${foundPass.endDate}. Passenger must renew.`,
      };
    }

    // Check route validity
    const isNetworkWide = foundPass.routeId === 'ALL_NETWORK';
    const isMatchingRoute = foundPass.routeId === activeRouteId;

    if (!isNetworkWide && !isMatchingRoute) {
      sound.playInvalidPass();
      const allowedRoute = routes.find((r) => r.id === foundPass.routeId);
      const logEntry: ValidationScanLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        passId: foundPass.id,
        passengerName: foundPass.passengerName,
        passengerPhoto: foundPass.photoUrl,
        category: foundPass.category,
        timestamp: now.toISOString(),
        busNumber,
        routeCode,
        conductorName,
        scanResult: 'INVALID_ROUTE',
        notes: `Assigned to Route ${allowedRoute ? allowedRoute.code : foundPass.routeId} only. Current Bus: Route ${routeCode}`,
        stopLocation,
      };
      setScanLogs((prev) => [logEntry, ...prev]);
      return {
        result: 'INVALID_ROUTE',
        pass: foundPass,
        reason: `Route Mismatch: Valid only on Route ${allowedRoute ? allowedRoute.code : foundPass.routeId} (${allowedRoute?.name || ''}).`,
      };
    }

    // SUCCESS - Valid Pass!
    sound.playValidPass();
    // Update trips and last tapped in pass state
    setPasses((prev) =>
      prev.map((p) => {
        if (p.id === foundPass.id) {
          return {
            ...p,
            tripsTaken: p.tripsTaken + 1,
            lastTappedAt: now.toISOString(),
            lastTappedBus: `${busNumber} (${routeCode})`,
          };
        }
        return p;
      })
    );

    const logEntry: ValidationScanLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      passId: foundPass.id,
      passengerName: foundPass.passengerName,
      passengerPhoto: foundPass.photoUrl,
      category: foundPass.category,
      timestamp: now.toISOString(),
      busNumber,
      routeCode,
      conductorName,
      scanResult: 'VALID',
      notes: `Boarding approved: ${foundPass.category} pass verified`,
      stopLocation,
    };
    setScanLogs((prev) => [logEntry, ...prev]);

    return {
      result: 'VALID',
      pass: { ...foundPass, tripsTaken: foundPass.tripsTaken + 1 },
      reason: 'Pass verified successfully. Boarding authorized.',
    };
  };

  const addRoute = (newRoute: BusRoute) => {
    setRoutes((prev) => [...prev, newRoute]);
  };

  const updateRoute = (updated: BusRoute) => {
    setRoutes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const deleteRoute = (routeId: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== routeId));
  };

  const resetDatabase = () => {
    localStorage.removeItem(STORAGE_KEYS.PASSES);
    localStorage.removeItem(STORAGE_KEYS.ROUTES);
    localStorage.removeItem(STORAGE_KEYS.SCAN_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CONDUCTOR);
    localStorage.removeItem(STORAGE_KEYS.COMMUTER_ID);
    setPasses(INITIAL_PASSES);
    setRoutes(INITIAL_ROUTES);
    setScanLogs(INITIAL_SCAN_LOGS);
    setConductor(INITIAL_CONDUCTOR);
    setCurrentCommuterPassId('BP-2026-9041');
  };

  return (
    <PassContext.Provider
      value={{
        passes,
        routes,
        fareRules,
        scanLogs,
        conductor,
        currentCommuterPassId,
        activeTab,
        setActiveTab,
        setCurrentCommuterPassId,
        setConductor,
        applyForPass,
        approvePass,
        rejectPass,
        renewPass,
        suspendPass,
        reactivatePass,
        recordScan,
        addRoute,
        updateRoute,
        deleteRoute,
        resetDatabase,
      }}
    >
      {children}
    </PassContext.Provider>
  );
};

export const usePassContext = () => {
  const context = useContext(PassContext);
  if (!context) {
    throw new Error('usePassContext must be used within a PassProvider');
  }
  return context;
};
