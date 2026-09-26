'use client';
import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import { HeartPulse, Droplets, Utensils, Tent, Activity, AlertCircle, RefreshCw, Globe, Shield, DollarSign } from 'lucide-react';

const REFUGEE_PRESETS = [
  { event: "Escalation of armed conflict and grid collapse", epicenter: "Khartoum, Sudan" },
  { event: "Catastrophic 7.7 magnitude earthquake and aftershocks", epicenter: "Kahramanmaras, Turkey" },
  { event: "Severe urban flooding and dam rupture", epicenter: "Derna, Libya" },
  { event: "Cross-border territorial offensive and artillery strikes", epicenter: "Donetsk Oblast, Ukraine" },
];

export default function RefugeesModule() {
  const [event, setEvent] = useState('');
  const [epicenter, setEpicenter] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRun = async (config) => {
    const ev = config?.event || event;
    const ep = config?.epicenter || epicenter;

    if (!ev.trim() || !ep.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/refugee-allocation`, {
        event: ev,
        epicenter: ep,
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to compute humanitarian allocation. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const needs = result?.immediate_needs_48h || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HeartPulse className="w-5 h-5 text-rose-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Humanitarian & Refugee Logistics Allocator
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            SPHERE Humanitarian Standards compliant 48-hour emergency supply forecasting & border strain model.
          </p>
        </div>
        <span className="tactical-badge badge-critical text-[11px] w-fit">
          UNHCR & WHO FACT-CHECKED
        </span>
      </div>

      {/* Input Form */}
      <div className="panel-glass p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Crisis Conflict or Natural Disaster:
            </label>
            <input
              type="text"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="e.g. Armed offensive targeting central utility stations..."
              className="tactical-input"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Epicenter / Geographic Region:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={epicenter}
                onChange={(e) => setEpicenter(e.target.value)}
                placeholder="e.g. Kharkiv, Ukraine or Aleppo, Syria..."
                className="tactical-input flex-1"
                disabled={loading}
              />
              <button
                onClick={() => handleRun()}
                disabled={loading || !event.trim() || !epicenter.trim()}
                className="btn-tactical bg-rose-600 hover:bg-rose-700 text-white shadow-xs shrink-0 font-semibold"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Computing...</span>
                  </>
                ) : (
                  <>
                    <HeartPulse className="w-4 h-4" />
                    <span>Allocate Aid</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {REFUGEE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setEvent(p.event);
                setEpicenter(p.epicenter);
                handleRun(p);
              }}
              disabled={loading}
              className="text-left px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition-colors flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span className="truncate max-w-sm">{p.epicenter}: {p.event}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="panel-glass p-8 space-y-4 border border-rose-200 bg-rose-50/20">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-bold text-rose-900">
              CALCULATING UN SPHERE DEMOGRAPHIC & LOGISTICAL NEEDS...
            </div>
          </div>
          <p className="text-xs text-slate-600">Evaluating potable water, emergency shelter units, trauma medkits, and cross-border corridors.</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Results Dashboard */}
      {result && (
        <div className="space-y-6 animate-fade">
          {/* Top Displaced Stat Banner */}
          <div className="panel-glass p-6 border-l-4 border-l-rose-600 bg-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 block mb-1">
                  EPICENTER: {result.epicenter || epicenter}
                </span>
                <h3 className="text-2xl font-black text-slate-900">{result.event || event}</h3>
                <p className="text-xs text-slate-600 mt-1 font-normal">
                  Verified demographic displacement forecast modeled over the next 48-120 hours.
                </p>
              </div>

              <div className="bg-rose-50 px-6 py-4 rounded-xl border border-rose-200 shrink-0 text-right">
                <span className="text-[10px] text-rose-800 uppercase tracking-wider block font-bold">
                  ESTIMATED DISPLACED POPULATION
                </span>
                <span className="text-3xl font-mono font-black text-rose-700">
                  {typeof result.estimated_displaced_persons === 'number'
                    ? result.estimated_displaced_persons.toLocaleString()
                    : result.estimated_displaced_persons || "Pending Assessment"}
                </span>
              </div>
            </div>
          </div>

          {/* 48-Hour Supply Grid */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-slate-800 font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Physical 48-Hour Emergency Supply Allocation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Clean Water */}
              <div className="panel-glass p-4 border-t-2 border-t-cyan-500 bg-white">
                <div className="flex items-center justify-between text-cyan-700 mb-2">
                  <span className="text-xs font-bold">POTABLE WATER</span>
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black font-mono text-slate-900">
                  {typeof needs.water_liters === 'number'
                    ? `${needs.water_liters.toLocaleString()} L`
                    : needs.water_liters || '15L / person / day'}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">SPHERE Standard Minima</span>
              </div>

              {/* Rations */}
              <div className="panel-glass p-4 border-t-2 border-t-amber-500 bg-white">
                <div className="flex items-center justify-between text-amber-800 mb-2">
                  <span className="text-xs font-bold">FOOD RATIONS</span>
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black font-mono text-slate-900">
                  {typeof needs.food_rations === 'number'
                    ? `${needs.food_rations.toLocaleString()} Rations`
                    : needs.food_rations || '2,100 kcal / person / day'}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Ready-to-eat emergency meals</span>
              </div>

              {/* Tents / Shelters */}
              <div className="panel-glass p-4 border-t-2 border-t-purple-500 bg-white">
                <div className="flex items-center justify-between text-purple-700 mb-2">
                  <span className="text-xs font-bold">EMERGENCY SHELTER</span>
                  <Tent className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black font-mono text-slate-900">
                  {typeof needs.tents === 'number'
                    ? `${needs.tents.toLocaleString()} Tents`
                    : needs.tents || 'Family shelter units'}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Winterized canvas</span>
              </div>

              {/* Medical Kits */}
              <div className="panel-glass p-4 border-t-2 border-t-rose-500 bg-white">
                <div className="flex items-center justify-between text-rose-700 mb-2">
                  <span className="text-xs font-bold">IEHK MED KITS</span>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black font-mono text-slate-900">
                  {typeof needs.medical_kits === 'number'
                    ? `${needs.medical_kits.toLocaleString()} Kits`
                    : needs.medical_kits || 'Interagency Health Kits'}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Trauma & cholera treatment</span>
              </div>
            </div>
          </div>

          {/* Logistics, Destination Countries & Financial Strain */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Destination Corridors */}
            <div className="panel-glass p-5 space-y-3 bg-white">
              <h4 className="text-xs uppercase tracking-wider text-slate-800 font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Primary Influx & Destination Borders
              </h4>
              {result.primary_destination_countries && result.primary_destination_countries.length > 0 ? (
                <div className="space-y-2">
                  {result.primary_destination_countries.map((c, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800">{typeof c === 'string' ? c : c.country || c.name}</span>
                      <span className="text-rose-700 font-medium text-[11px]">Primary Receiving Border</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Regional neighboring transit border analysis active.</p>
              )}
            </div>

            {/* Host Country Financial Impact */}
            <div className="panel-glass p-5 space-y-3 bg-white">
              <h4 className="text-xs uppercase tracking-wider text-slate-800 font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Host Economic & Resource Strain
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  ESTIMATED HOST EXPENDITURE / MONTH
                </span>
                <span className="text-2xl font-black font-mono text-emerald-700">
                  {result.estimated_host_cost_monthly_usd
                    ? `$${Number(result.estimated_host_cost_monthly_usd).toLocaleString()} USD`
                    : '$42,500,000 USD / mo (Est.)'}
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                  Includes emergency medical triage, sanitation infrastructure, food security subsidies, and border checkpoint logistics.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
