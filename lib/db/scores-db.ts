// lib/db/scores-db.ts
import Database from 'better-sqlite3';
import { existsSync } from 'fs';

const DB_PATH = './dashflux-scores.db';

export interface AssetScore {
  symbol: string;
  score: number;
  
  // Piliers
  technicalScore?: number;
  flowsScore?: number;
  macroScore?: number;
  valuationScore?: number;
  sentimentScore?: number;
  seasonalityScore?: number;
  
  // Métriques
  momentum1m?: number;
  momentum3m?: number;
  momentum6m?: number;
  volatility?: number;
  
  // Régime
  regime?: string;
  
  // Catégorie
  category?: string;
  
  // Timestamps
  lastUpdated: number;
  
  // Prix
  price?: number;
  change24h?: number;
}

export class ScoresDatabase {
  private db: Database.Database;

  constructor() {
    this.db = new Database(DB_PATH);
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS asset_scores (
        symbol TEXT PRIMARY KEY,
        score REAL NOT NULL,
        technical_score REAL,
        flows_score REAL,
        macro_score REAL,
        valuation_score REAL,
        sentiment_score REAL,
        seasonality_score REAL,
        momentum_1m REAL,
        momentum_3m REAL,
        momentum_6m REAL,
        volatility REAL,
        regime TEXT,
        category TEXT,
        last_updated INTEGER NOT NULL,
        price REAL,
        change_24h REAL
      );

      CREATE INDEX IF NOT EXISTS idx_scores ON asset_scores(score DESC);
      CREATE INDEX IF NOT EXISTS idx_category ON asset_scores(category);
      CREATE INDEX IF NOT EXISTS idx_updated ON asset_scores(last_updated DESC);
    `);
  }

  saveScore(assetScore: AssetScore) {
    this.db.prepare(`
      INSERT OR REPLACE INTO asset_scores (
        symbol, score, technical_score, flows_score, macro_score, 
        valuation_score, sentiment_score, seasonality_score,
        momentum_1m, momentum_3m, momentum_6m, volatility,
        regime, category, last_updated, price, change_24h
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      assetScore.symbol,
      assetScore.score,
      assetScore.technicalScore || null,
      assetScore.flowsScore || null,
      assetScore.macroScore || null,
      assetScore.valuationScore || null,
      assetScore.sentimentScore || null,
      assetScore.seasonalityScore || null,
      assetScore.momentum1m || null,
      assetScore.momentum3m || null,
      assetScore.momentum6m || null,
      assetScore.volatility || null,
      assetScore.regime || null,
      assetScore.category || null,
      assetScore.lastUpdated,
      assetScore.price || null,
      assetScore.change24h || null
    );
  }

  saveScores(scores: AssetScore[]) {
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO asset_scores (
        symbol, score, technical_score, flows_score, macro_score, 
        valuation_score, sentiment_score, seasonality_score,
        momentum_1m, momentum_3m, momentum_6m, volatility,
        regime, category, last_updated, price, change_24h
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const saveMany = this.db.transaction((scores: AssetScore[]) => {
      for (const score of scores) {
        insert.run(
          score.symbol,
          score.score,
          score.technicalScore || null,
          score.flowsScore || null,
          score.macroScore || null,
          score.valuationScore || null,
          score.sentimentScore || null,
          score.seasonalityScore || null,
          score.momentum1m || null,
          score.momentum3m || null,
          score.momentum6m || null,
          score.volatility || null,
          score.regime || null,
          score.category || null,
          score.lastUpdated,
          score.price || null,
          score.change24h || null
        );
      }
    });

    saveMany(scores);
  }

  getAllScores(): AssetScore[] {
    const rows = this.db.prepare(`
      SELECT * FROM asset_scores ORDER BY score DESC
    `).all() as any[];

    return rows.map(row => ({
      symbol: row.symbol,
      score: row.score,
      technicalScore: row.technical_score,
      flowsScore: row.flows_score,
      macroScore: row.macro_score,
      valuationScore: row.valuation_score,
      sentimentScore: row.sentiment_score,
      seasonalityScore: row.seasonality_score,
      momentum1m: row.momentum_1m,
      momentum3m: row.momentum_3m,
      momentum6m: row.momentum_6m,
      volatility: row.volatility,
      regime: row.regime,
      category: row.category,
      lastUpdated: row.last_updated,
      price: row.price,
      change24h: row.change_24h
    }));
  }

  getScoresByCategory(category: string): AssetScore[] {
    const rows = this.db.prepare(`
      SELECT * FROM asset_scores WHERE category = ? ORDER BY score DESC
    `).all(category) as any[];

    return rows.map(row => ({
      symbol: row.symbol,
      score: row.score,
      technicalScore: row.technical_score,
      flowsScore: row.flows_score,
      macroScore: row.macro_score,
      valuationScore: row.valuation_score,
      sentimentScore: row.sentiment_score,
      seasonalityScore: row.seasonality_score,
      momentum1m: row.momentum_1m,
      momentum3m: row.momentum_3m,
      momentum6m: row.momentum_6m,
      volatility: row.volatility,
      regime: row.regime,
      category: row.category,
      lastUpdated: row.last_updated,
      price: row.price,
      change24h: row.change_24h
    }));
  }

  getTopScores(limit: number = 10): AssetScore[] {
    const rows = this.db.prepare(`
      SELECT * FROM asset_scores ORDER BY score DESC LIMIT ?
    `).all(limit) as any[];

    return rows.map(row => ({
      symbol: row.symbol,
      score: row.score,
      technicalScore: row.technical_score,
      flowsScore: row.flows_score,
      macroScore: row.macro_score,
      valuationScore: row.valuation_score,
      sentimentScore: row.sentiment_score,
      seasonalityScore: row.seasonality_score,
      momentum1m: row.momentum_1m,
      momentum3m: row.momentum_3m,
      momentum6m: row.momentum_6m,
      volatility: row.volatility,
      regime: row.regime,
      category: row.category,
      lastUpdated: row.last_updated,
      price: row.price,
      change24h: row.change_24h
    }));
  }

  getScore(symbol: string): AssetScore | null {
    const row = this.db.prepare(`
      SELECT * FROM asset_scores WHERE symbol = ?
    `).get(symbol) as any;

    if (!row) return null;

    return {
      symbol: row.symbol,
      score: row.score,
      technicalScore: row.technical_score,
      flowsScore: row.flows_score,
      macroScore: row.macro_score,
      valuationScore: row.valuation_score,
      sentimentScore: row.sentiment_score,
      seasonalityScore: row.seasonality_score,
      momentum1m: row.momentum_1m,
      momentum3m: row.momentum_3m,
      momentum6m: row.momentum_6m,
      volatility: row.volatility,
      regime: row.regime,
      category: row.category,
      lastUpdated: row.last_updated,
      price: row.price,
      change24h: row.change_24h
    };
  }

  getLastUpdateTime(): number {
    const row = this.db.prepare(`
      SELECT MAX(last_updated) as max_time FROM asset_scores
    `).get() as any;

    return row?.max_time || 0;
  }

  close() {
    this.db.close();
  }
}