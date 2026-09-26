'use client';
import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import { Scale, Play, RefreshCw, AlertCircle, Check } from 'lucide-react';

const AVAILABLE_COUNTRIES = [
  { name: 'USA', flag: '🇺🇸' },
  { name: 'China', flag: '🇨🇳' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'UK', flag: '🇬🇧' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Russia', flag: '🇷🇺' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'South Korea', flag: '🇰🇷' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Taiwan', flag: '🇹🇼' },
  { name: 'UAE', flag: '🇦🇪' },
  { name: 'Singapore', flag: '🇸🇬' },
];

const ALLIANCE_PRESETS = [
  { label: 'G7 Coalition', countries: ['USA', 'UK', 'Germany', 'France', 'Japan', 'Canada'] },
  { label: 'BRICS+', countries: ['Brazil', 'Russia', 'India', 'China', 'Saudi Arabia', 'UAE'] },
  { label: 'Major Energy Exporters', countries: ['Saudi Arabia', 'Russia', 'USA', 'UAE', 'Australia'] },
  { label: 'East Asia Tech Hubs', countries: ['Taiwan', 'South Korea', 'Japan', 'China', 'Singapore'] },
];

export default function CompareModule() {
  const [event, setEvent] = useState('');
  const [selectedCountries, setSelectedCountries] = useState(['USA', 'China', 'India', 'Germany']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const toggleCountry = (name) => {
    if (selectedCountries.includes(name)) {
      if (selectedCountries.length > 2) {
        setSelectedCountries(selectedCountries.filter((c) => c !== name));
      }
    } else if (selectedCountries.length < 6) {
      setSelectedCountries([...selectedCountries, name]);
    }
  };

  const handleCompare = async () => {
    if (!event.trim() || selectedCountries.length < 2) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/compare-countries`, {
        event,
        countries: selectedCountries,
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Comparison failed. Check backend connection.');
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
            <Scale className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Cross-National Resilience & Vulnerability Comparison
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Benchmark macroeconomic shock resistance and supply chain exposure across up to 6 nations simultaneously.
          </p>
        </div>
        <span className="tactical-badge badge-warning text-[11px] w-fit">
          MACRO RESILIENCE MATRIX
        </span>
      </div>

      {/* Input Section */}
      <div className="panel-glass p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Crisis Parameters to Benchmark:
          </label>
          <input
            type="text"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleCompare()}
            placeholder="e.g. Global crude oil surges 50% following Persian Gulf embargo..."
            className="tactical-input"
            disabled={loading}
          />
        </div>

        {/* Alliance Presets */}
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Preset Geopolitical Blocs:
          </span>
          <div className="flex flex-wrap gap-2">
            {ALLIANCE_PRESETS.map((bloc, i) => (
              <button
                key={i}
                onClick={() => setSelectedCountries(bloc.countries)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition-colors flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{bloc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Country Selector Pills */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Selected Nations ({selectedCountries.length}/6):
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Min 2, Max 6</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {AVAILABLE_COUNTRIES.map((c) => {
              const isSelected = selectedCountries.includes(c.name);
              return (
                <button
                  key={c.name}
                  onClick={() => toggleCountry(c.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-amber-600 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleCompare}
            disabled={loading || !event.trim() || selectedCountries.length < 2}
            className="btn-tactical bg-amber-600 hover:bg-amber-700 text-white shadow-xs w-full sm:w-auto font-semibold"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Benchmarking...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Benchmark Resilience</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="panel-glass p-8 space-y-4 border border-amber-200 bg-amber-50/20">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-amber-950">
              EVALUATING CROSS-NATIONAL MACRO RESILIENCY MATRICES...
            </span>
          </div>
          <p className="text-xs text-slate-600">Cross-referencing exposure across fiscal buffers and alternative supply routes.</p>
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
          <div className="panel-glass p-4 border border-slate-200 bg-white flex items-center justify-between">
            <div className="text-xs">
              <span className="text-amber-800 font-bold uppercase block">BENCHMARK SCENARIO:</span>
              <span className="text-slate-900 font-semibold">{result.event || event}</span>
            </div>
            <span className="tactical-badge badge-warning text-[10px]">
              {selectedCountries.length} NATIONS AUDITED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(result.comparisons || result.results || []).map((comp, idx) => {
              const rank = idx + 1;
              const isFirst = rank === 1;
              return (
                <div
                  key={idx}
                  className={`panel-glass p-5 space-y-3 relative border bg-white ${
                    isFirst ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {AVAILABLE_COUNTRIES.find((c) => c.name === comp.country)?.flag || '🌐'}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{comp.country}</h4>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isFirst
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      RANK #{rank}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {comp.resilience_score && (
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                          <span className="font-semibold">RESILIENCE RATING</span>
                          <span className="text-slate-900 font-bold">{comp.resilience_score}/100</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${comp.resilience_score}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {comp.economic_exposure && (
                      <div className="pt-1">
                        <span className="text-slate-500 block text-[11px]">Economic Vulnerability:</span>
                        <span className="text-slate-800 font-medium">{comp.economic_exposure}</span>
                      </div>
                    )}

                    {comp.key_vulnerability && (
                      <div className="pt-1">
                        <span className="text-red-700 font-bold text-[10px] block uppercase">Primary Risk Chokepoint:</span>
                        <span className="text-slate-700">{comp.key_vulnerability}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
