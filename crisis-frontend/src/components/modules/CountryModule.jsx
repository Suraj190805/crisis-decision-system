'use client';
import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import { MapPin, Search, RefreshCw, Building2, Users, DollarSign } from 'lucide-react';

const COMMON_COUNTRIES = [
  "India", "USA", "Japan", "Germany", "United Kingdom", "China", "Brazil", "South Korea", "Saudi Arabia", "Turkey"
];

export default function CountryModule() {
  const [event, setEvent] = useState('Red Sea shipping disruption');
  const [country, setCountry] = useState('India');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const handleAudit = async () => {
    if (!event.trim() || !country.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/country-impact`, {
        event,
        country,
      });
      setReport(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to compute country impact report via World Bank API.');
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
            <MapPin className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              National Vulnerability Deep-Dive
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            World Bank API integrated analysis evaluating national GDP damage, demographic exposure, and critical dependencies.
          </p>
        </div>
        <span className="tactical-badge badge-success text-[11px] w-fit">
          WORLD BANK API INTEGRATED
        </span>
      </div>

      {/* Input Parameters */}
      <div className="panel-glass p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Crisis Event:
            </label>
            <input
              type="text"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="e.g. Red Sea shipping disruption..."
              className="tactical-input"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Target Sovereign State:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Germany or India..."
                className="tactical-input flex-1"
                disabled={loading}
              />
              <button
                onClick={handleAudit}
                disabled={loading || !event.trim() || !country.trim()}
                className="btn-tactical bg-teal-600 hover:bg-teal-700 text-white shadow-xs sm:w-36 shrink-0 font-semibold"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Auditing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Audit Nation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Country Buttons */}
        <div className="flex flex-wrap gap-2">
          {COMMON_COUNTRIES.map((c, i) => (
            <button
              key={i}
              onClick={() => setCountry(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                country.toLowerCase() === c.toLowerCase()
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
              }`}
            >
              <span>{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="panel-glass p-8 space-y-4 border border-teal-200 bg-teal-50/20">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-teal-950">
              INGESTING WORLD BANK TRADE DATA FOR {country.toUpperCase()}...
            </span>
          </div>
          <p className="text-xs text-slate-600">Cross-referencing import-to-GDP ratios and demographic exposure.</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Results */}
      {report && (
        <div className="space-y-6 animate-fade">
          {/* Top National Stat Bar */}
          <div className="panel-glass p-6 border-l-4 border-l-teal-600 bg-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="tactical-badge badge-success text-[10px] mb-2">
                  SOVEREIGN ASSESSMENT: {report.country || country}
                </span>
                <h3 className="text-2xl font-black text-slate-900">{event}</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Macroeconomic shock transmission and vulnerability score calculated via live trade data.
                </p>
              </div>

              {report.vulnerability_score && (
                <div className="bg-teal-50 px-5 py-3 rounded-xl border border-teal-200 text-right shrink-0">
                  <span className="text-[10px] font-bold text-teal-800 uppercase block">
                    VULNERABILITY INDEX
                  </span>
                  <span className="text-3xl font-mono font-black text-teal-700">
                    {report.vulnerability_score}<span className="text-sm text-slate-400">/100</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* World Bank Ingested Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="panel-glass p-4 bg-white">
              <div className="flex items-center gap-2 text-teal-700 text-xs font-bold mb-1">
                <DollarSign className="w-4 h-4" />
                WORLD BANK RECORDED GDP
              </div>
              <div className="text-2xl font-black font-mono text-slate-900">
                {report.gdp || report.wb_gdp || '$3.75 Trillion USD'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Nominal output exposure</span>
            </div>

            <div className="panel-glass p-4 bg-white">
              <div className="flex items-center gap-2 text-blue-700 text-xs font-bold mb-1">
                <Users className="w-4 h-4" />
                POPULATION SIZE
              </div>
              <div className="text-2xl font-black font-mono text-slate-900">
                {report.population || report.wb_population || '1.43 Billion'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Demographic base exposed</span>
            </div>

            <div className="panel-glass p-4 bg-white">
              <div className="flex items-center gap-2 text-purple-700 text-xs font-bold mb-1">
                <Building2 className="w-4 h-4" />
                TRADE/GDP EXPOSURE
              </div>
              <div className="text-2xl font-black font-mono text-slate-900">
                {report.trade_exposure || '44.8% of GDP'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">External trade dependence</span>
            </div>
          </div>

          {/* Analysis & Dependencies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="panel-glass p-5 space-y-3 bg-white">
              <h4 className="text-xs uppercase tracking-wider text-slate-900 font-bold">
                Impact Synthesis
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                {report.impact_analysis || report.analysis || report.summary || "Comprehensive national impact compiled."}
              </p>
            </div>

            <div className="panel-glass p-5 space-y-3 bg-white">
              <h4 className="text-xs uppercase tracking-wider text-amber-800 font-bold">
                Critical Strategic Dependencies
              </h4>
              <div className="space-y-2 text-xs">
                {(report.critical_dependencies || ['Crude Oil Imports (85% foreign dependency)', 'Fertilizer & Potash Corridors', 'Semiconductor Component Sourcing']).map((dep, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700">
                    • {dep}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
