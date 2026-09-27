'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import Header from '../components/Header';
import LiveTicker from '../components/LiveTicker';
import Sidebar, { WORKSPACE_SECTIONS } from '../components/Sidebar';

// Dynamically import CrisisGlobe (Three.js needs client-side only)
const CrisisGlobe = dynamic(() => import('../components/CrisisGlobe'), {
  ssr: false,
  loading: () => (
    <div className="crisis-globe-card p-12 text-center flex flex-col items-center justify-center min-h-[480px]">
      <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <h3 className="text-base font-bold text-slate-800">Initializing Photorealistic 3D Earth...</h3>
      <p className="text-xs text-slate-500 mt-1">Loading satellite surface textures and crisis hotspot coordinates</p>
    </div>
  ),
});

// Intelligence Modules
import AnalyzeModule from '../components/modules/AnalyzeModule';
import SimulateModule from '../components/modules/SimulateModule';
import ChainReactionModule from '../components/modules/ChainReactionModule';
import RefugeesModule from '../components/modules/RefugeesModule';
import SupplyChainModule from '../components/modules/SupplyChainModule';
import PricesModule from '../components/modules/PricesModule';
import NewsModule from '../components/modules/NewsModule';
import TrackerModule from '../components/modules/TrackerModule';
import CompareModule from '../components/modules/CompareModule';
import CountryModule from '../components/modules/CountryModule';
import AlertsModule from '../components/modules/AlertsModule';
import HistoryModule from '../components/modules/HistoryModule';

export default function Home() {
  const [activeTab, setActiveTab] = useState('globe');
  const [latestReport, setLatestReport] = useState(null);
  const [presetQuery, setPresetQuery] = useState('');

  // Find metadata for current active tab
  let activeModuleMeta = null;
  let activeGroupMeta = null;
  for (const group of WORKSPACE_SECTIONS) {
    const found = group.items.find((i) => i.id === activeTab);
    if (found) {
      activeModuleMeta = found;
      activeGroupMeta = group;
      break;
    }
  }

  // Handle preset selected from 3D Globe to jump directly into Analysis
  const handleGlobeSelectPreset = (query) => {
    setPresetQuery(query);
    setActiveTab('analyze');
  };

  const handleDownloadPDF = async () => {
    if (!latestReport?.data && !latestReport) {
      alert('Please run a Threat Analysis or Scenario Simulation first to generate an exportable dossier.');
      return;
    }
    try {
      const reportPayload = latestReport.data || latestReport;
      const rawPayload = latestReport.raw || {};
      const res = await axios.post(`${API_BASE_URL}/generate-pdf`, {
        event: rawPayload.event || rawPayload.scenario || 'Crisis Intelligence Dossier',
        region: rawPayload.region || 'global',
        report: reportPayload,
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'crisis-decision-dossier.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('PDF generation failed. Ensure backend has reportlab installed.');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-slate-50 text-slate-900">
      {/* 1. Global Navigation Bar */}
      <Header
        onDownloadPDF={handleDownloadPDF}
        hasReport={!!latestReport}
      />

      {/* 2. Real-Time Telemetry Ticker */}
      <LiveTicker />

      {/* 3. Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1700px] w-full mx-auto relative z-10">
        {/* Left: Clean Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tabId) => setActiveTab(tabId)}
        />

        {/* Right: Active Operational Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Breadcrumbs & Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3.5 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <span className="font-semibold text-slate-700">Platform</span>
              <span>/</span>
              <span className="text-slate-600">{activeGroupMeta?.title || 'WORKSPACE'}</span>
              <span>/</span>
              <span className="text-blue-600 font-bold uppercase">{activeModuleMeta?.label || activeTab}</span>
            </div>

            {/* Quick-Access Top Pills for Easy Access */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setActiveTab('globe')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'globe'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                🌍 3D Threat Map
              </button>
              <button
                onClick={() => setActiveTab('analyze')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'analyze'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                ⚡ AI Analysis
              </button>
              <button
                onClick={() => setActiveTab('simulate')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'simulate'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                🧪 Simulator
              </button>
              <button
                onClick={() => setActiveTab('supply_chain')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'supply_chain'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                🚢 Chokepoints
              </button>
              <button
                onClick={() => setActiveTab('prices')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'prices'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                📈 Market Prices
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'news'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                📰 Live Wire
              </button>
            </div>
          </div>

          {/* Module Router */}
          <div className="animate-fade">
            {/* 🌍 3D Threat Map with Real Photorealistic Earth (kept mounted to prevent WebGL context loss) */}
            <div className="space-y-6" style={{ display: activeTab === 'globe' ? 'block' : 'none' }}>
              <CrisisGlobe onSelectPreset={handleGlobeSelectPreset} />
            </div>

            {activeTab === 'analyze' && (
              <AnalyzeModule
                initialEvent={presetQuery}
                onReportGenerated={setLatestReport}
              />
            )}

            {activeTab === 'simulate' && (
              <SimulateModule onReportGenerated={setLatestReport} />
            )}

            {activeTab === 'chain' && (
              <ChainReactionModule />
            )}

            {activeTab === 'refugees' && (
              <RefugeesModule />
            )}

            {activeTab === 'supply_chain' && (
              <SupplyChainModule />
            )}

            {activeTab === 'prices' && (
              <PricesModule />
            )}

            {activeTab === 'news' && (
              <NewsModule />
            )}

            {activeTab === 'tracker' && (
              <TrackerModule />
            )}

            {activeTab === 'compare' && (
              <CompareModule />
            )}

            {activeTab === 'country' && (
              <CountryModule />
            )}

            {activeTab === 'alerts' && (
              <AlertsModule />
            )}

            {activeTab === 'history' && (
              <HistoryModule />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}