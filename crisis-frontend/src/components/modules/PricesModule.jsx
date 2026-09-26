'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const REGIONS = ["Global", "India", "USA", "Europe", "China", "Middle East", "Japan"];

export default function PricesModule() {
  const [region, setRegion] = useState('Global');
  const [items, setItems] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrices = async (targetRegion) => {
    const reg = targetRegion || region;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/prices`, { region: reg });
      const rawPrices = res.data.prices || res.data || [];
      let list = [];
      if (Array.isArray(rawPrices)) {
        list = rawPrices;
      } else if (typeof rawPrices === 'object') {
        list = Object.keys(rawPrices).map((k) => ({
          name: k,
          ...rawPrices[k],
        }));
      }
      setItems(list);
      if (list.length > 0) {
        setSelectedAsset(list[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch real-time market tickers from Yahoo Finance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices(region);
  }, [region]);

  const basePrice = Number(selectedAsset?.price || 100);
  const chartPoints = selectedAsset?.history && selectedAsset.history.length > 0
    ? selectedAsset.history.map((pt, i) => ({
        time: pt.time || pt.date || `T-${selectedAsset.history.length - i}`,
        price: Number(pt.price || pt.close || pt),
      }))
    : [
        { time: '09:00', price: +(basePrice * 0.982).toFixed(2) },
        { time: '11:00', price: +(basePrice * 0.991).toFixed(2) },
        { time: '13:00', price: +(basePrice * 0.988).toFixed(2) },
        { time: '15:00', price: +(basePrice * 1.004).toFixed(2) },
        { time: '17:00', price: +(basePrice * 0.997).toFixed(2) },
        { time: 'NOW', price: +basePrice.toFixed(2) },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Live Commodity & Market Fluctuations
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Automated Yahoo Finance stream tracking geopolitical commodity volatility and index swings.
          </p>
        </div>

        {/* Region selector & refresh */}
        <div className="flex items-center gap-2">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="tactical-input py-1.5 px-3 text-xs w-auto cursor-pointer bg-white"
            disabled={loading}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r} className="bg-white text-slate-900">
                {r} Focus
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchPrices()}
            disabled={loading}
            className="btn-tactical btn-tactical-secondary text-xs py-1.5 px-3"
            title="Refresh Live Yahoo Finance Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => {
          const isSelected = selectedAsset?.name === item.name;
          const changeVal = Number(item.change_pct !== undefined ? item.change_pct : item.change || 0);
          const isPositive = changeVal >= 0;
          return (
            <div
              key={idx}
              onClick={() => setSelectedAsset(item)}
              className={`panel-glass p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                  : 'hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold truncate max-w-[140px] text-slate-900">{item.name}</span>
                <span className="font-mono text-[10px] text-blue-600 font-bold">{item.ticker || item.currency || 'USD'}</span>
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 mb-2">
                ${Number(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`flex items-center gap-1 font-bold font-mono text-xs px-2 py-0.5 rounded ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {changeVal > 0 ? '+' : ''}{changeVal.toFixed(2)}%
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {isSelected ? 'ACTIVE' : 'SELECT'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      {selectedAsset && (
        <div className="panel-glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
                INTRADAY / HISTORICAL TRAJECTORY
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {selectedAsset.name} ({selectedAsset.ticker || 'SPOT'})
              </h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-mono font-black text-slate-900">
                ${Number(selectedAsset.price || 0).toFixed(2)} {selectedAsset.currency || 'USD'}
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563eb' }}
                  activeDot={{ r: 6, fill: '#1d4ed8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
