'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Play, Square, Zap, RotateCcw, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BotStatusData {
  running: boolean;
  lastUpdate: number | null;
  capital: number;
  totalPnL: number;
  totalPnLPercent: number;
  winRate: number;
  openPositions: number;
  totalTrades: number;
}

interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  usdValue: number;
  stopLoss: number;
  takeProfit: number;
  strategy: string;
  regime: string;
  openTime: number;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPercent: number;
  strategy: string;
  exitReason: string;
  closeTime: number;
  duration: number;
}

interface QValue {
  state: string;
  qValue: number;
}

interface PerformanceData {
  timestamp: number;
  capital: number;
  totalPnL: number;
  pnlPercent: number;
  winRate: number;
  totalTrades: number;
}

export default function Bot2Dashboard() {
  const [status, setStatus] = useState<BotStatusData | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [qValues, setQValues] = useState<QValue[]>([]);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  // Bot Controls State
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [capital, setCapital] = useState(100);
  const [maxRisk, setMaxRisk] = useState(0.02);
  const [maxPositions, setMaxPositions] = useState(3);
  const [checkInterval, setCheckInterval] = useState(240);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, positionsRes, tradesRes, qTableRes, perfRes, controlRes] = await Promise.all([
        fetch('/api/bot2/status'),
        fetch('/api/bot2/portfolio'),
        fetch('/api/bot2/trades'),
        fetch('/api/bot2/qtable'),
        fetch('/api/bot2/performance'),
        fetch('/api/bot2/control')
      ]);

      if (statusRes.ok) setStatus(await statusRes.json());
      if (positionsRes.ok) setPositions(await positionsRes.json());
      if (tradesRes.ok) setTrades(await tradesRes.json());
      if (qTableRes.ok) setQValues(await qTableRes.json());
      if (perfRes.ok) setPerformance(await perfRes.json());
      
      if (controlRes.ok) {
        const control = await controlRes.json();
        setIsRunning(control.isRunning);
        setCapital(control.capital);
        setMaxRisk(control.maxRiskPerTrade);
        setMaxPositions(control.maxPositions);
        setCheckInterval(control.checkInterval / 60000);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBotAction = async (action: string, params?: any) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/bot2/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params })
      });

      if (res.ok) {
        if (action === 'start') setIsRunning(true);
        if (action === 'stop') setIsRunning(false);
        if (action === 'reset') {
          alert('✅ Bot reset successfully!');
          window.location.reload();
        }
        fetchData();
      } else {
        const error = await res.json();
        alert('❌ Error: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      alert('❌ Error: ' + error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    await handleBotAction('update_config', {
      capital,
      maxRiskPerTrade: maxRisk,
      maxPositions,
      checkInterval: checkInterval * 60000
    });
    setShowSettings(false);
    alert('✅ Settings updated!');
  };

  // Calculate strategy usage stats
  const strategyStats = trades.reduce((acc, trade) => {
    acc[trade.strategy] = (acc[trade.strategy] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const strategyChartData = Object.entries(strategyStats).map(([name, count]) => ({
    name: name.replace('_', ' '),
    count
  }));

  // Equity curve data
  const equityCurve = performance.slice().reverse().map(p => ({
    time: new Date(p.timestamp).toLocaleTimeString(),
    capital: p.capital,
    pnl: p.totalPnL
  }));

  // Q-values data
  const qValuesData = [
    'trending_up_trend_following',
    'trending_up_mean_reversion', 
    'trending_up_breakout',
    'ranging_mean_reversion'
  ].map(state => {
    const qVal = qValues.find(q => q.state === state);
    return {
      state: state.replace(/_/g, ' '),
      value: qVal?.qValue || 0
    };
  });

  if (loading || !status) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0f1419] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Bot RL-Adaptive
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Reinforcement Learning Trading Bot
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contrôles</h2>
          
          <div className="flex gap-4 flex-wrap">
            {!isRunning ? (
              <button
                onClick={() => handleBotAction('start')}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                Start Bot
              </button>
            ) : (
              <button
                onClick={() => handleBotAction('stop')}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium disabled:opacity-50"
              >
                <Square className="w-5 h-5" />
                Stop Bot
              </button>
            )}

            <button
              onClick={() => handleBotAction('run_now')}
              disabled={actionLoading || !isRunning}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
            >
              <Zap className="w-5 h-5" />
              Run Now
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>

            <button
              onClick={() => confirm('⚠️ Delete ALL data?') && handleBotAction('reset')}
              disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>

            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium ml-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capital ($)</label>
                  <input 
                    type="number" 
                    value={capital} 
                    onChange={(e) => setCapital(Number(e.target.value))} 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Risk (%)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={maxRisk * 100} 
                    onChange={(e) => setMaxRisk(Number(e.target.value) / 100)} 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Positions</label>
                  <input 
                    type="number" 
                    value={maxPositions} 
                    onChange={(e) => setMaxPositions(Number(e.target.value))} 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interval (min)</label>
                  <input 
                    type="number" 
                    value={checkInterval} 
                    onChange={(e) => setCheckInterval(Number(e.target.value))} 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={handleSaveSettings} 
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
                >
                  Save
                </button>
                <button 
                  onClick={() => setShowSettings(false)} 
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="mt-4 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isRunning ? 'Bot Running' : 'Bot Stopped'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Capital */}
          <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Capital</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${status.capital.toFixed(2)}
            </p>
            <p className={`text-sm mt-1 ${status.totalPnLPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ROI: {status.totalPnLPercent.toFixed(2)}%
            </p>
          </div>

          {/* Positions */}
          <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Positions</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {status.openPositions}/{maxPositions}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active</p>
          </div>

          {/* Win Rate */}
          <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Win Rate</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {(status.winRate * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {status.totalTrades} trades
            </p>
          </div>

          {/* Total PnL */}
          <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total PnL</p>
            <p className={`text-3xl font-bold ${status.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${status.totalPnL.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {status.totalTrades} trades
            </p>
          </div>
        </div>

        {/* Learning Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equity Curve */}
          {equityCurve.length > 0 && (
            <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Equity Curve</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={equityCurve}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="capital" stroke="#3b82f6" strokeWidth={2} name="Capital" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Strategy Usage */}
          {strategyChartData.length > 0 && (
            <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Strategy Usage</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={strategyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Q-Values Visualization */}
        <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Q-Learning Values</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={qValuesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="state" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Higher values = Bot learned this strategy works well in this market regime
          </p>
        </div>

        {/* Q-Values Table */}
        <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Q-Learning Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Regime</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Trend</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Mean Rev</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Breakout</th>
                </tr>
              </thead>
              <tbody>
                {['trending_up', 'trending_down', 'ranging', 'high_volatility'].map((regime) => (
                  <tr key={regime} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 font-medium capitalize text-gray-900 dark:text-white">
                      {regime.replace('_', ' ')}
                    </td>
                    {['trend_following', 'mean_reversion', 'breakout'].map((strategy) => {
                      const qVal = qValues.find(q => q.state === `${regime}_${strategy}`);
                      const value = qVal?.qValue || 0;
                      const colorClass = value > 0.05 ? 'bg-green-200 text-green-900 dark:bg-green-900/30 dark:text-green-400' :
                                        value > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-500' :
                                        value > -0.05 ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-500' :
                                        'bg-red-200 text-red-900 dark:bg-red-900/30 dark:text-red-400';
                      return (
                        <td key={`${regime}_${strategy}`} className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded font-mono text-xs font-semibold ${colorClass}`}>
                            {value.toFixed(4)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Positions & Trades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Positions */}
          <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Positions Actives ({positions.length})
            </h3>
            {positions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Aucune position ouverte</p>
            ) : (
              <div className="space-y-3">
                {positions.map((pos) => (
                  <div key={pos.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-900 dark:text-white">{pos.symbol}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        pos.side === 'long' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {pos.side.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Entry: ${pos.entryPrice.toFixed(2)} | SL: ${pos.stopLoss.toFixed(2)} | TP: ${pos.takeProfit.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Strategy: {pos.strategy.replace('_', ' ')} | Regime: {pos.regime}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trades */}
          <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Trades Récents ({trades.length})
            </h3>
            {trades.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Aucun trade pour le moment</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {trades.slice(0, 10).map((trade) => (
                  <div key={trade.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-900 dark:text-white">{trade.symbol}</span>
                      <span className={`font-bold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)} ({trade.pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {trade.strategy.replace('_', ' ')} | {trade.exitReason.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Last updated: {new Date().toLocaleTimeString()} | Auto-refresh every 10s
        </div>
      </div>
    </main>
  );
}