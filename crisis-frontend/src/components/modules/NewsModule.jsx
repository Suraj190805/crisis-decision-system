'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import { Newspaper, Search, ExternalLink, RefreshCw, AlertCircle, Calendar } from 'lucide-react';

const NEWS_PRESETS = [
  "Middle East oil supply",
  "Taiwan Strait military tensions",
  "Red Sea shipping attacks",
  "Black Sea grain exports",
  "Panama Canal drought delays",
];

export default function NewsModule() {
  const [query, setQuery] = useState('global crisis supply chain');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = async (customQuery) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/news`, { query: q });
      setArticles(res.data.articles || res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to query NewsAPI. Verify API key and network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews('global crisis supply chain');
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="w-5 h-5 text-cyan-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Global Crisis Intelligence Newswire
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Ingests real-time journalism articles via NewsAPI to automatically fact-check agent hypotheses.
          </p>
        </div>
        <span className="tactical-badge badge-info text-[11px] w-fit">
          LIVE NEWSAPI STREAM
        </span>
      </div>

      {/* Search & Presets */}
      <div className="panel-glass p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && fetchNews()}
              placeholder="Filter intelligence by keyword (e.g. Taiwan, Suez, Crude Oil)..."
              className="tactical-input pl-10"
              disabled={loading}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            onClick={() => fetchNews()}
            disabled={loading || !query.trim()}
            className="btn-tactical bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs sm:w-40 shrink-0 font-semibold"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search Wire</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {NEWS_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(p);
                fetchNews(p);
              }}
              disabled={loading}
              className="text-left px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs transition-colors flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
              <span>{p}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="panel-glass p-8 space-y-3 border border-cyan-200 bg-cyan-50/20">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-cyan-950">
              INGESTING VERIFIED GLOBAL WIRE DISPATCHES...
            </span>
          </div>
          <p className="text-xs text-slate-600">Retrieving articles and validating journalistic source metadata.</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* News Articles Grid */}
      {!loading && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade">
          {articles.map((art, idx) => (
            <div
              key={idx}
              className="panel-glass p-5 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all bg-white"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
                  <span className="text-cyan-700 font-bold uppercase tracking-wider">
                    {art.source?.name || art.source || 'GLOBAL WIRE'}
                  </span>
                  {art.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(art.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-2">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {art.description || art.content || 'Real-time intelligence report dispatched from source.'}
                </p>
              </div>

              {art.url && (
                <div className="pt-3 border-t border-slate-100">
                  <a
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <span>Inspect Raw Source Dispatch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && articles.length === 0 && !error && (
        <div className="panel-glass p-8 text-center text-xs text-slate-500">
          No dispatches found for this search filter. Try broader terms.
        </div>
      )}
    </div>
  );
}
