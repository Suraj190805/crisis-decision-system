'use client';
import {
  AlertTriangle,
  Globe2,
  Zap,
  Users,
  CheckSquare,
  History,
  DollarSign,
  Package,
} from 'lucide-react';

export default function ReportVisualizer({ report, raw, title = "Intelligence Assessment" }) {
  if (!report) return null;

  // Format risk level
  const riskLevel = Number(report.risk_level) || 5;
  const getRiskColor = (lvl) => {
    if (lvl >= 8) return { text: 'text-red-700', bg: 'bg-red-600', badge: 'badge-critical', label: 'CRITICAL THREAT' };
    if (lvl >= 5) return { text: 'text-amber-700', bg: 'bg-amber-600', badge: 'badge-warning', label: 'ELEVATED RISK' };
    return { text: 'text-emerald-700', bg: 'bg-emerald-600', badge: 'badge-success', label: 'MODERATE / MANAGED' };
  };
  const riskInfo = getRiskColor(riskLevel);

  const econ = report.economic_impact || {};
  const trade = report.trade_impact || report.supply_chain || {};
  const energy = report.energy_impact || {};
  const social = report.social_impact || {};
  const actions = report.action_plan || report.recommendations || {};
  const similarEvents = report.similar_events || [];

  return (
    <div className="space-y-6 mt-6 animate-fade">
      {/* Top Banner: Risk Gauge & Executive Summary */}
      <div className="panel-glass p-6 relative overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className={`tactical-badge ${riskInfo.badge}`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                {riskInfo.label}
              </span>
              <span className="text-xs font-mono font-medium text-slate-500">
                CONFIDENCE: {report.confidence || report.confidence_score || 88}%
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {raw?.event || raw?.scenario || title}
            </h2>
            {raw?.region && (
              <p className="text-xs font-semibold text-blue-600 mt-1">
                REGION FOCUS: {raw.region.toUpperCase()}
              </p>
            )}
          </div>

          {/* Radial / Score Risk Meter */}
          <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-xl border border-slate-200 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">THREAT INDEX</div>
              <div className={`text-3xl sm:text-4xl font-black font-mono ${riskInfo.text}`}>
                {riskLevel}<span className="text-lg text-slate-400">/10</span>
              </div>
            </div>
            <div className="w-16 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${riskInfo.bg} transition-all duration-1000`}
                style={{ width: `${riskLevel * 10}%` }}
              />
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="pt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
            <Globe2 className="w-3.5 h-3.5 text-blue-600" />
            Executive Strategic Briefing
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {report.summary || report.executive_summary || "Strategic analysis compiled through multi-agent consensus with real-time news and market feeds."}
          </p>

          {/* Key Drivers if available */}
          {report.key_drivers && report.key_drivers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Key Risk Drivers:</span>
              {report.key_drivers.map((driver, idx) => (
                <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                  {driver}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid: 4 Pillars of Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Macroeconomic Impact */}
        <div className="panel-glass p-5 border-l-4 border-l-blue-600">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold tracking-wider uppercase mb-3">
            <DollarSign className="w-4 h-4" />
            Macroeconomic Vector
          </div>
          <div className="space-y-3 text-xs">
            {econ.inflation_risk && (
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Inflation Pressure:</span>
                <span className="font-semibold text-slate-800">{econ.inflation_risk}</span>
              </div>
            )}
            {econ.currency_impact && (
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">FX & Currency Volatility:</span>
                <span className="font-semibold text-slate-800">{econ.currency_impact}</span>
              </div>
            )}
            {econ.gdp_impact && (
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">GDP Growth Impact:</span>
                <span className="font-semibold text-slate-800">{econ.gdp_impact}</span>
              </div>
            )}
            {econ.affected_sectors && econ.affected_sectors.length > 0 && (
              <div>
                <span className="text-slate-500 block mb-1 font-medium">Vulnerable Sectors:</span>
                <div className="flex flex-wrap gap-1.5">
                  {econ.affected_sectors.map((sec, i) => (
                    <span key={i} className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-medium">
                      {sec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Trade & Supply Chain Disruption */}
        <div className="panel-glass p-5 border-l-4 border-l-indigo-600">
          <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold tracking-wider uppercase mb-3">
            <Package className="w-4 h-4" />
            Trade & Supply Chain Logistics
          </div>
          <div className="space-y-3 text-xs">
            {trade.estimated_delay && (
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Estimated Shipping Lag:</span>
                <span className="font-semibold text-amber-800">{trade.estimated_delay}</span>
              </div>
            )}
            {trade.affected_trade_routes && trade.affected_trade_routes.length > 0 && (
              <div>
                <span className="text-slate-500 block mb-1 font-medium">Impacted Corridors:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                  {trade.affected_trade_routes.map((rt, i) => <li key={i}>{rt}</li>)}
                </ul>
              </div>
            )}
            {trade.disrupted_imports && trade.disrupted_imports.length > 0 && (
              <div>
                <span className="text-slate-500 block mb-1 font-medium">Critical Import Shortages:</span>
                <div className="flex flex-wrap gap-1.5">
                  {trade.disrupted_imports.map((item, i) => (
                    <span key={i} className="text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Energy Markets & Commodities */}
        <div className="panel-glass p-5 border-l-4 border-l-amber-600">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold tracking-wider uppercase mb-3">
            <Zap className="w-4 h-4" />
            Energy & Strategic Commodities
          </div>
          <div className="space-y-3 text-xs">
            {energy.oil_price_risk && (
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Hydrocarbon Pricing Shock:</span>
                <span className="font-semibold text-slate-800">{energy.oil_price_risk}</span>
              </div>
            )}
            {energy.vulnerable_regions && energy.vulnerable_regions.length > 0 && (
              <div>
                <span className="text-slate-500 block mb-1 font-medium">Grid & Refinery Risk Zones:</span>
                <div className="flex flex-wrap gap-1.5">
                  {energy.vulnerable_regions.map((reg, i) => (
                    <span key={i} className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
                      {reg}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {energy.alternative_energy && (
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Alternative Reserves & Hedging:</span>
                <span className="text-slate-700">{energy.alternative_energy}</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. Humanitarian & Societal Strain */}
        <div className="panel-glass p-5 border-l-4 border-l-rose-600">
          <div className="flex items-center gap-2 text-rose-700 text-xs font-bold tracking-wider uppercase mb-3">
            <Users className="w-4 h-4" />
            Societal & Humanitarian Strain
          </div>
          <div className="space-y-3 text-xs">
            {social.humanitarian_risk && (
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Humanitarian Threat Matrix:</span>
                <span className="font-semibold text-slate-800">{social.humanitarian_risk}</span>
              </div>
            )}
            {social.displaced_population && (
              <div>
                <span className="text-slate-500 block mb-0.5 font-medium">Potential Population Displacement:</span>
                <span className="font-semibold text-rose-700">{social.displaced_population}</span>
              </div>
            )}
            {social.critical_needs && social.critical_needs.length > 0 && (
              <div>
                <span className="text-slate-500 block mb-1 font-medium">Priority Relief Requirements:</span>
                <div className="flex flex-wrap gap-1.5">
                  {social.critical_needs.map((item, i) => (
                    <span key={i} className="text-[11px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Plan / Strategic Playbook */}
      {actions && (
        <div className="panel-glass p-6 border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm uppercase tracking-wider text-emerald-800 flex items-center gap-2 font-bold">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              Actionable Strategic Defense Protocol
            </h3>
            <span className="text-[11px] font-mono font-semibold text-slate-500">EXECUTIVE DIRECTIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {actions.immediate_actions && (
              <div className="bg-red-50/50 p-4 rounded-xl border border-red-200/80">
                <div className="text-red-700 font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Immediate (0–48 Hours)
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700">
                  {Array.isArray(actions.immediate_actions)
                    ? actions.immediate_actions.map((act, i) => <li key={i}>{act}</li>)
                    : <li>{actions.immediate_actions}</li>}
                </ul>
              </div>
            )}

            {actions.mid_term_actions && (
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80">
                <div className="text-amber-800 font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Mid-Term (7–30 Days)
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700">
                  {Array.isArray(actions.mid_term_actions)
                    ? actions.mid_term_actions.map((act, i) => <li key={i}>{act}</li>)
                    : <li>{actions.mid_term_actions}</li>}
                </ul>
              </div>
            )}

            {actions.international_response && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/80">
                <div className="text-blue-700 font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Multilateral & Alliances
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-slate-700">
                  {Array.isArray(actions.international_response)
                    ? actions.international_response.map((act, i) => <li key={i}>{act}</li>)
                    : <li>{actions.international_response}</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommended Actions (when structured recommendations exist) */}
      {report.recommended_actions && report.recommended_actions.length > 0 && !actions?.immediate_actions && (
        <div className="panel-glass p-6 border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm uppercase tracking-wider text-emerald-800 flex items-center gap-2 font-bold">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              Strategic Decision Recommendations
            </h3>
            <span className="text-[11px] font-mono font-semibold text-slate-500">OPERATIONAL PROTOCOL</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.recommended_actions.map((rec, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-slate-900 text-sm">{rec.action}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.priority === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' :
                      rec.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {rec.priority || 'NORMAL'}
                    </span>
                  </div>
                  {rec.reason && <p className="text-slate-600 text-xs mb-2">{rec.reason}</p>}
                </div>
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                  {rec.trigger && <span>Trigger: <strong className="text-slate-700">{rec.trigger}</strong></span>}
                  {rec.time_horizon && <span>Horizon: <strong className="text-slate-700">{rec.time_horizon}</strong></span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Precedents */}
      {similarEvents && similarEvents.length > 0 && (
        <div className="panel-glass p-5 border border-slate-200 bg-white">
          <h4 className="text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2 font-bold">
            <History className="w-4 h-4 text-purple-600" />
            Verified Historical Precedents & Analogues
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {similarEvents.map((evt, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800 truncate">{evt.event}</span>
                  <span className="tactical-badge badge-warning text-[10px] py-0">Risk {evt.risk_level}/10</span>
                </div>
                <p className="text-slate-600 line-clamp-2 text-[11px] mt-1">{evt.summary}</p>
                {evt.created_at && (
                  <span className="text-[10px] font-mono text-slate-400 mt-2 block">{evt.created_at}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
