import React, { useMemo, useState } from 'react';
import { usePassContext } from '../context/PassContext';
import { BusPass, PassValidityType } from '../types';
import { formatCurrency, getValidityDays } from '../utils/formatters';
import { X, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PassRenewalModalProps {
  pass: BusPass;
  isOpen: boolean;
  onClose: () => void;
}

export const PassRenewalModal: React.FC<PassRenewalModalProps> = ({ pass, isOpen, onClose }) => {
  const { routes, fareRules, renewPass } = usePassContext();
  const [validityType, setValidityType] = useState<PassValidityType>('MONTHLY');
  const [processing, setProcessing] = useState(false);

  const route = useMemo(() => {
    return routes.find((r) => r.id === pass.routeId) || routes[0];
  }, [routes, pass.routeId]);

  const rule = useMemo(() => {
    return fareRules.find((f) => f.category === pass.category);
  }, [fareRules, pass.category]);

  const renewalFee = useMemo(() => {
    if (!route) return 0;
    let multiplier = 1;
    switch (validityType) {
      case 'MONTHLY':
        multiplier = 1;
        break;
      case 'QUARTERLY':
        multiplier = 2.85;
        break;
      case 'SEMESTER':
        multiplier = 5.2;
        break;
      case 'ANNUAL':
        multiplier = 10;
        break;
    }
    const base = route.monthlyPassRate * multiplier;
    const discount = rule ? base * (rule.discountPercentage / 100) : 0;
    return Math.round(base - discount);
  }, [route, rule, validityType]);

  if (!isOpen) return null;

  const handleRenew = () => {
    setProcessing(true);
    setTimeout(() => {
      renewPass(pass.id, validityType, renewalFee);
      setProcessing(false);
      onClose();
    }, 400);
  };

  const days = getValidityDays(validityType);
  const now = new Date();
  const currentEnd = new Date(pass.endDate);
  const baseDate = currentEnd > now ? currentEnd : now;
  const newEndDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Renew Transit Pass</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
            <div className="text-slate-400">Cardholder</div>
            <div className="text-sm font-semibold text-white">{pass.passengerName}</div>
            <div className="text-slate-400 font-mono text-[11px]">{pass.id} · {pass.category}</div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Select Renewal Extension</label>
            <select
              value={validityType}
              onChange={(e) => setValidityType(e.target.value as PassValidityType)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="MONTHLY">1 Month Extension (+30 Days)</option>
              <option value="QUARTERLY">Quarterly (+90 Days - 5% discount)</option>
              {pass.category === 'STUDENT' && (
                <option value="SEMESTER">Academic Semester (+180 Days)</option>
              )}
              <option value="ANNUAL">Annual Pass (+365 Days - 2 months free)</option>
            </select>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Current Expiration:</span>
              <span>{pass.endDate}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Extended Until:</span>
              <span>{newEndDate}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
              <span>Renewal Amount:</span>
              <span className="text-emerald-400 tabular-nums">{formatCurrency(renewalFee)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleRenew}
            disabled={processing}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{processing ? 'Renewing...' : `Pay ${formatCurrency(renewalFee)} & Renew`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
