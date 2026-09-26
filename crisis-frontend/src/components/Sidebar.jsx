'use client';
import {
  Globe2,
  ShieldAlert,
  FlaskConical,
  GitFork,
  HeartPulse,
  Ship,
  TrendingUp,
  Newspaper,
  Target,
  Scale,
  MapPin,
  Bell,
  Archive,
  ChevronRight,
} from 'lucide-react';

export const WORKSPACE_SECTIONS = [
  {
    id: 'situation',
    title: '1. GLOBAL SITUATION',
    items: [
      { id: 'globe', label: '3D Threat Map', sub: 'Photorealistic Earth & Hotspots', icon: Globe2, color: 'text-blue-600', badge: 'REAL EARTH' },
      { id: 'news', label: 'Live Intelligence Wire', sub: 'Multi-Source Geopolitical Feed', icon: Newspaper, color: 'text-cyan-600' },
    ],
  },
  {
    id: 'intelligence',
    title: '2. INTELLIGENCE SYNTHESIS',
    items: [
      { id: 'analyze', label: 'Threat Analysis Engine', sub: '5-Agent Consensus & Evidence', icon: ShieldAlert, color: 'text-blue-600' },
      { id: 'simulate', label: 'Scenario Simulator', sub: 'Best / Base / Worst Branching', icon: FlaskConical, color: 'text-purple-600' },
      { id: 'chain', label: 'Chain Reaction Model', sub: 'Nth-Order Impact Cascades', icon: GitFork, color: 'text-amber-600' },
    ],
  },
  {
    id: 'supply_markets',
    title: '3. SUPPLY & MARKETS',
    items: [
      { id: 'supply_chain', label: 'Maritime Chokepoints', sub: 'Suez, Hormuz & Panama Rerouting', icon: Ship, color: 'text-indigo-600' },
      { id: 'prices', label: 'Market Intelligence', sub: 'Live Oil, Gas, Grain & FX Tickers', icon: TrendingUp, color: 'text-emerald-600' },
    ],
  },
  {
    id: 'humanitarian',
    title: '4. HUMANITARIAN & RESILIENCE',
    items: [
      { id: 'refugees', label: 'Refugee & Aid Logistics', sub: 'UN SPHERE Standards & Logistics', icon: HeartPulse, color: 'text-rose-600' },
      { id: 'country', label: 'National Vulnerability', sub: 'World Bank Baseline Indicators', icon: MapPin, color: 'text-teal-600' },
      { id: 'compare', label: 'Country Resilience Matrix', sub: 'Cross-Nation Stress Comparison', icon: Scale, color: 'text-yellow-600' },
    ],
  },
  {
    id: 'governance',
    title: '5. AUDIT & DECISION GOVERNANCE',
    items: [
      { id: 'tracker', label: 'Forecast Accuracy Audit', sub: 'AI vs Reality 30-Day Resolution', icon: Target, color: 'text-sky-600', badge: 'AUDIT' },
      { id: 'alerts', label: 'Automated Monitors', sub: 'Price & Threshold Triggers', icon: Bell, color: 'text-pink-600' },
      { id: 'history', label: 'Intelligence Archives', sub: 'Historical Validated Repository', icon: Archive, color: 'text-slate-600' },
    ],
  },
];

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="w-full lg:w-72 shrink-0 border-r border-slate-200 bg-white lg:min-h-[calc(100vh-100px)] p-3.5 flex flex-col gap-5">
      {WORKSPACE_SECTIONS.map((section, sIdx) => (
        <div key={sIdx} className="space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold font-mono tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>{section.title}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{section.items.length}</span>
          </div>

          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group relative ${
                    isActive
                      ? 'bg-blue-50/80 border border-blue-200 text-blue-900 shadow-xs font-medium'
                      : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  {/* Left accent bar on active */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-blue-600" />
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold border border-blue-200">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal">
                        {item.sub}
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-blue-600 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
}
