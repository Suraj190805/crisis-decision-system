'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import {
  ShieldAlert, Search, Sparkles, AlertCircle, RefreshCw, Cpu, CheckCircle,
  Target, TrendingUp, Users, Zap, ChevronDown, ChevronUp, Clock,
  AlertTriangle, Shield, Activity, FileText, ArrowRight, Eye, Gauge
} from 'lucide-react';
import ReportVisualizer from './ReportVisualizer';

const ANALYZE_PRESETS = [
  "Taiwan Strait naval blockade halts semiconductor exports",
  "Iran closes Strait of Hormuz, cutting 20% of global oil transit",
  "Black Sea grain corridor closed indefinitely amid escalated conflict",
  "Severe drought in Panama Canal halts 30% of global container transit",
  "Red Sea shipping attacks halt Suez Canal container traffic, spiking freight rates 250%",
];

const AGENT_STAGES = [
  { key: 'data', label: 'Data Ingestion', icon: '📡', desc: 'News, Markets, World Bank' },
  { key: 'economic', label: 'Economic Agent', icon: '📊', desc: 'GDP, Inflation, Currency' },
  { key: 'trade', label: 'Trade Agent', icon: '🚢', desc: 'Routes, Imports, Delays' },
  { key: 'energy', label: 'Energy Agent', icon: '⚡', desc: 'Oil, Gas, Pipelines' },
  { key: 'humanitarian', label: 'Humanitarian Agent', icon: '🏥', desc: 'Displacement, Aid, Needs' },
  { key: 'coordinator', label: 'Decision Coordinator', icon: '🎯', desc: 'Consensus, Recommendations' },
];

const RISK_COLORS = {
  CRITICAL: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800 border-red-300', dot: 'bg-red-500' },
  HIGH: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800 border-orange-300', dot: 'bg-orange-500' },
  MODERATE: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  LOW: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800 border-green-300', dot: 'bg-green-500' },
};

