/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PassProvider, usePassContext } from './context/PassContext';
import { Navbar } from './components/Navbar';
import { CommuterView } from './components/CommuterView';
import { ConductorScannerView } from './components/ConductorScannerView';
import { AdminOperationsView } from './components/AdminOperationsView';
import { RouteDirectoryView } from './components/RouteDirectoryView';
import { PassApplicationModal } from './components/PassApplicationModal';
import { BusPass } from './types';
import { ShieldCheck, Bus, HelpCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, setCurrentCommuterPassId } = usePassContext();
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const handleApplicationSuccess = (newPass: BusPass) => {
    setCurrentCommuterPassId(newPass.id);
    setActiveTab('commuter');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Bar with 3-Zone Contract */}
      <Navbar onOpenApplyModal={() => setApplyModalOpen(true)} />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'commuter' && (
          <CommuterView onOpenApplyModal={() => setApplyModalOpen(true)} />
        )}

        {activeTab === 'conductor' && <ConductorScannerView />}

        {activeTab === 'admin' && <AdminOperationsView />}

        {activeTab === 'routes' && <RouteDirectoryView />}
      </main>

      {/* Application Creation Modal */}
      <PassApplicationModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={handleApplicationSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>TransPass Transit Authority · Smart Bus Fare & Concession System</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Customer Service: 1-800-555-TRANSIT</span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('routes')}
              className="hover:text-slate-300 transition-colors"
            >
              Route Maps & Timetables
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('conductor')}
              className="hover:text-slate-300 transition-colors"
            >
              Conductor Access
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <PassProvider>
      <MainLayout />
    </PassProvider>
  );
}
