'use client';
import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import {
  GitFork,
  AlertTriangle,
  RefreshCw,
  Zap,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  History,
  HelpCircle,
  Play
} from 'lucide-react';

const CHAIN_PRESETS = [
  "Taiwan TSMC semiconductor fab halted by cyber attack",
  "Suez Canal blocked by massive container collision",
  "Major Middle East oil refinery cluster struck by missile barrage",
  "Panama Canal locks suffer severe mechanical failure during drought",
];

export default function ChainReactionModule() {
  const [event, setEvent] = useState('');
  const [region, setRegion] = useState('global');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleNodeExpand = (key) => {
    setExpandedNodes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRun = async (overrideEvent) => {
    const q = overrideEvent || event;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setExpandedNodes({});

    try {
      const res = await axios.post(`${API_BASE_URL}/chain-reaction`, {
        event: q,
        region,
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Chain reaction cascade analysis failed. Verify backend is active.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract chain links
  const getChainLinks = () => {
    if (!result) return [];
    if (Array.isArray(result.chain) && result.chain.length > 0) return result.chain;
    if (result.chain_reaction && Array.isArray(result.chain_reaction.chain)) return result.chain_reaction.chain;
    return [];
  };

  const chain = getChainLinks();
  const firstOrder = chain.filter((c) => c.order === 1 || c.tier === 1);
  const secondOrder = chain.filter((c) => c.order === 2 || c.tier === 2);
  const thirdOrder = chain.filter((c) => c.order === 3 || c.tier === 3);

  // Fallback if links don't have order
  const resolvedFirst = firstOrder.length > 0 ? firstOrder : chain.slice(0, 2);
  const resolvedSecond = secondOrder.length > 0 ? secondOrder : chain.slice(2, 4);
  const resolvedThird = thirdOrder.length > 0 ? thirdOrder : chain.slice(4, 6);

  const cascadeRisk = result?.overall_cascade_risk || result?.chain_reaction?.overall_cascade_risk || 7;
  const cascadeSummary = result?.cascade_summary || result?.chain_reaction?.cascade_summary || '';
  const circuitBreakers = result?.potential_circuit_breakers || result?.chain_reaction?.potential_circuit_breakers || [];
  const qualityNote = result?.data_quality_note || result?.chain_reaction?.data_quality_note || '';

  const renderTier = (tierNodes, tierTitle, tierNum, colorClass, badgeStyle, defaultProb) => {
    if (!tierNodes || tierNodes.length === 0) return null;

    return (
      <div className="chain-node relative pl-8 sm:pl-10 pb-8">
        {/* Step Indicator Dot */}
        <div
          className={`absolute left-0 top-0 w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-sm z-10 ${badgeStyle} shadow-xs`}
        >
          {tierNum}
        </div>

        <div className="panel-glass p-5 border border-slate-200 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${colorClass}`} />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                {tierTitle}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {tierNodes.length} IMPACT VECTORS IDENTIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {tierNodes.map((item, idx) => {
              const nodeKey = `${tierNum}-${idx}`;
              const isExpanded = !!expandedNodes[nodeKey];
              const prob = item.probability || defaultProb;
              const conf = item.confidence || 75;
              const severity = item.severity || (tierNum === 1 ? 'critical' : tierNum === 2 ? 'high' : 'moderate');
              const timeframe = item.timeframe || (tierNum === 1 ? '0–14 days' : tierNum === 2 ? '1–3 months' : '6+ months');

              return (
                <div
                  key={idx}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3 hover:border-slate-300 transition-all"
                >
                  {/* Top Bar: Node ID, Severity, Probability */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-2">
                    <span className="font-mono text-[11px] text-slate-600 font-bold">
                      NODE {tierNum}.{idx + 1}: <strong className="text-slate-900">{item.title || `Vector ${idx + 1}`}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        severity === 'critical' ? 'bg-red-100 text-red-700' :
                        severity === 'high' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {severity}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {prob}% PROBABILITY
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-700 leading-relaxed font-normal">
                    {item.description || item.impact || (typeof item === 'string' ? item : JSON.stringify(item))}
                  </p>

                  {/* Metadata Row: Timeframe, Sectors, Confidence */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{timeframe}</span>
                    </div>

                    {item.affected_sectors && item.affected_sectors.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.affected_sectors.map((sec, sIdx) => (
                          <span key={sIdx} className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded">
                            {sec}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className="font-mono text-[10px] text-slate-500">
                      Conf: <strong className="text-slate-700">{conf}%</strong>
                    </span>
                  </div>

                  {/* Interactive Details Toggle (Precedent & Uncertainty) */}
                  {(item.historical_precedent || item.uncertainty) && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => toggleNodeExpand(nodeKey)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between w-full"
                      >
                        <span>{isExpanded ? 'Hide Validation Provenance' : 'Inspect Historical Precedent & Uncertainties'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 p-3 rounded-lg bg-white border border-slate-200 space-y-2 text-[11px] animate-fade">
                          {item.historical_precedent && (
                            <div>
                              <span className="font-bold text-purple-700 flex items-center gap-1 mb-0.5">
                                <History className="w-3 h-3 text-purple-600" />
                                Verified Historical Analogue:
                              </span>
                              <p className="text-slate-600 leading-relaxed">{item.historical_precedent}</p>
                            </div>
                          )}

                          {item.uncertainty && (
                            <div>
                              <span className="font-bold text-amber-700 flex items-center gap-1 mb-0.5">
                                <HelpCircle className="w-3 h-3 text-amber-600" />
                                Key Transmission Uncertainty:
                              </span>
                              <p className="text-slate-600 leading-relaxed">{item.uncertainty}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitFork className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Chain Reaction Cascade Model
            </h2>
            <span className="tactical-badge badge-warning text-[10px]">
              NTH-ORDER PROPAGATION
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Traces multi-tier domino propagation across immediate (1st order), indirect (2nd order), and structural (3rd order) vectors with calibrated probabilities and historical analogues.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="panel-glass p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Enter Primary Catalyst Trigger:
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleRun()}
              placeholder="e.g. Taiwan TSMC semiconductor fab halted by cyber attack..."
              className="tactical-input flex-1"
              disabled={loading}
            />
            <button
              onClick={() => handleRun()}
              disabled={loading || !event.trim()}
              className="btn-tactical bg-amber-600 hover:bg-amber-700 text-white shadow-xs sm:w-48 shrink-0 font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Modeling Tree...</span>
                </>
              ) : (
                <>
                  <GitFork className="w-4 h-4" />
                  <span>Trace Cascade</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {CHAIN_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setEvent(p);
                handleRun(p);
              }}
              disabled={loading}
              className="text-left px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition-colors flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span className="truncate max-w-sm">{p}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="panel-glass p-8 space-y-4 border border-amber-200 bg-amber-50/20">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-bold text-amber-900">
              TRACING MULTI-TIER IMPACT PROPAGATION TREE...
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Cross-referencing historical analogues, live financial correlations, and trade dependency matrices to compute transition probabilities.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade">
          {/* Cascade Summary Banner */}
          <div className="panel-glass p-6 border border-slate-200 bg-white space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className={`tactical-badge ${
                  cascadeRisk >= 8 ? 'badge-critical' : cascadeRisk >= 5 ? 'badge-warning' : 'badge-success'
                }`}>
                  CASCADE THREAT: {cascadeRisk}/10
                </span>
                <span className="text-xs font-mono text-slate-500">
                  EVENT: <strong className="text-slate-800">{result.event}</strong>
                </span>
              </div>
              {qualityNote && (
                <span className="text-[11px] font-mono text-slate-400">
                  {qualityNote}
                </span>
              )}
            </div>

            {cascadeSummary && (
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {cascadeSummary}
              </p>
            )}
          </div>

          {/* 3 Tiers of Impact Propagation */}
          <div className="relative border-l-2 border-slate-200 ml-4 pl-2 space-y-6">
            {renderTier(
              resolvedFirst,
              "1st Order: Immediate Direct Impacts (0–14 Days)",
              1,
              "text-red-600",
              "bg-red-500 text-white",
              85
            )}
            {renderTier(
              resolvedSecond,
              "2nd Order: Indirect Economic & Supply Ripples (1–3 Months)",
              2,
              "text-amber-600",
              "bg-amber-500 text-white",
              65
            )}
            {renderTier(
              resolvedThird,
              "3rd Order: Long-Term Geopolitical & Structural Shifts (6+ Months)",
              3,
              "text-blue-600",
              "bg-blue-600 text-white",
              45
            )}
          </div>

          {/* Strategic Circuit Breakers Panel */}
          {circuitBreakers && circuitBreakers.length > 0 && (
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Strategic Circuit Breakers (Cascade Interruption Points)
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  DECISION INTERVENTIONS
                </span>
              </div>

              <p className="text-xs text-emerald-900/80">
                Actionable policy or operational levers designed to de-couple nodes and prevent the domino sequence from propagating to Tier 3:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {circuitBreakers.map((cb, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-xl border border-emerald-200 text-xs space-y-1">
                    <span className="font-mono text-[10px] text-emerald-600 font-bold block">
                      CIRCUIT BREAKER #{idx + 1}
                    </span>
                    <p className="font-medium text-slate-800 leading-relaxed">
                      {typeof cb === 'string' ? cb : cb.action || JSON.stringify(cb)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
