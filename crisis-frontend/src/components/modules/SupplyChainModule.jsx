'use client';
import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import { Ship, Anchor, AlertTriangle, RefreshCw, Compass, DollarSign, Clock } from 'lucide-react';

const SUPPLY_CHAIN_PRESETS = [
  "Strait of Hormuz blocked by naval minefields and drone strikes",
  "Bab el-Mandeb strait contested — container carriers forced around Cape of Good Hope",
  "Panama Canal daily vessel transit slashed to 18 ships amid unprecedented drought",
  "Malacca Strait piracy and maritime standoff halts East Asian crude tankers",
];

export default function SupplyChainModule() {
  const [disruption, setDisruption] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePredict = async (overrideDisruption) => {
    const q = overrideDisruption || disruption;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/supply-chain`, {
        disruption: q,
        region: 'global',
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Supply chain calculation failed. Verify backend is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Ship className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Maritime & Supply Chain Outage Predictor
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Dedicated External Source Auditor agent calculates maritime chokepoint blockage, rerouting transit lags, and freight index spikes.
          </p>
        </div>
        <span className="tactical-badge badge-indigo text-[11px] w-fit">
          CHOKEPOINT AUDIT
        </span>
      </div>

      {/* Input Form */}
      <div className="panel-glass p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Enter Maritime or Transit Disruption Incident:
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={disruption}
              onChange={(e) => setDisruption(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handlePredict()}
              placeholder="e.g. Bab el-Mandeb strait blocked by missile strikes..."
              className="tactical-input flex-1"
              disabled={loading}
            />
            <button
              onClick={() => handlePredict()}
              disabled={loading || !disruption.trim()}
              className="btn-tactical bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs sm:w-44 shrink-0 font-semibold"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Audit Outage</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {SUPPLY_CHAIN_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDisruption(p);
                handlePredict(p);
              }}
              disabled={loading}
              className="text-left px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition-colors flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span className="truncate max-w-sm">{p}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="panel-glass p-8 space-y-4 border border-indigo-200 bg-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-bold text-indigo-900">
              CALCULATING VESSEL TRANSIT DELAYS & FREIGHT RATE SPIKES...
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Modeling Cape of Good Hope rerouting schedules, bunker fuel burn surcharges, and container slot deficits.
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
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="panel-glass p-5 border-l-4 border-l-amber-500 bg-white">
              <div className="flex items-center justify-between text-amber-800 mb-1">
                <span className="text-xs font-semibold uppercase">Transit Delay Lag</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black font-mono text-slate-900">
                +{result.estimated_shipping_delays_days || '12-18'} <span className="text-base text-slate-500">Days</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">Average maritime detour lag</span>
            </div>

            <div className="panel-glass p-5 border-l-4 border-l-red-500 bg-white">
              <div className="flex items-center justify-between text-red-800 mb-1">
                <span className="text-xs font-semibold uppercase">Freight Rate Spike</span>
                <DollarSign className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-3xl font-black font-mono text-red-600">
                +{result.freight_cost_increase_pct || '65'}%
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">Spot container freight index surge</span>
            </div>

            <div className="panel-glass p-5 border-l-4 border-l-indigo-500 bg-white">
              <div className="flex items-center justify-between text-indigo-800 mb-1">
                <span className="text-xs font-semibold uppercase">Daily Economic Loss</span>
                <AlertTriangle className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black font-mono text-slate-900">
                {result.economic_damage_est || '$4.2B / Day'}
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">Global trade throughput value</span>
            </div>
          </div>

          {/* Chokepoints & Commodities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Chokepoints */}
            <div className="panel-glass p-5 space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-indigo-700 font-bold flex items-center gap-2">
                <Anchor className="w-4 h-4 text-indigo-600" />
                Vulnerable Maritime Corridors & Chokepoints
              </h4>
              <div className="space-y-2">
                {(result.chokepoints_affected || ['Strait of Hormuz', 'Bab el-Mandeb', 'Suez Canal']).map((cp, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800">{typeof cp === 'string' ? cp : cp.name}</span>
                    <span className="tactical-badge badge-critical text-[10px]">THREAT ELEVATED</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Commodities */}
            <div className="panel-glass p-5 space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-amber-800 font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Commodities at Supply Risk
              </h4>
              <div className="flex flex-wrap gap-2">
                {(result.vulnerable_commodities || ['Crude Oil', 'LNG', 'Wheat', 'Fertilizer', 'Semiconductors', 'Refined Fuels']).map((com, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {com}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Rerouting Options */}
          {result.rerouting_options && (
            <div className="panel-glass p-5 border border-slate-200 bg-white">
              <h4 className="text-xs uppercase tracking-wider text-slate-800 font-bold mb-3 flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                Alternative Routing Feasibility & Bunkering Overhead
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(Array.isArray(result.rerouting_options) ? result.rerouting_options : [result.rerouting_options]).map((opt, idx) => (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                    <span className="text-blue-700 font-bold block mb-1">OPTION {idx + 1}</span>
                    <p className="text-slate-700 leading-relaxed">{typeof opt === 'string' ? opt : JSON.stringify(opt)}</p>
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
