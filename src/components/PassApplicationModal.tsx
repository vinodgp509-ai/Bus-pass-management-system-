import React, { useMemo, useState } from 'react';
import { usePassContext } from '../context/PassContext';
import { BusPass, PassCategory, PassValidityType } from '../types';
import { formatCurrency, getValidityDays } from '../utils/formatters';
import { X, Upload, CheckCircle2, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

interface PassApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pass: BusPass) => void;
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&auto=format&fit=crop&q=80',
];

export const PassApplicationModal: React.FC<PassApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { routes, fareRules, applyForPass, approvePass } = usePassContext();

  const [formData, setFormData] = useState({
    passengerName: '',
    email: '',
    phone: '',
    dateOfBirth: '2004-06-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    category: 'STUDENT' as PassCategory,
    institutionOrEmployer: 'City Metropolitan University',
    idProofType: 'Student College ID' as BusPass['idProofType'],
    idProofNumber: 'STU-9921-X',
    photoUrl: SAMPLE_AVATARS[0],
    routeId: 'R-101',
    validityType: 'MONTHLY' as PassValidityType,
    emergencyName: 'Jane Doe',
    emergencyPhone: '+1 (555) 912-4411',
    emergencyRelation: 'Parent',
    autoApprove: true,
  });

  const [submitting, setSubmitting] = useState(false);

  // Selected route object
  const selectedRoute = useMemo(() => {
    return routes.find((r) => r.id === formData.routeId) || routes[0];
  }, [routes, formData.routeId]);

  // Selected fare rule
  const selectedRule = useMemo(() => {
    return fareRules.find((f) => f.category === formData.category);
  }, [fareRules, formData.category]);

  // Calculate fees
  const fareBreakdown = useMemo(() => {
    if (!selectedRoute) return { base: 0, discount: 0, total: 0 };

    let multiplier = 1;
    switch (formData.validityType) {
      case 'MONTHLY':
        multiplier = 1;
        break;
      case 'QUARTERLY':
        multiplier = 2.85; // slight bundle discount
        break;
      case 'SEMESTER':
        multiplier = 5.2;
        break;
      case 'ANNUAL':
        multiplier = 10;
        break;
    }

    const base = Math.round(selectedRoute.monthlyPassRate * multiplier);
    const discountRate = selectedRule ? selectedRule.discountPercentage : 0;
    const discount = Math.round(base * (discountRate / 100));
    const total = Math.max(0, base - discount);

    return { base, discount, total, discountRate };
  }, [selectedRoute, selectedRule, formData.validityType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.passengerName.trim() || !formData.email.trim()) return;

    setSubmitting(true);

    const now = new Date();
    const days = getValidityDays(formData.validityType);
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const newPassData = {
      passengerName: formData.passengerName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      category: formData.category,
      institutionOrEmployer: formData.institutionOrEmployer,
      idProofType: formData.idProofType,
      idProofNumber: formData.idProofNumber,
      photoUrl: formData.photoUrl,
      routeId: formData.routeId,
      validityType: formData.validityType,
      startDate: now.toISOString().split('T')[0],
      endDate,
      baseAmount: fareBreakdown.base,
      concessionDiscount: fareBreakdown.discount,
      amountPaid: fareBreakdown.total,
      emergencyContact: {
        name: formData.emergencyName,
        phone: formData.emergencyPhone,
        relationship: formData.emergencyRelation,
      },
    };

    const createdPass = await applyForPass(newPassData);

    if (formData.autoApprove) {
      approvePass(createdPass.id, 'Automated Instant Verification System');
      createdPass.status = 'ACTIVE';
    }

    setSubmitting(false);
    onSuccess(createdPass);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Transit Bus Pass Application</h2>
              <p className="text-xs text-slate-400">Issue official digital smart pass with biometric photo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* 1. Commuter Profile & Identity */}
          <div className="space-y-4">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>01. Commuter Identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={formData.passengerName}
                  onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="alex.morgan@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Commuter Photo Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Biometric Identification Photo
              </label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-16 rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-800 shrink-0">
                  <img
                    src={formData.photoUrl}
                    alt="Selected portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-[11px] text-slate-400">Choose portrait avatar or paste image URL:</div>
                  <div className="flex items-center gap-2">
                    {SAMPLE_AVATARS.map((url, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setFormData({ ...formData, photoUrl: url })}
                        className={`w-7 h-7 rounded-md overflow-hidden border transition-all ${
                          formData.photoUrl === url
                            ? 'border-emerald-400 ring-2 ring-emerald-500/30 scale-105'
                            : 'border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Pass Category & Document Verification */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>02. Pass Category & Concession Tier</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Pass Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value as PassCategory;
                    let proofType: BusPass['idProofType'] = 'National ID';
                    if (cat === 'STUDENT') proofType = 'Student College ID';
                    else if (cat === 'SENIOR') proofType = 'Senior Age Proof';
                    else if (cat === 'PHYSICALLY_CHALLENGED') proofType = 'Disability Certificate';
                    else if (cat === 'EXPRESS_AIRPORT') proofType = 'Passport';

                    setFormData({
                      ...formData,
                      category: cat,
                      idProofType: proofType,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="STUDENT">Student Concession (60% Subsidy)</option>
                  <option value="SENIOR">Senior Citizen (50% Subsidy)</option>
                  <option value="COMMUTER_STANDARD">Standard Commuter (Regular)</option>
                  <option value="EXPRESS_AIRPORT">Express & Airport Corridor</option>
                  <option value="PHYSICALLY_CHALLENGED">Accessibility Concession (75% Subsidy)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Institution / Employer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. University / Company Name"
                  value={formData.institutionOrEmployer}
                  onChange={(e) => setFormData({ ...formData, institutionOrEmployer: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Proof Document Type</label>
                <input
                  type="text"
                  disabled
                  value={formData.idProofType}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Reg / ID # *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STU-8841-A or NAT-9012"
                  value={formData.idProofNumber}
                  onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {selectedRule && selectedRule.discountPercentage > 0 && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{selectedRule.discountPercentage}% Transit Concession Applied:</span>{' '}
                  {selectedRule.eligibleCriteria}. Proof: {selectedRule.proofRequirements}.
                </div>
              </div>
            )}
          </div>

          {/* 3. Route & Validity Period */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>03. Route Network & Duration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Designated Route *</label>
                <select
                  value={formData.routeId}
                  onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} - {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Validity Period *</label>
                <select
                  value={formData.validityType}
                  onChange={(e) => setFormData({ ...formData, validityType: e.target.value as PassValidityType })}
                  className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="MONTHLY">Monthly (30 Days)</option>
                  <option value="QUARTERLY">Quarterly (90 Days - 5% discount)</option>
                  {formData.category === 'STUDENT' && (
                    <option value="SEMESTER">Academic Semester (180 Days)</option>
                  )}
                  <option value="ANNUAL">Annual Pass (365 Days - 2 months free)</option>
                </select>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  placeholder="Guardian / Contact"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Emergency Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="Parent / Spouse / Friend"
                  value={formData.emergencyRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* 4. Fare Calculation Summary Box */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
            <div className="text-xs font-semibold text-slate-300">Fare Calculation & Concession Receipt</div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Standard Base Rate</span>
              <span className="font-mono tabular-nums">{formatCurrency(fareBreakdown.base)}</span>
            </div>

            {fareBreakdown.discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-400">
                <span>Government Subsidy ({fareBreakdown.discountRate}%)</span>
                <span className="font-mono tabular-nums">-{formatCurrency(fareBreakdown.discount)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-sm font-semibold text-white">Net Total Payable</span>
              <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                {formatCurrency(fareBreakdown.total)}
              </span>
            </div>
          </div>

          {/* Demo toggle: Instant auto-approval */}
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <input
              type="checkbox"
              id="autoApprove"
              checked={formData.autoApprove}
              onChange={(e) => setFormData({ ...formData, autoApprove: e.target.checked })}
              className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-600 focus:ring-emerald-500"
            />
            <label htmlFor="autoApprove" className="text-xs text-slate-300 cursor-pointer">
              <span className="font-semibold text-white">Instant Issuance (Auto-Approve):</span> Immediately generate active
              smart pass with QR code without waiting in authority review queue.
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>{submitting ? 'Processing Application...' : 'Pay & Issue Digital Smart Pass'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
