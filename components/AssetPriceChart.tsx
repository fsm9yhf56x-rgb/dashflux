'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Props {
  ticker: string;
}

interface PricePoint {
  date: string;
  price: number;
  ma50?: number;
  ma200?: number;
}

export default function AssetPriceChart({ ticker }: Props) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const end = Math.floor(Date.now() / 1000);
        const start = end - (365 * 24 * 60 * 60); // 1 an
        
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${start}&period2=${end}&interval=1d`;
        
        const response = await fetch(url);
        const json = await response.json();
        
        const timestamps = json.chart.result[0].timestamp;
        const closes = json.chart.result[0].indicators.quote[0].close;
        
        const priceData = timestamps.map((ts: number, i: number) => ({
          date: new Date(ts * 1000).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
          price: closes[i],
        })).filter((d: any) => d.price !== null);
        
        // Calculer MA50 et MA200
        const withMA = priceData.map((point: any, i: number) => {
          let ma50 = null;
          let ma200 = null;
          
          if (i >= 50) {
            const sum50 = priceData.slice(i - 50, i).reduce((acc: number, p: any) => acc + p.price, 0);
            ma50 = sum50 / 50;
          }
          
          if (i >= 200) {
            const sum200 = priceData.slice(i - 200, i).reduce((acc: number, p: any) => acc + p.price, 0);
            ma200 = sum200 / 200;
          }
          
          return { ...point, ma50, ma200 };
        });
        
        setData(withMA);
      } catch (error) {
        console.error('Error fetching price data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-navy-900 rounded-lg shadow p-6 border border-gray-200 dark:border-navy-800">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-navy-800 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-navy-800 rounded"></div>
        </div>
      </div>
    );
  }

  const currentPrice = data[data.length - 1]?.price || 0;
  const ma50 = data[data.length - 1]?.ma50 || 0;
  const ma200 = data[data.length - 1]?.ma200 || 0;

  return (
    <div className="bg-white dark:bg-navy-900 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-navy-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-navy-700 dark:text-neon-yellow-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Graphique Prix (1 an)
          </h2>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Prix</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">MA50</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">MA200</span>
          </div>
        </div>
      </div>

      {/* Indicateurs techniques */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-navy-800 rounded p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Prix actuel</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">${currentPrice.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-navy-800 rounded p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">MA50</p>
          <p className={`text-lg font-bold ${currentPrice > ma50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${ma50.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-navy-800 rounded p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">MA200</p>
          <p className={`text-lg font-bold ${currentPrice > ma200 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${ma200.toFixed(2)}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
          <XAxis 
            dataKey="date" 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            style={{ fontSize: '12px' }}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: isDark ? '#001a33' : '#ffffff',
              border: `1px solid ${isDark ? '#003366' : '#d1d5db'}`,
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} name="Prix" />
          <Line type="monotone" dataKey="ma50" stroke="#f97316" strokeWidth={2} dot={false} name="MA50" />
          <Line type="monotone" dataKey="ma200" stroke="#a855f7" strokeWidth={2} dot={false} name="MA200" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}