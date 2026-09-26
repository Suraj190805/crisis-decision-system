'use client';
import { TrendingUp, TrendingDown, Anchor } from 'lucide-react';

const TICKER_ITEMS = [
  { label: 'BRENT CRUDE', value: '$84.20/bbl', change: '+2.85%', isUp: true },
  { label: 'NATURAL GAS', value: '$2.82/MMBtu', change: '+1.40%', isUp: true },
  { label: 'GOLD (XAU/USD)', value: '$2,185.40', change: '+0.72%', isUp: true },
  { label: 'WHEAT (CBOT)', value: '$562.50', change: '+4.12%', isUp: true },
  { label: 'TSMC (2330.TW)', value: 'NT$980', change: '-1.80%', isUp: false },
  { label: 'USD/EUR', value: '1.0820', change: '+0.15%', isUp: true },
  { label: 'STRAIT OF HORMUZ', status: 'HEIGHTENED WATCH', alert: true },
  { label: 'BAB EL-MANDEB', status: 'RESTRICTED ROUTING', critical: true },
  { label: 'SUEZ CANAL', status: 'TRANSIT -42% YoY', alert: true },
  { label: 'MALACCA STRAIT', status: 'NORMAL TRANSIT', normal: true },
];

export default function LiveTicker() {
  return (
    <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm overflow-hidden py-2 select-none">
      <div className="flex items-center gap-6 whitespace-nowrap overflow-x-auto no-scrollbar px-4 sm:px-6 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-blue-700 font-bold tracking-wider shrink-0 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
          <Anchor className="w-3.5 h-3.5 text-blue-600" />
          <span>MARKET TELEMETRY</span>
        </div>

        {TICKER_ITEMS.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 shrink-0 text-slate-700">
            <span className="text-slate-400 font-semibold">{item.label}:</span>
            {item.value && <span className="text-slate-900 font-bold">{item.value}</span>}
            {item.change && (
              <span className={`flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded ${item.isUp ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {item.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {item.change}
              </span>
            )}
            {item.status && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  item.critical
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : item.alert
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {item.status}
              </span>
            )}
            <span className="text-slate-300 ml-2">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