const TIER_LABELS = {
  1: { label: 'Tier 1 · Official', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  2: { label: 'Tier 2 · Established', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  3: { label: 'Tier 3 · Secondary', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  4: { label: 'Tier 4 · Unverified', color: 'bg-red-100 text-red-800 border-red-300' },
};

function ConfidenceBar({ value, size = 'md' }) {
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';
  const color = value >= 75 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className={`w-full ${h} bg-slate-100 rounded-full overflow-hidden`}>
      <div className={`${h} ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />
    </div>
  );
}

function AgentProgressPanel({ currentStage }) {
  return (
    <div className="panel-glass p-6 space-y-5 border border-blue-200 bg-gradient-to-br from-blue-50/40 to-white">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-bold text-blue-900">
          MULTI-AGENT ANALYSIS IN PROGRESS
        </div>
      </div>
      <p className="text-xs text-slate-600">
        Dispatching 5 specialized autonomous AI agents. Each independently investigates, then the Decision Coordinator synthesizes a consensus assessment.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {AGENT_STAGES.map((stage, idx) => {
          const isComplete = idx < currentStage;
          const isActive = idx === currentStage;
          const isPending = idx > currentStage;
          return (
            <div
              key={stage.key}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all duration-500
                ${isComplete ? 'bg-emerald-50 border-emerald-200' : ''}
                ${isActive ? 'bg-blue-50 border-blue-300 shadow-sm shadow-blue-200/50 ring-1 ring-blue-200' : ''}
                ${isPending ? 'bg-white border-slate-200 opacity-50' : ''}
              `}
            >
              <span className="text-xl">{stage.icon}</span>
              <span className="text-[10px] font-bold text-slate-700 leading-tight">{stage.label}</span>
              <span className="text-[9px] text-slate-500">{stage.desc}</span>
              <div className="mt-auto">
                {isComplete && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                {isActive && <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                {isPending && <div className="w-2 h-2 rounded-full bg-slate-300" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyzeModule({ initialEvent = '', onReportGenerated }) {
  const [event, setEvent] = useState(initialEvent);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [agentStage, setAgentStage] = useState(0);
  const [showEvidence, setShowEvidence] = useState(false);
  const [showRawReport, setShowRawReport] = useState(false);
  const stageTimerRef = useRef(null);

  useEffect(() => {
    if (initialEvent) {
      setEvent(initialEvent);
    }
  }, [initialEvent]);

  // Simulate agent progress during loading
  useEffect(() => {
    if (loading) {
      setAgentStage(0);
      let stage = 0;
      stageTimerRef.current = setInterval(() => {
        stage++;
        if (stage < AGENT_STAGES.length) {
          setAgentStage(stage);
        }
      }, 6000); // ~6s per agent
      return () => clearInterval(stageTimerRef.current);
    } else {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current);
      setAgentStage(0);
    }
  }, [loading]);

  const handleAnalyze = async (overrideEvent) => {
    const query = overrideEvent || event;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/analyze`, { event: query });
      setReport(res.data);
      if (onReportGenerated) onReportGenerated(res.data);
    } catch (err) {
      console.error(err);
      setError(`Analysis failed. Ensure the backend is reachable at ${API_BASE_URL}.`);
    } finally {
      setLoading(false);
    }
  };

  const structured = report?.structured;

  return (
    <div className="space-y-6">
      {/* Module Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Threat Analysis Engine</h2>
          </div>
          <p className="text-xs text-slate-500">
            5-agent consensus crew with evidence provenance, confidence calibration, and actionable decision recommendations.
          </p>
        </div>
        <span className="tactical-badge badge-info text-[11px] w-fit">
          EVIDENCE-BACKED INTELLIGENCE
        </span>
      </div>

      {/* Input Section */}
      <div className="panel-glass p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Enter Incident or Geopolitical Trigger:
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleAnalyze()}
                placeholder="e.g. Severe drought in Panama Canal halts 30% of global container transit..."
                className="tactical-input pl-10"
                disabled={loading}
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !event.trim()}
              className="btn-tactical btn-tactical-primary sm:w-48"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Scenario Presets */}
        <div>
          <div className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
            Quick Intel Scenarios:
          </div>
          <div className="flex flex-wrap gap-2">
            {ANALYZE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setEvent(preset);
                  handleAnalyze(preset);
                }}
                disabled={loading}
                className="text-left px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition-colors flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span className="truncate max-w-sm">{preset}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Progress Animation */}
      {loading && <AgentProgressPanel currentStage={agentStage} />}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* ─── STRUCTURED INTELLIGENCE REPORT ─── */}
      {structured && (
        <div className="space-y-5">

          {/* ── TOP THREAT CARD ── */}
          <div className={`panel-glass p-6 space-y-4 border-2 ${
            structured.overall_risk_level >= 8 ? 'border-red-300 bg-red-50/30' :
            structured.overall_risk_level >= 5 ? 'border-orange-300 bg-orange-50/30' :
            'border-emerald-300 bg-emerald-50/30'
          }`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className={`text-3xl font-black ${
                    structured.overall_risk_level >= 8 ? 'text-red-700' :
                    structured.overall_risk_level >= 5 ? 'text-orange-700' :
                    'text-emerald-700'
                  }`}>
                    RISK {structured.overall_risk_level}/10
                  </div>
                  {structured.confidence && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200">
                      <Gauge className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold text-slate-800">{structured.confidence}% confidence</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-700 max-w-2xl leading-relaxed">{structured.executive_summary}</p>
              </div>

              {/* Evidence & Freshness Badges */}
              <div className="flex flex-col gap-2 text-xs">
                {structured.evidence_summary && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-medium text-slate-700">{structured.evidence_summary.length} sources cited</span>
                  </div>
                )}
                {report?.data_freshness?.ai_analysis && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-600">Generated {report.data_freshness.ai_analysis.age}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Confidence Bar */}
            {structured.confidence && (
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Consensus Confidence</span>
                  <span className="font-bold">{structured.confidence}%</span>
                </div>
                <ConfidenceBar value={structured.confidence} />
              </div>
            )}
          </div>

          {/* ── WHY THIS RISK? — Key Drivers ── */}
          {structured.key_drivers && structured.key_drivers.length > 0 && (
            <div className="panel-glass p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Why This Risk?
              </h3>
              <div className="flex flex-wrap gap-2">
                {structured.key_drivers.map((driver, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
                    {driver}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── PER-AGENT ASSESSMENT PANEL ── */}
          {structured.agent_assessments && (
            <div className="panel-glass p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                Agent Assessment Panel
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(structured.agent_assessments).map(([agent, data]) => {
                  const riskLevel = typeof data === 'object' ? (data.risk || 'MODERATE') : data;
                  const confidence = typeof data === 'object' ? data.confidence : null;
                  const colors = RISK_COLORS[riskLevel] || RISK_COLORS.MODERATE;
                  return (
                    <div key={agent} className={`p-4 rounded-xl border ${colors.bg} ${colors.border} space-y-2`}>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {agent.charAt(0).toUpperCase() + agent.slice(1)}
                      </div>
                      <div className={`text-sm font-black ${colors.text}`}>
                        {riskLevel}
                      </div>
                      {confidence && (
                        <div className="space-y-1">
                          <div className="text-[10px] text-slate-500">{confidence}% confidence</div>
                          <ConfidenceBar value={confidence} size="sm" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Disagreements & Consensus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                {structured.disagreements && structured.disagreements.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="text-[10px] font-bold uppercase text-amber-700 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3" /> Disagreements
                    </div>
                    <ul className="text-xs text-amber-800 space-y-1">
                      {structured.disagreements.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {structured.consensus_drivers && structured.consensus_drivers.length > 0 && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] font-bold uppercase text-emerald-700 mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3" /> Consensus
                    </div>
                    <ul className="text-xs text-emerald-800 space-y-1">
                      {structured.consensus_drivers.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DECISION RECOMMENDATIONS ── */}
          {structured.recommended_actions && structured.recommended_actions.length > 0 && (
            <div className="panel-glass p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                Decision Recommendations
              </h3>
              <div className="space-y-3">
                {structured.recommended_actions.map((action, i) => {
                  const isObj = typeof action === 'object';
                  const priority = isObj ? action.priority : 'MEDIUM';
                  const priorityColor = priority === 'HIGH' ? 'bg-red-100 text-red-800 border-red-300' :
                                        priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                        'bg-green-100 text-green-800 border-green-300';
                  return (
                    <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-200 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-400">#{i + 1}</span>
                          <span className="text-sm font-semibold text-slate-900">
                            {isObj ? action.action : action}
                          </span>
                        </div>
                        {isObj && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor}`}>
                            {priority}
                          </span>
                        )}
                      </div>
                      {isObj && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 mt-2">
                          {action.reason && (
                            <div>
                              <span className="font-semibold text-slate-500">Why: </span>
                              {action.reason}
                            </div>
                          )}
                          {action.trigger && (
                            <div>
                              <span className="font-semibold text-slate-500">Trigger: </span>
                              <span className="font-mono text-blue-700">{action.trigger}</span>
                            </div>
                          )}
                          {action.time_horizon && (
                            <div>
                              <span className="font-semibold text-slate-500">Horizon: </span>
                              {action.time_horizon}
                            </div>
                          )}
                        </div>
                      )}
                      {isObj && action.confidence && (
                        <div className="mt-2">
                          <ConfidenceBar value={action.confidence} size="sm" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PREDICTED IMPACTS ── */}
          {structured.top_5_predicted_impacts && (
            <div className="panel-glass p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Predicted Impacts
              </h3>
              <div className="space-y-2">
                {structured.top_5_predicted_impacts.map((impact, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs font-mono font-bold text-blue-600 mt-0.5">{i + 1}</span>
                    <span className="text-xs text-slate-700">{impact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FORECAST RANGES ── */}
          {structured.forecasts && Object.keys(structured.forecasts).length > 0 && (
            <div className="panel-glass p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Forecast Ranges
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(structured.forecasts).map(([key, val]) => {
                  if (!val || typeof val !== 'object') return null;
                  return (
                    <div key={key} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-slate-500">{val.low}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-sm font-bold text-slate-900">{val.base}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{val.high}</span>
                      </div>
                      {val.confidence && (
                        <div className="space-y-1">
                          <div className="text-[10px] text-slate-500">{val.confidence}% confidence</div>
                          <ConfidenceBar value={val.confidence} size="sm" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── UNCERTAINTIES ── */}
          {structured.uncertainties && structured.uncertainties.length > 0 && (
            <div className="panel-glass p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Uncertainties & Limitations
              </h3>
              <div className="space-y-2">
                {structured.uncertainties.map((u, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-800 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                    {u}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EVIDENCE DRAWER ── */}
          {structured.evidence_summary && structured.evidence_summary.length > 0 && (
            <div className="panel-glass overflow-hidden">
              <button
                onClick={() => setShowEvidence(!showEvidence)}
                className="w-full p-4 flex items-center justify-between text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Evidence Sources ({structured.evidence_summary.length})
                </div>
                {showEvidence ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {showEvidence && (
                <div className="px-4 pb-4 space-y-2 border-t border-slate-200">
                  {structured.evidence_summary.map((ev, i) => {
                    const tierInfo = TIER_LABELS[ev.tier] || TIER_LABELS[3];
                    return (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${tierInfo.color}`}>
                          {tierInfo.label}
                        </span>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-slate-700">{ev.claim}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Source: {ev.source}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── 30-DAY OUTLOOK ── */}
          {structured['30_day_outlook'] && (
            <div className="panel-glass p-5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                30-Day Outlook
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{structured['30_day_outlook']}</p>
            </div>
          )}

          {/* ── RAW REPORT TOGGLE ── */}
          <div className="panel-glass overflow-hidden">
            <button
              onClick={() => setShowRawReport(!showRawReport)}
              className="w-full p-3 flex items-center justify-between text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
            >
              <span>View Raw Agent Output</span>
              {showRawReport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showRawReport && (
              <div className="px-4 pb-4 border-t border-slate-200">
                <pre className="text-[10px] text-slate-600 whitespace-pre-wrap font-mono mt-3 max-h-60 overflow-y-auto">
                  {report?.report || 'No raw output available'}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fallback: Legacy Report Visualizer (if no structured data) */}
      {report && !structured && (
        <ReportVisualizer
          report={report.data || report}
          raw={report.raw || { event }}
          title={event}
        />
      )}
    </div>
  );
}
