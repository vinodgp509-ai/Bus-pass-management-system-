import React, { useState } from 'react';
import { usePassContext } from '../context/PassContext';
import { BusPass, ValidationScanLog } from '../types';
import {
  formatDate,
  formatDateTime,
  getCategoryLabel,
  getStatusColorClass,
} from '../utils/formatters';
import {
  Scan,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Camera,
  Bus,
  User,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ConductorScannerView: React.FC = () => {
  const { passes, routes, conductor, setConductor, scanLogs, recordScan } = usePassContext();

  const [inputCode, setInputCode] = useState('');
  const [activeStop, setActiveStop] = useState('Central Station Hub');
  const [cameraActive, setCameraActive] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<{
    result: 'VALID' | 'EXPIRED' | 'INVALID_ROUTE' | 'SUSPENDED' | 'NOT_FOUND';
    pass?: BusPass;
    reason: string;
    timestamp: string;
  } | null>(null);

  // Active route
  const currentRoute = routes.find((r) => r.id === conductor.activeRouteId) || routes[0];

  // Conductor shift statistics
  const currentBusLogs = scanLogs.filter((l) => l.busNumber === conductor.assignedBus);
  const validCount = currentBusLogs.filter((l) => l.scanResult === 'VALID').length;
  const flaggedCount = currentBusLogs.filter((l) => l.scanResult !== 'VALID').length;

  // Process a scan
  const handleScan = (identifier: string) => {
    if (!identifier.trim()) return;
    const outcome = recordScan(
      identifier,
      conductor.assignedBus,
      conductor.activeRouteId,
      conductor.name,
      activeStop
    );

    setLastScanResult({
      result: outcome.result,
      pass: outcome.pass,
      reason: outcome.reason,
      timestamp: new Date().toISOString(),
    });

    setInputCode('');
  };

  // Simulate camera QR scan
  const handleTriggerCameraScan = (testPassId: string) => {
    setCameraActive(true);
    setTimeout(() => {
      setCameraActive(false);
      handleScan(testPassId);
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Conductor Terminal Header & Assigned Bus Config */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Conductor Validation Terminal</h2>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  ONLINE · REAL-TIME SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Officer {conductor.name} · Badge {conductor.badgeNumber} · {conductor.depot}
              </p>
            </div>
          </div>

          {/* Quick Route & Vehicle Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
                Active Vehicle Fleet
              </label>
              <select
                value={conductor.assignedBus}
                onChange={(e) => setConductor({ ...conductor, assignedBus: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="BUS-408 (Electric Articulated)">BUS-408 (Electric Articulated)</option>
                <option value="BUS-204 (City Standard)">BUS-204 (City Standard)</option>
                <option value="BUS-305 (Airport Express AC)">BUS-305 (Airport Express AC)</option>
                <option value="BUS-112 (Bi-Level Metro)">BUS-112 (Bi-Level Metro)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
                Service Route
              </label>
              <select
                value={conductor.activeRouteId}
                onChange={(e) => setConductor({ ...conductor, activeRouteId: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} - {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
                Current Stop
              </label>
              <input
                type="text"
                value={activeStop}
                onChange={(e) => setActiveStop(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs font-medium text-white rounded-lg px-2.5 py-1.5 w-36 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input, QR Scanner & Rapid Passenger Test Suite */}
        <div className="lg:col-span-6 space-y-6">
          {/* Manual / Barcode input */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Scan className="w-4 h-4 text-emerald-400" />
                <span>Ticket Validation Scanner</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">TAP RFID / SCAN QR</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScan(inputCode);
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Scan QR payload, Pass ID (e.g. BP-2026-9041), or RFID..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl transition-colors whitespace-nowrap"
              >
                Validate Pass
              </button>
            </form>

            {/* Simulated Live Camera Scanner */}
            <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center p-4">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

              {cameraActive ? (
                <div className="space-y-2 z-10">
                  <div className="w-12 h-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
                  <div className="text-xs font-mono text-emerald-400 font-semibold animate-pulse">
                    READING OPTICAL QR MATRIX...
                  </div>
                </div>
              ) : (
                <div className="space-y-3 z-10">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-slate-300">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Live Camera QR Scanner Mode</div>
                    <div className="text-[11px] text-slate-400">Position passenger smart card QR into view</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerCameraScan('BP-2026-9041')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                  >
                    Simulate Camera Optical Scan
                  </button>
                </div>
              )}

              {/* Viewfinder Target Reticle */}
              <div className="absolute w-36 h-28 border-2 border-emerald-500/40 rounded-lg pointer-events-none">
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
              </div>
            </div>
          </div>

          {/* Quick 1-Click Passenger Simulation Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Test Boarding Scenarios (Quick Tap)</span>
              </span>
              <span className="text-[10px] text-slate-400">One-click test inspector response</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleScan('BP-2026-9041')}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">Liam Vance</div>
                  <div className="text-[11px] text-slate-400">Student Concession (Route 101A)</div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  VALID
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleScan('BP-2026-8812')}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">Eleanor Vance</div>
                  <div className="text-[11px] text-slate-400">Senior Citizen (All-Network)</div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  VALID
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleScan('BP-2026-7744')}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">Sophia Rodriguez</div>
                  <div className="text-[11px] text-slate-400">Airport Express (Route EXP-9)</div>
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded">
                  ROUTE MISMATCH
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleScan('BP-2026-6651')}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">James Wilson</div>
                  <div className="text-[11px] text-slate-400">Commuter Pass Expired</div>
                </div>
                <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded">
                  EXPIRED
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleScan('BP-2026-5509')}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">Robert King</div>
                  <div className="text-[11px] text-slate-400">Flagged Pass Violator</div>
                </div>
                <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-950/60 px-1.5 py-0.5 rounded">
                  SUSPENDED
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleScan('BP-INVALID-RANDOM')}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">Unregistered Token</div>
                  <div className="text-[11px] text-slate-400">Unknown RFID / Card</div>
                </div>
                <span className="text-[10px] font-mono text-red-400 font-bold bg-red-950/60 px-1.5 py-0.5 rounded">
                  NOT FOUND
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Large High-Visibility Validation Feedback Screen */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[360px] flex flex-col justify-between">
            {lastScanResult ? (
              <div className="space-y-6">
                {/* Result Status Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                    lastScanResult.result === 'VALID'
                      ? 'bg-emerald-950/70 border-emerald-600 text-emerald-200'
                      : lastScanResult.result === 'EXPIRED'
                      ? 'bg-rose-950/70 border-rose-600 text-rose-200'
                      : lastScanResult.result === 'INVALID_ROUTE'
                      ? 'bg-amber-950/70 border-amber-600 text-amber-200'
                      : lastScanResult.result === 'SUSPENDED'
                      ? 'bg-purple-950/70 border-purple-600 text-purple-200'
                      : 'bg-red-950/70 border-red-600 text-red-200'
                  }`}
                >
                  {lastScanResult.result === 'VALID' && (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  )}
                  {lastScanResult.result === 'EXPIRED' && (
                    <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
                  )}
                  {lastScanResult.result === 'INVALID_ROUTE' && (
                    <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                  )}
                  {lastScanResult.result === 'SUSPENDED' && (
                    <ShieldAlert className="w-8 h-8 text-purple-400 shrink-0" />
                  )}
                  {lastScanResult.result === 'NOT_FOUND' && (
                    <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                  )}

                  <div>
                    <div className="text-base font-extrabold uppercase tracking-wide">
                      {lastScanResult.result === 'VALID' && 'PASS VERIFIED · BOARDING AUTHORIZED'}
                      {lastScanResult.result === 'EXPIRED' && 'PASS EXPIRED · BOARDING DENIED'}
                      {lastScanResult.result === 'INVALID_ROUTE' && 'ROUTE MISMATCH · BOARDING DENIED'}
                      {lastScanResult.result === 'SUSPENDED' && 'CARD SUSPENDED · RETRIEVE TICKET'}
                      {lastScanResult.result === 'NOT_FOUND' && 'UNREGISTERED CARD · NOT FOUND'}
                    </div>
                    <div className="text-xs opacity-90 mt-0.5">{lastScanResult.reason}</div>
                  </div>
                </div>

                {/* Passenger Visual Match verification */}
                {lastScanResult.pass ? (
                  <div className="grid grid-cols-12 gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="col-span-4 sm:col-span-3">
                      <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-800">
                        <img
                          src={lastScanResult.pass.photoUrl}
                          alt={lastScanResult.pass.passengerName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-[9px] text-center font-mono text-slate-400 mt-1">
                        PHOTO ON FILE
                      </div>
                    </div>

                    <div className="col-span-8 sm:col-span-9 space-y-1.5 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Passenger Name</div>
                        <div className="text-base font-bold text-white">{lastScanResult.pass.passengerName}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-300">
                        <div>
                          <span className="text-[10px] text-slate-400 block">CATEGORY</span>
                          <span className="font-semibold text-emerald-400">
                            {getCategoryLabel(lastScanResult.pass.category)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">PASS ID</span>
                          <span className="font-mono text-white">{lastScanResult.pass.id}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">PERMITTED ROUTE</span>
                          <span className="font-mono text-white">{lastScanResult.pass.routeId}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">EXPIRATION DATE</span>
                          <span className="font-mono text-white">{lastScanResult.pass.endDate}</span>
                        </div>
                      </div>

                      <div className="pt-1 text-[11px] text-slate-400">
                        Total Boardings: <strong className="text-white font-mono">{lastScanResult.pass.tripsTaken}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 rounded-xl text-center text-xs text-slate-400">
                    No registered record associated with this identifier in central transport database.
                  </div>
                )}

                <div className="text-[11px] font-mono text-slate-400 flex justify-between pt-2 border-t border-slate-800">
                  <span>VEHICLE: {conductor.assignedBus}</span>
                  <span>TIME: {formatDateTime(lastScanResult.timestamp)}</span>
                </div>
              </div>
            ) : (
              <div className="my-auto text-center py-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                  <Scan className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-white">Scanner Ready</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Scan a commuter pass barcode/QR or use the rapid test buttons on the left to simulate passenger
                  inspections.
                </p>
              </div>
            )}

            {/* Shift Counters */}
            <div className="pt-4 mt-6 border-t border-slate-800 grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Today's Boardings</div>
                <div className="text-lg font-bold font-mono text-white mt-0.5">{validCount}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Violations Flagged</div>
                <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">{flaggedCount}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Service Line</div>
                <div className="text-xs font-bold font-mono text-emerald-400 mt-1">
                  {currentRoute.code}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Scans Log on this bus */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white">Recent Boarding Taps on {conductor.assignedBus}</span>
              <span className="text-[10px] font-mono text-slate-400">REAL-TIME AUDIT</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {currentBusLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{log.passengerName}</span>
                      <span className="text-[10px] font-mono text-slate-400">({log.passId})</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{log.notes}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        log.scanResult === 'VALID'
                          ? 'text-emerald-400 bg-emerald-950/60'
                          : 'text-rose-400 bg-rose-950/60'
                      }`}
                    >
                      {log.scanResult}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {formatDateTime(log.timestamp).split(',')[1]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
