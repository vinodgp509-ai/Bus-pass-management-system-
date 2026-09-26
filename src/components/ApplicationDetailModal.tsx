import React, { useState } from 'react';
import { usePassContext } from '../context/PassContext';
import { BusPass } from '../types';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getCategoryLabel,
  getStatusColorClass,
  getStatusLabel,
} from '../utils/formatters';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  FileText,
  User,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  pass: BusPass | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  pass,
  isOpen,
  onClose,
}) => {
  const { routes, approvePass, rejectPass, suspendPass, reactivatePass } = usePassContext();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!isOpen || !pass) return null;

  const route = routes.find((r) => r.id === pass.routeId);
  const statusColors = getStatusColorClass(pass.status);

  const handleApprove = () => {
    approvePass(pass.id, 'Officer J. Thorne (Transit Verification Dept)');
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectPass(pass.id, rejectReason, 'Officer J. Thorne');
    onClose();
  };

  const handleSuspend = () => {
    suspendPass(pass.id, 'Administrative suspension due to policy compliance review.');
    onClose();
  };

  const handleReactivate = () => {
    reactivatePass(pass.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Application Review & Dossier</h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                >
                  {getStatusLabel(pass.status)}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                APP ID: {pass.applicationNumber} · PASS ID: {pass.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Commuter & Application Content */}
        <div className="space-y-6 text-xs max-h-[70vh] overflow-y-auto pr-1">
          {/* Passenger Identity */}
          <div className="grid grid-cols-12 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 items-center">
            <div className="col-span-3">
              <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-800 mx-auto">
                <img
                  src={pass.photoUrl}
                  alt={pass.passengerName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="col-span-9 space-y-1.5">
              <div className="text-sm font-bold text-white">{pass.passengerName}</div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">EMAIL</span>
                  <span>{pass.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">PHONE</span>
                  <span className="font-mono">{pass.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">DOB / GENDER</span>
                  <span>{pass.dateOfBirth} · {pass.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CATEGORY</span>
                  <span className="text-emerald-400 font-semibold">{getCategoryLabel(pass.category)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Verification Section */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Concession Proof & Accreditation</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px]">INSTITUTION / EMPLOYER</span>
                <span className="font-semibold text-white">{pass.institutionOrEmployer || 'General Commuter'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DOCUMENT TYPE</span>
                <span>{pass.idProofType}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">REGISTRATION / CERTIFICATE #</span>
                <span className="font-mono text-white font-semibold">{pass.idProofNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SUBMISSION TIMESTAMP</span>
                <span className="font-mono">{formatDateTime(pass.appliedAt)}</span>
              </div>
            </div>

            {pass.rejectionReason && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300">
                <span className="font-bold">Administrative Note: </span>
                {pass.rejectionReason}
              </div>
            )}
          </div>

          {/* Route & Tariff Breakdown */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="font-semibold text-white">Route Network & Financials</div>
            <div className="flex justify-between text-slate-300">
              <span>Assigned Route</span>
              <span className="font-semibold text-white">
                {route ? `${route.code} - ${route.name}` : pass.routeId}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Duration</span>
              <span>{pass.validityType} ({pass.startDate} to {pass.endDate})</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Standard Fare</span>
              <span className="font-mono">{formatCurrency(pass.baseAmount)}</span>
            </div>
            {pass.concessionDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Government Subsidy Concession</span>
                <span className="font-mono">-{formatCurrency(pass.concessionDiscount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
              <span>Amount Collected</span>
              <span className="text-emerald-400 font-mono text-sm">{formatCurrency(pass.amountPaid)}</span>
            </div>
          </div>

          {/* Reject Input Field */}
          {showRejectInput && (
            <div className="p-3 bg-red-950/30 border border-red-800/50 rounded-xl space-y-2">
              <label className="block text-slate-300 font-semibold">Reason for Application Rejection</label>
              <textarea
                rows={2}
                placeholder="e.g. Student ID expired or photo does not match registered citizen records..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectInput(false)}
                  className="px-3 py-1 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div>
            {pass.status === 'ACTIVE' && (
              <button
                type="button"
                onClick={handleSuspend}
                className="px-3 py-1.5 text-xs text-purple-400 hover:text-purple-300 bg-purple-950/40 border border-purple-800 rounded-lg flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Suspend Pass</span>
              </button>
            )}
            {pass.status === 'SUSPENDED' && (
              <button
                type="button"
                onClick={handleReactivate}
                className="px-3 py-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800 rounded-lg flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Reactivate Pass</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {pass.status === 'PENDING_APPROVAL' && !showRejectInput && (
              <>
                <button
                  type="button"
                  onClick={() => setShowRejectInput(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-slate-800 border border-slate-700 rounded-lg"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Issue Smart Card</span>
                </button>
              </>
            )}

            {pass.status !== 'PENDING_APPROVAL' && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
