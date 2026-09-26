'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import { Globe, FileText, Shield, Activity, Clock, CheckCircle2, AlertCircle, Wifi, WifiOff, Database, Cpu, BarChart3, Newspaper } from 'lucide-react';

const FRESHNESS_ICONS = {
  markets: BarChart3,
  news: Newspaper,
  world_bank: Database,
  ai_analysis: Cpu,
  llm: Cpu,
};

const STATUS_COLORS = {
  live: 'text-emerald-600',
  complete: 'text-emerald-600',
  configured: 'text-emerald-600',
  ok: 'text-emerald-600',
  cached: 'text-amber-600',
  processing: 'text-blue-600',
  stale: 'text-red-600',
  unknown: 'text-slate-400',
  idle: 'text-slate-400',
  error: 'text-red-600',
  not_configured: 'text-red-400',
};

const STATUS_DOT = {
  live: 'bg-emerald-500',
  complete: 'bg-emerald-500',
  configured: 'bg-emerald-500',
  ok: 'bg-emerald-500',
  cached: 'bg-amber-500',
  processing: 'bg-blue-500 animate-pulse',
  stale: 'bg-red-500',
  unknown: 'bg-slate-400',
  idle: 'bg-slate-400',
  error: 'bg-red-500',
  not_configured: 'bg-red-400',
};

export default function Header({ onDownloadPDF, hasReport }) {
  const [utcTime, setUtcTime] = useState('');
  const [healthData, setHealthData] = useState(null);
  const [showHealth, setShowHealth] = useState(false);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTimes();
    const timer = setInterval(updateTimes, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll /health every 30s
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/health`);
        setHealthData(res.data);
      } catch {
        setHealthData(null);
      }
    };
    fetchHealth();
    const timer = setInterval(fetchHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  const overallStatus = healthData?.overall || 'unknown';
  const freshness = healthData?.data_freshness || {};
  const checks = healthData?.checks || {};

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand / Platform title */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
            <Globe className="w-5 h-5 animate-spin" style={{ animationDuration: '40s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                GLOBAL CRISIS <span className="text-blue-600 font-bold">INTELLIGENCE</span>
              </h1>
              <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                v2.5 Pro
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Multi-Agent Decision-Intelligence Platform
            </p>
          </div>
        </div>

        {/* Center: Data Freshness Indicators */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          {/* Per-source freshness */}
          {['markets', 'news', 'ai_analysis'].map((source) => {
            const info = freshness[source];
            const status = info?.status || 'unknown';
            const dotColor = STATUS_DOT[status] || STATUS_DOT.unknown;
            const Icon = FRESHNESS_ICONS[source] || Activity;
            const label = source === 'ai_analysis' ? 'AI' : source === 'markets' ? 'Markets' : source === 'news' ? 'News' : source;
            return (
              <div key={source} className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                <Icon className={`w-3 h-3 ${STATUS_COLORS[status] || 'text-slate-400'}`} />
                <span className="text-[10px] font-medium text-slate-600">{label}</span>
                <span className={`text-[10px] font-mono ${STATUS_COLORS[status] || 'text-slate-400'}`}>
                  {info?.age && info.age !== 'never' ? info.age : status}
                </span>
              </div>
            );
          })}

          <div className="h-3.5 w-[1px] bg-slate-200" />

          {/* UTC Clock */}
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800">{utcTime || '00:00:00 UTC'}</span>
          </div>
        </div>

        {/* Right: Actions & System Health */}
        <div className="flex items-center gap-2.5">
          {hasReport && (
            <button
              onClick={onDownloadPDF}
              className="btn-tactical bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 px-3.5 rounded-lg flex items-center gap-2 shadow-xs transition-all"
              title="Download Executive Crisis Dossier as PDF"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Export Dossier (PDF)</span>
            </button>
          )}

          {/* System Health Button */}
          <div className="relative">
            <button
              onClick={() => setShowHealth(!showHealth)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-colors ${
                overallStatus === 'healthy'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : overallStatus === 'degraded'
                  ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {overallStatus === 'healthy' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : overallStatus === 'degraded' ? (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {overallStatus === 'healthy' ? 'All Systems OK' :
                 overallStatus === 'degraded' ? 'Degraded' : 'Checking...'}
              </span>
            </button>

            {/* Health Dropdown */}
            {showHealth && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-lg p-4 space-y-3 z-50">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">System Health</div>

                {/* Service Checks */}
                <div className="space-y-2">
                  {Object.entries(checks).map(([name, check]) => {
                    const st = check.status || 'unknown';
                    return (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 capitalize">{name.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[st] || 'bg-slate-400'}`} />
                          <span className={`font-medium ${STATUS_COLORS[st] || 'text-slate-400'}`}>
                            {st}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Data Freshness Detail */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Data Freshness</div>
                  {Object.entries(freshness).map(([source, info]) => (
                    <div key={source} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 capitalize">{source.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[info.status] || 'bg-slate-400'}`} />
                        <span className="text-slate-500">{info.age || info.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* LLM Model Info */}
                {freshness.llm?.model && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-[10px] text-slate-500">
                      LLM: <span className="font-mono font-medium text-slate-700">{freshness.llm.model}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
