'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Play, Square, Zap, RotateCcw, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface Bot1Status {
  control: {
    is_running: boolean;
    capital: number;
    buy_score_threshold: number;
    sell_score_threshold: number;
    max_positions: number;
    check_interval_ms: number;
  };
  positions: Array<{
    id: number;
    symbol: string;
    entry_price: number;
    quantity: number;
    entry_score: number;
    current_score: number;
    unrealized_pnl: number;
    opened_at: number;
  }>;
  performance: {
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    total_pnl: number;
    win_rate: number;
    current_capital: number;
    roi: number;
  };
}

interface Trade {
  id: number;
  symbol: string;
  action: string;
  entry_price: number;
  exit_price: number | null;
  pnl: number;
  reason: string;
  opened_at: number;
  closed_at: number | null;
}

export default function Bot1Dashboard() {
  const [status, setStatus] = useState<Bot1Status | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [capital, setCapital] = useState(1000);
  const [buyThreshold, setBuyThreshold] = useState(75);
  const [sellThreshold, setSellThreshold] = useState(60);
  const [maxPositions, setMaxPositions] = useState(5);
  const [checkInterval, setCheckInterval] = useState(60);

  const fetchData = async () => {
    try {
      const [statusRes, tradesRes] = await Promise.all([
        fetch('/api/bot1/status'),
        fetch('/api/bot1/trades?limit=20')
      ]);
      
      const statusData = await statusRes.json();
      const tradesData = await tradesRes.json();
      
      setStatus(statusData);
      setTrades(tradesData.trades || []);
      
      // Update local settings from server
      if (statusData.control) {
        setCapital(statusData.control.capital);
        setBuyThreshold(statusData.control.buy_score_threshold);
        setSellThreshold(statusData.control.sell_score_threshold);
        setMaxPositions(statusData.control.max_positions);
        setCheckInterval(statusData.control.check_interval_ms / 60000);
      }
    } catch (error) {
      console.error('Error fetching bot1 data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleControl = async (action: string) => {
    try {
      await fetch('/api/bot1/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      fetchData();
    } catch (error) {
      console.error('Error controlling bot:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/bot1/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_config',
          capital,
          buy_score_threshold: buyThreshold,
          sell_score_threshold: sellThreshold,
          max_positions: maxPositions,
          check_interval_ms: checkInterval * 60000
        })
      });
      setShowSettings(false);
      fetchData();
      alert('✅ Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('❌ Error updating settings');
    }
  };

  if (loading || !status) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const { control, positions, performance } = status;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0f1419] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Bot Executor
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Trade automatique basé sur scores DashFlux
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Contrôles</h2>
          
          <div className="flex gap-4 flex-wrap">
            {!control.is_running ? (
              <button
                onClick={() => handleControl('start')}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
              >
                <Play className="w-5 h-5" />
                Start Bot
              </button>
            ) : (
              <button
                onClick={() => handleControl('stop')}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
              >
                <Square className="w-5 h-5" />
                Stop Bot
              </button>
            )}

            <button
              onClick={() => handleControl('run_now')}
              disabled={!control.is_running}
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
              onClick={() => handleControl('reset')}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Modifier les Paramètres</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Capital ($)
                  </label>
                  <input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Buy Score Threshold
                  </label>
                  <input
                    type="number"
                    value={buyThreshold}
                    onChange={(e) => setBuyThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sell Score Threshold
                  </label>
                  <input
                    type="number"
                    value={sellThreshold}
                    onChange={(e) => setSellThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Positions
                  </label>
                  <input
                    type="number"
                    value={maxPositions}
                    onChange={(e) => setMaxPositions(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Check Interval (min)
                  </label>
                  <input
                    type="number"
                    value={checkInterval}
                    onChange={(e) => setCheckInterval(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="mt-4 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${control.is_running ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {control.is_running ? 'Bot Running' : 'Bot Stopped'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Capital */}
          <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Capital</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${performance.current_capital.toFixed(2)}
            </p>
            <p className={`text-sm mt-1 ${performance.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ROI: {performance.roi.toFixed(2)}%
            </p>
          </div>

          {/* Positions */}
          <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Positions</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {positions.length}/{control.max_positions}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active</p>
          </div>

          {/* Win Rate */}
          <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Win Rate</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {performance.win_rate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {performance.winning_trades}W / {performance.losing_trades}L
            </p>
          </div>

          {/* Total PnL */}
          <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total PnL</p>
            <p className={`text-3xl font-bold ${performance.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${performance.total_pnl.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {performance.total_trades} trades
            </p>
          </div>
        </div>

        {/* Positions Table */}
        <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Positions Actives ({positions.length})
          </h2>
          
          {positions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Aucune position ouverte</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Symbol</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Entry</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Qty</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Entry Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Current Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">PnL</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">{pos.symbol}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        ${pos.entry_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {pos.quantity.toFixed(4)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-sm">
                          {pos.entry_score.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            pos.current_score >= pos.entry_score 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {pos.current_score.toFixed(1)}
                          </span>
                          {pos.current_score >= pos.entry_score ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${pos.unrealized_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${pos.unrealized_pnl.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                        {Math.floor((Date.now() - pos.opened_at) / 60000)}m
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Trades */}
        <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Trades Récents ({trades.length})
          </h2>
          
          {trades.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Aucun trade pour le moment</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Symbol</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Entry</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Exit</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">PnL</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Reason</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">{trade.symbol}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.action === 'open' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {trade.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        ${trade.entry_price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {trade.action === 'close' && (
                          <span className={`font-medium ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${trade.pnl.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {trade.reason}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(trade.opened_at).toLocaleString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Current Settings Display */}
        <div className="bg-white dark:bg-[#1a1f27] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Paramètres Actuels</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Buy Score Threshold</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{control.buy_score_threshold}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sell Score Threshold</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{control.sell_score_threshold}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Check Interval</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {control.check_interval_ms / 60000}min
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}