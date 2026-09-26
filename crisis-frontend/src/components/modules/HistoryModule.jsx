'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import { Archive, Search, RefreshCw, Calendar, ArrowRight, X } from 'lucide-react';

export default function HistoryModule({ onSelectEvent }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/history`);
      setHistory(res.data.history || res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load mission history from local SQLite archive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = history.filter((h) => {
    const text = `${h.event || ''} ${h.summary || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Archive className="w-5 h-5 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Historical Mission Archives & Validated Resolutions
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Persistent intelligence registry stored in local database for precedent auditing and comparative analysis.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="btn-tactical btn-tactical-secondary text-xs py-1.5 px-3"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="panel-glass p-4 bg-white">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mission archives by crisis name, sector, or keyword..."
            className="tactical-input pl-10 text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="panel-glass p-8 space-y-3 border border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-slate-800">
              QUERYING LOCAL SQLITE MISSION ARCHIVE...
            </span>
          </div>
          <p className="text-xs text-slate-500">Fetching recorded dossiers and verified precedents.</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Grid of Past Events */}
      {!loading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ARCHIVED MISSIONS: {filtered.length}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="panel-glass p-8 text-center text-xs text-slate-500 bg-white">
              No historical incident logs match your filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((item, idx) => {
                const risk = Number(item.risk_level) || 5;
                const riskBadge =
                  risk >= 8 ? 'badge-critical' : risk >= 5 ? 'badge-warning' : 'badge-success';

                return (
                  <div
                    key={item.id || idx}
                    onClick={() => setSelectedIncident(item)}
                    className="panel-glass p-5 space-y-3 cursor-pointer hover:border-blue-500 transition-all group bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`tactical-badge ${riskBadge} text-[10px]`}>
                        RISK {risk}/10
                      </span>
                      {item.created_at && (
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.created_at.slice(0, 16)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.event}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.summary || 'Strategic intelligence dossier recorded in database.'}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                      <span>INSPECT DOSSIER</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detailed Modal if an incident is clicked */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase block">
                  HISTORICAL MISSION DOSSIER #{selectedIncident.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedIncident.event}</h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div>
                <span className="text-slate-900 font-bold block mb-1">RECORDED ASSESSMENT:</span>
                <p className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-normal">
                  {selectedIncident.summary}
                </p>
              </div>

              {selectedIncident.created_at && (
                <div className="text-[11px] font-mono text-slate-500">
                  Timestamp Logged: {selectedIncident.created_at}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedIncident(null)}
                className="btn-tactical btn-tactical-primary text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
