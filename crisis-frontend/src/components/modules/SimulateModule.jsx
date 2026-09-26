'use client';
import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import {
  FlaskConical,
  Play,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react';
import ReportVisualizer from './ReportVisualizer';

const REGIONS = ["Global", "India", "USA", "Europe", "China", "Middle East", "Japan"];

const SIMULATE_PRESETS = [
  { scenario: "Global crude oil production slashed by OPEC+", delta: "25% immediate supply cut", region: "Middle East" },
  { scenario: "Cyberattack cripples Western Europe power grid", delta: "14 days total blackout in 4 nations", region: "Europe" },
  { scenario: "Rare earth mineral export ban enforced", delta: "80% reduction in EV and defense supply", region: "China" },
  { scenario: "US banking sector liquidity shockwave", delta: "30% drop in key credit indexes", region: "USA" },
];

export default function SimulateModule({ onReportGenerated }) {
  const [scenario, setScenario] = useState('');
  const [delta, setDelta] = useState('');
  const [region, setRegion] = useState('Global');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [activeCaseTab, setActiveCaseTab] = useState('base_case');
  const [showFullDossier, setShowFullDossier] = useState(false);

  const handleSimulate = async (customConfig) => {
    const sc = customConfig?.scenario || scenario;
    const dl = customConfig?.delta || delta;
    const rg = customConfig?.region || region;

    if (!sc.trim() || !dl.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);
    setActiveCaseTab('base_case');
    setShowFullDossier(false);

    try {
      const res = await axios.post(`${API_BASE_URL}/simulate`, {
        scenario: sc,
        delta: dl,
        region: rg.toLowerCase(),
      });
      setReport(res.data);
      if (onReportGenerated) onReportGenerated(res.data);
    } catch (err) {
      console.error(err);
      setError(`Simulation failed. Ensure backend is active and reachable at ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  const cases = report?.cases;
  const currentCase = cases ? cases[activeCaseTab] : null;

  return (
    <div className="space-y-6 animate-fade">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Counterfactual Scenario Simulator</h2>
            <span className="tactical-badge badge-indigo text-[10px]">
              BEST / BASE / WORST BRANCHING
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Simulate deep macroeconomic and trade stress-tests with custom delta variance, probability-weighted branches, and quantitative impact ranges.
          </p>
        </div>
      </div>

      {/* Input Parameters */}
      <div className="panel-glass p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Hypothetical Event / Disruption:
            </label>
            <input
              type="text"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="e.g. Strait of Hormuz blocked by naval mines..."
              className="tactical-input"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Delta Variance (Magnitude):
            </label>
            <input
              type="text"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="e.g. +40% oil spike, 60 days outage..."
              className="tactical-input"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Target Region:
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="tactical-input cursor-pointer bg-white"
              disabled={loading}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r} className="bg-white text-slate-900">
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {SIMULATE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setScenario(p.scenario);
                  setDelta(p.delta);
                  setRegion(p.region);
                  handleSimulate(p);
                }}
                disabled={loading}
                className="text-left px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition-colors flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                <span className="truncate max-w-xs">{p.scenario}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => handleSimulate()}
            disabled={loading || !scenario.trim() || !delta.trim()}
            className="btn-tactical bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs w-full sm:w-auto shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Synthesizing Branches...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="panel-glass p-8 space-y-4 border border-purple-200 bg-purple-50/30">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-bold text-purple-900">
              MODELING THREE-BRANCH COUNTERFACTUAL MATRIX ({region.toUpperCase()})...
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Synthesizing Base (60%), Worst (20%), and Best (20%) probability distributions across macroeconomic and trade channels.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Report Branches */}
      {report && cases && (
        <div className="space-y-6 animate-fade">
          {/* Case Branch Switcher Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            {[
              { id: 'base_case', label: 'Base Case', prob: cases.base_case?.probability || 60, color: 'text-blue-700', activeBg: 'bg-blue-600 text-white shadow-xs' },
              { id: 'worst_case', label: 'Worst Case', prob: cases.worst_case?.probability || 20, color: 'text-rose-700', activeBg: 'bg-red-600 text-white shadow-xs' },
              { id: 'best_case', label: 'Best Case', prob: cases.best_case?.probability || 20, color: 'text-emerald-700', activeBg: 'bg-emerald-600 text-white shadow-xs' },
            ].map((tab) => {
              const isSelected = activeCaseTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCaseTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? tab.activeBg
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.prob}% PROBABILITY
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Case Card */}
          {currentCase && (
            <div className="panel-glass p-6 border border-slate-200 bg-white space-y-6">
              {/* Branch Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`tactical-badge ${
                      currentCase.risk_level >= 8 ? 'badge-critical' :
                      currentCase.risk_level >= 5 ? 'badge-warning' : 'badge-success'
                    }`}>
                      THREAT INDEX: {currentCase.risk_level}/10
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-bold">
                      LIKELIHOOD: {currentCase.probability}%
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {currentCase.title}
                  </h3>
                </div>

                <div className="text-xs font-mono text-slate-500 text-right">
                  SCENARIO: <strong className="text-slate-800">{report.scenario}</strong>
                  <div className="text-[11px] text-purple-600 font-bold">DELTA: {report.delta}</div>
                </div>
              </div>

              {/* Summary */}
              <div className="text-sm text-slate-700 leading-relaxed font-normal bg-slate-50 p-4 rounded-xl border border-slate-100">
                {currentCase.executive_summary}
              </div>

              {/* 4 Quantitative Range Gauges */}
              {currentCase.forecast_ranges && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Projected Impact Ranges ({currentCase.name})
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">GDP Growth Impact</span>
                      <span className="text-lg font-mono font-bold text-slate-900 block">{currentCase.forecast_ranges.gdp_impact}</span>
                      <span className="text-[10px] text-slate-400">vs pre-shock baseline</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Commodity / Energy Shock</span>
                      <span className="text-lg font-mono font-bold text-amber-700 block">{currentCase.forecast_ranges.commodity_shock}</span>
                      <span className="text-[10px] text-slate-400">headline spot price spread</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Consumer Inflation Spike</span>
                      <span className="text-lg font-mono font-bold text-rose-700 block">{currentCase.forecast_ranges.inflation_spike}</span>
                      <span className="text-[10px] text-slate-400">CPI passthrough rate</span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Logistics & Supply Lag</span>
                      <span className="text-lg font-mono font-bold text-indigo-700 block">{currentCase.forecast_ranges.logistics_lag}</span>
                      <span className="text-[10px] text-slate-400">transit route delay</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid: Assumptions & Key Impacts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Assumptions */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Key Model Assumptions
                  </div>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    {currentCase.assumptions?.map((asm, idx) => (
                      <li key={idx} className="leading-relaxed">{asm}</li>
                    ))}
                  </ul>
                </div>

                {/* Priority Impacts */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Projected Priority Impacts
                  </div>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    {currentCase.key_impacts?.map((imp, idx) => (
                      <li key={idx} className="leading-relaxed">{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Strategic Directives */}
              {currentCase.actions && currentCase.actions.length > 0 && (
                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Strategic Mitigation Directives ({currentCase.name})
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {currentCase.actions.map((act, idx) => {
                      const actionText = typeof act === 'string' ? act : act.action;
                      const priority = act.priority || 'NORMAL';
                      const horizon = act.time_horizon || 'Immediate';
                      return (
                        <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white text-xs flex flex-col justify-between">
                          <p className="font-semibold text-slate-800 mb-2">{actionText}</p>
                          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100 text-slate-500">
                            <span className={`font-bold px-1.5 py-0.5 rounded ${
                              priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                              priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {priority}
                            </span>
                            <span className="font-mono">{horizon}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inflection Triggers Box */}
          {report.inflection_triggers && (
            <div className="p-5 rounded-xl border border-red-200 bg-red-50/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Critical Inflection Triggers (Base → Worst Case Escalators)
                </div>
                <span className="text-[10px] font-mono font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                  MONITOR CLOSELY
                </span>
              </div>
              <p className="text-xs text-red-900/80">
                The scenario will deteriorate from the Base Case into the Worst Case branch if any of the following conditions trigger:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                {report.inflection_triggers.map((trig, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-red-200/80 text-xs text-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                    <span>{trig}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Dossier Toggle */}
          <div className="pt-2">
            <button
              onClick={() => setShowFullDossier(!showFullDossier)}
              className="btn-tactical btn-tactical-secondary text-xs w-full py-2.5 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>{showFullDossier ? 'Hide Full Multi-Agent Intelligence Dossier' : 'Inspect Full Multi-Agent Intelligence Dossier'}</span>
            </button>

            {showFullDossier && (
              <div className="mt-4">
                <ReportVisualizer
                  report={report.report || report}
                  raw={report.raw || { scenario, delta, region }}
                  title={`Simulation: ${scenario} (${delta})`}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
