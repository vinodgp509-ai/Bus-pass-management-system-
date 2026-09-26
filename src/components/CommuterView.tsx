import React, { useMemo, useState } from 'react';
import { usePassContext } from '../context/PassContext';
import { BusPass } from '../types';
import { DigitalPassCard } from './DigitalPassCard';
import { PassRenewalModal } from './PassRenewalModal';
import { PrintPassModal } from './PrintPassModal';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getCategoryLabel,
  getStatusColorClass,
  getStatusLabel,
} from '../utils/formatters';
import {
  Printer,
  RefreshCw,
  PlusCircle,
  MapPin,
  Calendar,
  CreditCard,
  History,
  ShieldCheck,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Bus,
} from 'lucide-react';

interface CommuterViewProps {
  onOpenApplyModal: () => void;
}

export const CommuterView: React.FC<CommuterViewProps> = ({ onOpenApplyModal }) => {
  const {
    passes,
    routes,
    currentCommuterPassId,
    setCurrentCommuterPassId,
    scanLogs,
    recordScan,
    conductor,
  } = usePassContext();

  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tapFeedback, setTapFeedback] = useState<string | null>(null);

  // Current selected pass
  const currentPass = useMemo(() => {
    return passes.find((p) => p.id === currentCommuterPassId) || passes[0];
  }, [passes, currentCommuterPassId]);

  // Route of current pass
  const currentRoute = useMemo(() => {
    if (!currentPass) return undefined;
    return routes.find((r) => r.id === currentPass.routeId);
  }, [routes, currentPass]);

  // Trip logs for this specific pass
  const passLogs = useMemo(() => {
    if (!currentPass) return [];
    return scanLogs.filter((log) => log.passId === currentPass.id);
  }, [scanLogs, currentPass]);

  // Calculate days remaining
  const daysRemaining = useMemo(() => {
    if (!currentPass) return 0;
    const end = new Date(currentPass.endDate + 'T23:59:59');
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [currentPass]);

  // Handle simulate tap from commuter view
  const handleSimulateTap = () => {
    if (!currentPass) return;
    const outcome = recordScan(
      currentPass.id,
      conductor.assignedBus,
      currentPass.routeId === 'ALL_NETWORK' ? conductor.activeRouteId : currentPass.routeId,
      conductor.name,
      'Metro Turnstile #04'
    );

    if (outcome.result === 'VALID') {
      setTapFeedback('Boarding Approved! Turnstile Gate Opened.');
    } else {
      setTapFeedback(`Boarding Denied: ${outcome.reason}`);
    }

    setTimeout(() => {
      setTapFeedback(null);
    }, 4000);
  };

  // Filter passes by search
  const filteredPasses = useMemo(() => {
    if (!searchQuery.trim()) return passes;
    const q = searchQuery.toLowerCase();
    return passes.filter(
      (p) =>
        p.passengerName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.applicationNumber.toLowerCase().includes(q)
    );
  }, [passes, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Quick Profile Switcher & Action Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium">Active Commuter Cardholder</div>
          <div className="flex items-center gap-3 mt-1">
            <select
              value={currentPass?.id}
              onChange={(e) => setCurrentCommuterPassId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-sm font-semibold text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {passes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.passengerName} ({getCategoryLabel(p.category)}) - {p.status}
                </option>
              ))}
            </select>

            <span className="text-xs text-slate-400 hidden sm:inline">
              Switch commuter profiles to test different concession tiers & statuses
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRenewModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Renew Pass</span>
          </button>

          <button
            onClick={() => setPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print ID Card</span>
          </button>

          <button
            onClick={onOpenApplyModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {/* Tap Feedback Alert */}
      {tapFeedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
            tapFeedback.includes('Approved')
              ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
              : 'bg-rose-950/60 border-rose-700 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {tapFeedback.includes('Approved') ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{tapFeedback}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Recorded in Central Transit Ledger</span>
        </div>
      )}

      {/* Main Grid: Card on left, Details on right */}
      {currentPass && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive 3D Digital Smart Pass */}
          <div className="lg:col-span-6 flex flex-col items-center bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Contactless Smart Transit Pass</span>
              </span>
              <span className="text-xs text-slate-400">Click pass flip to inspect rear</span>
            </div>

            <DigitalPassCard
              pass={currentPass}
              route={currentRoute}
              onTapSimulate={handleSimulateTap}
              showControls={true}
            />

            {/* Quick Status Highlights */}
            <div className="w-full grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400 font-mono">STATUS</div>
                <div
                  className={`text-xs font-semibold mt-0.5 ${
                    currentPass.status === 'ACTIVE'
                      ? 'text-emerald-400'
                      : currentPass.status === 'EXPIRED'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {getStatusLabel(currentPass.status)}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-mono">DAYS REMAINING</div>
                <div
                  className={`text-xs font-bold font-mono mt-0.5 ${
                    daysRemaining > 10
                      ? 'text-white'
                      : daysRemaining > 0
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {daysRemaining > 0 ? `${daysRemaining} days` : 'Pass Expired'}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-mono">TOTAL BOARDINGS</div>
                <div className="text-xs font-bold font-mono text-emerald-400 mt-0.5">
                  {currentPass.tripsTaken} trips
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pass Details, Route Coverage & Validity Breakdown */}
          <div className="lg:col-span-6 space-y-6">
            {/* Route Coverage Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Transit Route Coverage</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  {currentRoute ? currentRoute.code : 'ALL-NETWORK'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-white">
                  {currentRoute ? currentRoute.name : 'All Metropolitan Bus & Express Lines'}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Origin: {currentRoute?.origin || 'Any Metro Terminal'}</span>
                  <span>·</span>
                  <span>Destination: {currentRoute?.destination || 'Citywide'}</span>
                </div>
              </div>

              {currentRoute?.via && currentRoute.via.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1.5">
                    Permitted Transit Waypoints & Interchanges
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentRoute.via.map((v, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">FREQUENCY</span>
                  <span className="text-white">{currentRoute?.frequency || 'Every 5m'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">HOURS</span>
                  <span className="text-white">{currentRoute?.operatingHours || '24 Hours'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">DISTANCE</span>
                  <span className="text-white">{currentRoute ? `${currentRoute.distanceKm} km` : 'Zone 1-4'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">AC FLEET</span>
                  <span className="text-emerald-400">{currentRoute?.isExpressAC ? 'Yes (AC)' : 'Standard'}</span>
                </div>
              </div>
            </div>

            {/* Application & Concession Verification Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Verification & Fare Ledger</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">APP ID: {currentPass.applicationNumber}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Pass Category</span>
                  <span className="font-semibold text-white">{getCategoryLabel(currentPass.category)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Institution / Employer</span>
                  <span className="font-semibold text-white truncate block">{currentPass.institutionOrEmployer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Verified ID Proof</span>
                  <span className="font-semibold text-white">{currentPass.idProofType} ({currentPass.idProofNumber})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Validity Duration</span>
                  <span className="font-semibold text-white">{currentPass.validityType} ({currentPass.startDate} to {currentPass.endDate})</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="text-slate-400">Total Fare Tariff</div>
                  <div className="font-mono text-white font-semibold">
                    {formatCurrency(currentPass.baseAmount)}
                    {currentPass.concessionDiscount > 0 && (
                      <span className="text-emerald-400 text-xs ml-2">
                        (-{formatCurrency(currentPass.concessionDiscount)} subsidized)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">Amount Paid</div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    {formatCurrency(currentPass.amountPaid)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Tap & Boarding History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Recent Boarding & Turnstile Taps</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {passLogs.length} verified events logged
          </span>
        </div>

        {passLogs.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No boardings recorded yet for this pass. Click "Simulate Contactless Tap" on the pass card above to test
            turnstile boarding!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                <tr>
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Bus Vehicle</th>
                  <th className="pb-2">Route</th>
                  <th className="pb-2">Station Stop</th>
                  <th className="pb-2">Conductor</th>
                  <th className="pb-2 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {passLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 text-slate-300">{formatDateTime(log.timestamp)}</td>
                    <td className="py-2.5 text-white">{log.busNumber}</td>
                    <td className="py-2.5 text-emerald-400">{log.routeCode}</td>
                    <td className="py-2.5 text-slate-300">{log.stopLocation}</td>
                    <td className="py-2.5 text-slate-400">{log.conductorName}</td>
                    <td className="py-2.5 text-right">
                      <span className="text-emerald-400 font-semibold">VALID (AUTHORIZED)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {currentPass && (
        <>
          <PassRenewalModal
            pass={currentPass}
            isOpen={renewModalOpen}
            onClose={() => setRenewModalOpen(false)}
          />
          <PrintPassModal
            pass={currentPass}
            route={currentRoute}
            isOpen={printModalOpen}
            onClose={() => setPrintModalOpen(false)}
          />
        </>
      )}
    </div>
  );
};
