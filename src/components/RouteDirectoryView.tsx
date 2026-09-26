import React, { useState } from 'react';
import { usePassContext } from '../context/PassContext';
import { BusRoute } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Bus,
  MapPin,
  Clock,
  PlusCircle,
  X,
  CheckCircle2,
  DollarSign,
  Shield,
  Layers,
} from 'lucide-react';

export const RouteDirectoryView: React.FC = () => {
  const { routes, fareRules, addRoute } = usePassContext();

  const [addRouteOpen, setAddRouteOpen] = useState(false);
  const [newRoute, setNewRoute] = useState({
    code: '',
    name: '',
    origin: '',
    destination: '',
    via: '',
    distanceKm: 20,
    baseFare: 2.5,
    monthlyPassRate: 60,
    isExpressAC: false,
    frequency: 'Every 10 mins',
    operatingHours: '05:30 - 23:30',
  });

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoute.code.trim() || !newRoute.name.trim()) return;

    const routeToAdd: BusRoute = {
      id: `R-${Math.floor(500 + Math.random() * 500)}`,
      code: newRoute.code.toUpperCase(),
      name: newRoute.name,
      origin: newRoute.origin,
      destination: newRoute.destination,
      via: newRoute.via
        ? newRoute.via.split(',').map((s) => s.trim())
        : ['Central Interchange'],
      totalStops: 12,
      distanceKm: Number(newRoute.distanceKm),
      baseFare: Number(newRoute.baseFare),
      monthlyPassRate: Number(newRoute.monthlyPassRate),
      isExpressAC: newRoute.isExpressAC,
      frequency: newRoute.frequency,
      operatingHours: newRoute.operatingHours,
    };

    addRoute(routeToAdd);
    setAddRouteOpen(false);
    setNewRoute({
      code: '',
      name: '',
      origin: '',
      destination: '',
      via: '',
      distanceKm: 20,
      baseFare: 2.5,
      monthlyPassRate: 60,
      isExpressAC: false,
      frequency: 'Every 10 mins',
      operatingHours: '05:30 - 23:30',
    });
  };

  return (
    <div className="space-y-8">
      {/* Visual Hero Banner with Fleet Image */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-56 sm:h-64 flex items-end p-6 sm:p-8">
        <img
          src="/src/assets/images/transit_bus_fleet_1790399119750.jpg"
          alt="Metropolitan Transit Bus Fleet"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={(e) => {
            // Elegant CSS fallback container per Zero-Broken-Image Policy
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Measured Contrast Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Integrated Metropolitan Transit Authority</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Bus Transit Corridors & Concession Tariffs
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Unified fare structure with automated student subsidies, senior allowances, and express corridor
            network passes across all city zones.
          </p>
        </div>
      </div>

      {/* Header with Add Route Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Registered Transit Bus Routes</h2>
          <p className="text-xs text-slate-400">
            Fixed line services, express corridors, and network-wide coverage tariffs
          </p>
        </div>

        <button
          onClick={() => setAddRouteOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Transit Route</span>
        </button>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <div
            key={route.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60">
                  {route.code}
                </span>
                <span className="text-xs font-mono text-slate-400">{route.operatingHours}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{route.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{route.origin} ⇄ {route.destination}</span>
                </div>
              </div>

              {route.via && route.via.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Waypoints</div>
                  <div className="flex flex-wrap gap-1">
                    {route.via.map((stop, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-1.5 py-0.5 bg-slate-950 text-slate-300 rounded border border-slate-800"
                      >
                        {stop}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Headway Frequency</span>
                <span className="text-white font-mono">{route.frequency}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Standard Monthly Pass</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">
                  {formatCurrency(route.monthlyPassRate)} / mo
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Student Concession (60% off)</span>
                <span className="text-blue-400 font-semibold font-mono">
                  {formatCurrency(Math.round(route.monthlyPassRate * 0.4))} / mo
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Concession Policy Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Shield className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Statutory Transit Concession & Subsidy Matrix</h3>
            <p className="text-xs text-slate-400">
              Government gazetted tariff relief rules enforced across digital smart passes
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono">
              <tr>
                <th className="pb-3">Passenger Category</th>
                <th className="pb-3">Subsidy Discount</th>
                <th className="pb-3">Eligibility Requirement</th>
                <th className="pb-3">Documentary Proof Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {fareRules.map((rule) => (
                <tr key={rule.category} className="hover:bg-slate-800/20">
                  <td className="py-3 font-semibold text-white">
                    {rule.category.replace('_', ' ')}
                  </td>
                  <td className="py-3 font-mono font-bold text-emerald-400 text-sm">
                    {rule.discountPercentage}% OFF
                  </td>
                  <td className="py-3 text-slate-300">{rule.eligibleCriteria}</td>
                  <td className="py-3 text-slate-400 text-[11px]">{rule.proofRequirements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Route Modal */}
      {addRouteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Register New Transit Route</h3>
              </div>
              <button
                onClick={() => setAddRouteOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Route Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 502X or EXP-12"
                    value={newRoute.code}
                    onChange={(e) => setNewRoute({ ...newRoute, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Monthly Pass Rate ($) *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={500}
                    value={newRoute.monthlyPassRate}
                    onChange={(e) => setNewRoute({ ...newRoute, monthlyPassRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Route Title / Line Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. West Coast Terminal ⇄ High-Tech Boulevard"
                  value={newRoute.name}
                  onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Origin Station *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. West Coast Bay 3"
                    value={newRoute.origin}
                    onChange={(e) => setNewRoute({ ...newRoute, origin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Destination Station *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Innovation Gate"
                    value={newRoute.destination}
                    onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Via Interchanges (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Central Metro, General Hospital, City Park"
                  value={newRoute.via}
                  onChange={(e) => setNewRoute({ ...newRoute, via: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Frequency</label>
                  <input
                    type="text"
                    placeholder="Every 8 mins"
                    value={newRoute.frequency}
                    onChange={(e) => setNewRoute({ ...newRoute, frequency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Operating Hours</label>
                  <input
                    type="text"
                    placeholder="05:30 - 23:30"
                    value={newRoute.operatingHours}
                    onChange={(e) => setNewRoute({ ...newRoute, operatingHours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="expressAC"
                  checked={newRoute.isExpressAC}
                  onChange={(e) => setNewRoute({ ...newRoute, isExpressAC: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 rounded bg-slate-900 border-slate-700"
                />
                <label htmlFor="expressAC" className="text-slate-300 cursor-pointer">
                  Express Air-Conditioned Fleet Service
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddRouteOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-lg transition-colors"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
