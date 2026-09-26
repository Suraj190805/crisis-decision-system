'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/api';
import { Bell, Plus, Trash2, RotateCcw, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function AlertsModule() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [triggered, setTriggered] = useState([]);
  const [newAlert, setNewAlert] = useState({
    name: '',
    ticker: 'BZ=F',
    threshold: '',
    condition: 'above',
    region: 'global',
    currency: 'USD',
  });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/alerts`);
      setAlerts(res.data.alerts || res.data || []);
    } catch (err) {
      console.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newAlert.name || !newAlert.ticker || !newAlert.threshold) return;

    try {
      await axios.post(`${API_BASE_URL}/alerts`, {
        ...newAlert,
        threshold: parseFloat(newAlert.threshold),
      });
      setNewAlert({ name: '', ticker: 'BZ=F', threshold: '', condition: 'above', region: 'global', currency: 'USD' });
      fetchAlerts();
    } catch (err) {
      alert('Failed to register alert.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/alerts/${id}`);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/alerts/${id}/reset`);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/alerts/check`);
      setTriggered(res.data.triggered || []);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-pink-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Threshold Monitor & Early Warning System
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Continuous background telemetry monitors commodity prices and regional threat scores against hard thresholds.
          </p>
        </div>

        <button
          onClick={handleCheck}
          disabled={checking}
          className="btn-tactical btn-tactical-secondary text-xs py-1.5 px-3"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-blue-600' : ''}`} />
          <span>Audit Thresholds Now</span>
        </button>
      </div>

      {/* Triggered Alerts Alert Box */}
      {triggered.length > 0 && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 space-y-1 animate-fade">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>CRITICAL: {triggered.length} THRESHOLD MONITOR{triggered.length > 1 ? 'S' : ''} BREACHED!</span>
          </div>
          <ul className="text-xs list-disc list-inside space-y-0.5">
            {triggered.map((t, idx) => (
              <li key={idx}>
                {t.name || t.ticker}: Current value {t.current_value} exceeded threshold {t.threshold}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create Alert Form */}
      <div className="panel-glass p-5 sm:p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Provision Autonomous Threshold Monitor
        </h3>

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Alert Identifier:</label>
            <input
              type="text"
              value={newAlert.name}
              onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
              placeholder="e.g. Brent Crude Spike"
              className="tactical-input text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Asset / Commodity:</label>
            <select
              value={newAlert.ticker}
              onChange={(e) => setNewAlert({ ...newAlert, ticker: e.target.value })}
              className="tactical-input text-xs cursor-pointer bg-white"
            >
              <option value="BZ=F">Brent Crude Oil (BZ=F)</option>
              <option value="NG=F">Natural Gas (NG=F)</option>
              <option value="ZW=F">Wheat Futures (ZW=F)</option>
              <option value="GC=F">Gold (GC=F)</option>
              <option value="2330.TW">TSMC Semiconductor (2330.TW)</option>
              <option value="EURUSD=X">EUR/USD Exchange Rate</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Condition:</label>
            <select
              value={newAlert.condition}
              onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })}
              className="tactical-input text-xs cursor-pointer bg-white"
            >
              <option value="above">Exceeds (Price &gt; Threshold)</option>
              <option value="below">Drops Below (Price &lt; Threshold)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Threshold Value ($):</label>
            <input
              type="number"
              step="any"
              value={newAlert.threshold}
              onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })}
              placeholder="e.g. 90.00"
              className="tactical-input text-xs"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="btn-tactical bg-pink-600 hover:bg-pink-700 text-white w-full text-xs py-2 shadow-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy Monitor</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Monitors List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Active Background Watch Monitors ({alerts.length})
        </h3>

        {alerts.length === 0 && !loading && (
          <div className="panel-glass p-8 text-center text-xs text-slate-500 bg-white">
            No active threshold alerts deployed. Create one above to monitor critical asset swings.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((al) => {
            const isTriggered = al.is_triggered || al.status === 'triggered';
            return (
              <div
                key={al.id}
                className={`panel-glass p-4 space-y-3 relative border bg-white ${
                  isTriggered ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{al.name}</h4>
                    <span className="font-mono text-[11px] text-blue-600 font-bold">{al.ticker}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isTriggered
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isTriggered ? 'TRIGGERED' : 'ARMED'}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-500">Threshold:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {al.condition === 'above' ? '>' : '<'} ${al.threshold}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  {isTriggered && (
                    <button
                      onClick={() => handleReset(al.id)}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(al.id)}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
