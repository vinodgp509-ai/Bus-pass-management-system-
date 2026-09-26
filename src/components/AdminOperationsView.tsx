import React, { useMemo, useState } from 'react';
import { usePassContext } from '../context/PassContext';
import { BusPass, PassCategory, PassStatus } from '../types';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getCategoryLabel,
  getStatusColorClass,
  getStatusLabel,
} from '../utils/formatters';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  ShieldCheck,
  CreditCard,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  Bus,
  RefreshCw,
} from 'lucide-react';

export const AdminOperationsView: React.FC = () => {
  const { passes, routes, scanLogs, approvePass, rejectPass } = usePassContext();

  const [activeSubTab, setActiveSubTab] = useState<'applications' | 'passes' | 'audit'>('applications');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPassForReview, setSelectedPassForReview] = useState<BusPass | null>(null);

  // High-level transit analytics
  const analytics = useMemo(() => {
    const active = passes.filter((p) => p.status === 'ACTIVE').length;
    const pending = passes.filter((p) => p.status === 'PENDING_APPROVAL').length;
    const totalRevenue = passes.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalSubsidies = passes.reduce((sum, p) => sum + p.concessionDiscount, 0);
    const totalTaps = passes.reduce((sum, p) => sum + p.tripsTaken, 0);

    return { active, pending, totalRevenue, totalSubsidies, totalTaps };
  }, [passes]);

  // Pending applications queue
  const pendingApplications = useMemo(() => {
    return passes.filter((p) => p.status === 'PENDING_APPROVAL');
  }, [passes]);

  // Filtered passes for directory
  const filteredPasses = useMemo(() => {
    return passes.filter((p) => {
      const matchSearch =
        !searchQuery.trim() ||
        p.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [passes, searchQuery, categoryFilter, statusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Pass ID',
      'Application Number',
      'Passenger Name',
      'Email',
      'Phone',
      'Category',
      'Status',
      'Route ID',
      'Start Date',
      'End Date',
      'Base Fare',
      'Concession Discount',
      'Amount Paid',
      'Trips Taken',
    ];

    const rows = filteredPasses.map((p) => [
      p.id,
      p.applicationNumber,
      `"${p.passengerName}"`,
      p.email,
      p.phone,
      p.category,
      p.status,
      p.routeId,
      p.startDate,
      p.endDate,
      p.baseAmount,
      p.concessionDiscount,
      p.amountPaid,
      p.tripsTaken,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TransPass_Registry_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Active Smart Passes</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {analytics.active}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Currently in circulation</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Pending Approvals</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {analytics.pending}
          </div>
          <div className="text-[11px] text-amber-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting document review</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total Boardings</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {analytics.totalTaps}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Bus className="w-3.5 h-3.5 text-slate-400" />
            <span>Contactless turnstile taps</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Net Revenue Collected</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {formatCurrency(analytics.totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pass subscriptions</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Concession Subsidies</div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1 tabular-nums">
            {formatCurrency(analytics.totalSubsidies)}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Govt funded relief</span>
          </div>
        </div>
      </div>

      {/* Operations Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('applications')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeSubTab === 'applications'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Pending Verification Queue</span>
          {analytics.pending > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center font-mono">
              {analytics.pending}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('passes')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'passes'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Master Pass Registry ({passes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeSubTab === 'audit'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Central Audit & Validation Log</span>
        </button>
      </div>

      {/* SUB-TAB 1: PENDING APPLICATION VERIFICATION QUEUE */}
      {activeSubTab === 'applications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Pending Citizen Applications</h3>
              <p className="text-xs text-slate-400">
                Verify uploaded student IDs, age certificates, and proof documents before issuing smart pass
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/60">
              {pendingApplications.length} Awaiting Verification
            </span>
          </div>

          {pendingApplications.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white">All Applications Processed</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No commuter applications are waiting in the queue. You can submit a new application from the top bar or
                commuter portal to test the review workflow.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                  <tr>
                    <th className="pb-3">Applicant & Portrait</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Proof Document</th>
                    <th className="pb-3">Route Requested</th>
                    <th className="pb-3">Duration</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {pendingApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/30">
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={app.photoUrl}
                            alt={app.passengerName}
                            className="w-9 h-11 rounded object-cover border border-slate-700 bg-slate-800 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-white font-sans text-xs">{app.passengerName}</div>
                            <div className="text-[10px] text-slate-400">{app.applicationNumber} · {app.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3">
                        <span className="text-emerald-400 font-semibold">{getCategoryLabel(app.category)}</span>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          {app.institutionOrEmployer}
                        </div>
                      </td>

                      <td className="py-3">
                        <div className="text-white">{app.idProofType}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{app.idProofNumber}</div>
                      </td>

                      <td className="py-3">
                        <span className="text-white">{app.routeId}</span>
                      </td>

                      <td className="py-3">
                        <span className="text-slate-300">{app.validityType}</span>
                        <div className="text-[10px] text-slate-400">{app.startDate}</div>
                      </td>

                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedPassForReview(app)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Review Dossier
                        </button>
                        <button
                          onClick={() => approvePass(app.id, 'Officer Admin Quick-Approve')}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-colors"
                        >
                          Approve & Issue
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: MASTER PASS REGISTRY */}
      {activeSubTab === 'passes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          {/* Controls: Search, Filters & CSV Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search passenger, Pass ID, RFID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Categories</option>
                <option value="STUDENT">Student Concession</option>
                <option value="SENIOR">Senior Citizen</option>
                <option value="COMMUTER_STANDARD">Standard Commuter</option>
                <option value="EXPRESS_AIRPORT">Express Airport</option>
                <option value="PHYSICALLY_CHALLENGED">Special Accessibility</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Valid</option>
                <option value="PENDING_APPROVAL">Pending Verification</option>
                <option value="EXPIRED">Expired</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV Ledger</span>
            </button>
          </div>

          {/* Directory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                <tr>
                  <th className="pb-3">Pass ID & Cardholder</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Coverage Route</th>
                  <th className="pb-3">Validity Thru</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Boardings</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredPasses.map((pass) => {
                  const statusColors = getStatusColorClass(pass.status);
                  const isExpired = new Date(pass.endDate) < new Date();

                  return (
                    <tr key={pass.id} className="hover:bg-slate-800/30">
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={pass.photoUrl}
                            alt={pass.passengerName}
                            className="w-8 h-10 rounded object-cover border border-slate-700 bg-slate-800 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-white font-sans text-xs">{pass.passengerName}</div>
                            <div className="text-[10px] text-slate-400">{pass.id} · {pass.rfidCardNumber}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3">
                        <span className="text-white">{getCategoryLabel(pass.category)}</span>
                      </td>

                      <td className="py-3">
                        <span className="text-slate-300 font-semibold">{pass.routeId}</span>
                      </td>

                      <td className="py-3">
                        <span className={isExpired ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                          {pass.endDate}
                        </span>
                      </td>

                      <td className="py-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                        >
                          {getStatusLabel(pass.status)}
                        </span>
                      </td>

                      <td className="py-3 text-emerald-400 font-semibold tabular-nums">
                        {pass.tripsTaken} trips
                      </td>

                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedPassForReview(pass)}
                          className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CENTRAL AUDIT & VALIDATION LOG */}
      {activeSubTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Central Fleet Validation & Inspection Stream</h3>
              <p className="text-xs text-slate-400">
                Audit stream recording every pass scan, turnstile tap, and violation flagged by conductors
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{scanLogs.length} events logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
                <tr>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Pass Identifier</th>
                  <th className="pb-3">Passenger</th>
                  <th className="pb-3">Vehicle / Route</th>
                  <th className="pb-3">Conductor</th>
                  <th className="pb-3">Verification Outcome</th>
                  <th className="pb-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {scanLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 text-slate-400">{formatDateTime(log.timestamp)}</td>
                    <td className="py-3 text-white font-semibold">{log.passId}</td>
                    <td className="py-3 text-slate-200 font-sans">{log.passengerName}</td>
                    <td className="py-3 text-emerald-400">{log.busNumber} ({log.routeCode})</td>
                    <td className="py-3 text-slate-400">{log.conductorName}</td>
                    <td className="py-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          log.scanResult === 'VALID'
                            ? 'text-emerald-400 bg-emerald-950/60'
                            : 'text-rose-400 bg-rose-950/60'
                        }`}
                      >
                        {log.scanResult}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-[11px] font-sans max-w-xs truncate">
                      {log.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ApplicationDetailModal
        pass={selectedPassForReview}
        isOpen={!!selectedPassForReview}
        onClose={() => setSelectedPassForReview(null)}
      />
    </div>
  );
};
