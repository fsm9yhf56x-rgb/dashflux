// bot2/shared/utils/indicators.ts
import { Candle, Indicators } from '../types';

export class TechnicalIndicators {
  static calculate(candles: Candle[]): Indicators {
    if (candles.length < 200) {
      throw new Error('Not enough candles for indicator calculation');
    }

    return {
      sma20: this.sma(candles, 20),
      sma50: this.sma(candles, 50),
      sma200: this.sma(candles, 200),
      ema12: this.ema(candles, 12),
      ema26: this.ema(candles, 26),
      rsi: this.rsi(candles, 14),
      atr: this.atr(candles, 14),
      adx: this.adx(candles, 14),
      bollingerUpper: this.bollingerBands(candles, 20).upper,
      bollingerLower: this.bollingerBands(candles, 20).lower,
      bollingerMiddle: this.bollingerBands(candles, 20).middle,
      donchianUpper: this.donchianChannel(candles, 20).upper,
      donchianLower: this.donchianChannel(candles, 20).lower,
      volumeMA: this.volumeMA(candles, 20)
    };
  }

  static sma(candles: Candle[], period: number): number {
    const closes = candles.slice(-period).map(c => c.close);
    return closes.reduce((a, b) => a + b, 0) / period;
  }

  static ema(candles: Candle[], period: number): number {
    const k = 2 / (period + 1);
    let ema = candles[0].close;

    for (let i = 1; i < candles.length; i++) {
      ema = candles[i].close * k + ema * (1 - k);
    }

    return ema;
  }

  static rsi(candles: Candle[], period: number = 14): number {
    const changes = [];
    for (let i = 1; i < candles.length; i++) {
      changes.push(candles[i].close - candles[i - 1].close);
    }

    const recentChanges = changes.slice(-period);
    const gains = recentChanges.filter(c => c > 0);
    const losses = recentChanges.filter(c => c < 0).map(c => Math.abs(c));

    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  static atr(candles: Candle[], period: number = 14): number {
    const trs = [];
    
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;

      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );

      trs.push(tr);
    }

    const recentTRs = trs.slice(-period);
    return recentTRs.reduce((a, b) => a + b, 0) / period;
  }

  static adx(candles: Candle[], period: number = 14): number {
    const dms = this.calculateDirectionalMovement(candles);
    const atrs = this.calculateATRs(candles, period);

    const plusDIs = [];
    const minusDIs = [];

    for (let i = 0; i < Math.min(dms.length, atrs.length); i++) {
      plusDIs.push((dms[i].plusDM / atrs[i]) * 100);
      minusDIs.push((dms[i].minusDM / atrs[i]) * 100);
    }

    const dxValues = [];
    for (let i = 0; i < plusDIs.length; i++) {
      const diff = Math.abs(plusDIs[i] - minusDIs[i]);
      const sum = plusDIs[i] + minusDIs[i];
      dxValues.push(sum === 0 ? 0 : (diff / sum) * 100);
    }

    const recentDX = dxValues.slice(-period);
    return recentDX.reduce((a, b) => a + b, 0) / period;
  }

  private static calculateDirectionalMovement(candles: Candle[]): Array<{ plusDM: number; minusDM: number }> {
    const dms = [];

    for (let i = 1; i < candles.length; i++) {
      const highDiff = candles[i].high - candles[i - 1].high;
      const lowDiff = candles[i - 1].low - candles[i].low;

      const plusDM = highDiff > lowDiff && highDiff > 0 ? highDiff : 0;
      const minusDM = lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0;

      dms.push({ plusDM, minusDM });
    }

    return dms;
  }

  private static calculateATRs(candles: Candle[], period: number): number[] {
    const atrs = [];

    for (let i = period; i < candles.length; i++) {
      const slice = candles.slice(i - period, i);
      atrs.push(this.atr(slice, period));
    }

    return atrs;
  }

  static bollingerBands(candles: Candle[], period: number = 20): { upper: number; middle: number; lower: number } {
    const middle = this.sma(candles, period);
    const closes = candles.slice(-period).map(c => c.close);
    
    const variance = closes.reduce((acc, close) => acc + Math.pow(close - middle, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    return {
      upper: middle + (stdDev * 2),
      middle,
      lower: middle - (stdDev * 2)
    };
  }

  static donchianChannel(candles: Candle[], period: number = 20): { upper: number; lower: number } {
    const recentCandles = candles.slice(-period);
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);

    return {
      upper: Math.max(...highs),
      lower: Math.min(...lows)
    };
  }

  static volumeMA(candles: Candle[], period: number = 20): number {
    const volumes = candles.slice(-period).map(c => c.volume);
    return volumes.reduce((a, b) => a + b, 0) / period;
  }
}