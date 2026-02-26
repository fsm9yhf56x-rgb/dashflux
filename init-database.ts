// init-database.ts
// Script pour initialiser la base de données bot2-data.db

import Database from 'better-sqlite3';
import { join } from 'path';

// Chemin vers la base de données
const dbPath = join(process.cwd(), 'bot2-data.db');

console.log('🚀 Initialisation de la base de données...');
console.log('📍 Emplacement:', dbPath);

// Créer/ouvrir la base de données
const db = new Database(dbPath);

// Activer les clés étrangères
db.pragma('foreign_keys = ON');

console.log('✅ Base de données créée/ouverte');

// Créer la table pour le statut du bot
console.log('📊 Création de la table "status"...');
db.exec(`
  CREATE TABLE IF NOT EXISTS status (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    running INTEGER DEFAULT 0,
    last_update INTEGER,
    capital REAL DEFAULT 10000.0,
    total_pnl REAL DEFAULT 0.0,
    total_pnl_percent REAL DEFAULT 0.0,
    win_rate REAL DEFAULT 0.0,
    open_positions INTEGER DEFAULT 0,
    total_trades INTEGER DEFAULT 0
  );
`);

// Insérer les valeurs par défaut
db.exec(`
  INSERT OR IGNORE INTO status (id, running, capital, total_pnl, total_pnl_percent, win_rate, open_positions, total_trades)
  VALUES (1, 0, 10000.0, 0.0, 0.0, 0.0, 0, 0);
`);

// Créer la table pour les positions ouvertes
console.log('📊 Création de la table "positions"...');
db.exec(`
  CREATE TABLE IF NOT EXISTS positions (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('long', 'short')),
    entry_price REAL NOT NULL,
    quantity REAL NOT NULL,
    usd_value REAL NOT NULL,
    stop_loss REAL NOT NULL,
    take_profit REAL NOT NULL,
    strategy TEXT NOT NULL,
    regime TEXT NOT NULL,
    open_time INTEGER NOT NULL
  );
`);

// Créer la table pour l'historique des trades
console.log('📊 Création de la table "trades"...');
db.exec(`
  CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('long', 'short')),
    entry_price REAL NOT NULL,
    exit_price REAL NOT NULL,
    quantity REAL NOT NULL,
    pnl REAL NOT NULL,
    pnl_percent REAL NOT NULL,
    strategy TEXT NOT NULL,
    exit_reason TEXT NOT NULL,
    open_time INTEGER NOT NULL,
    close_time INTEGER NOT NULL,
    duration INTEGER NOT NULL
  );
`);

// Créer la table pour la Q-Table (apprentissage par renforcement)
console.log('📊 Création de la table "qtable"...');
db.exec(`
  CREATE TABLE IF NOT EXISTS qtable (
    state TEXT PRIMARY KEY,
    q_value REAL DEFAULT 0.0,
    visits INTEGER DEFAULT 0,
    last_update INTEGER
  );
`);

// Initialiser les états de la Q-Table
const regimes = ['trending_up', 'trending_down', 'ranging', 'high_volatility'];
const strategies = ['trend_following', 'mean_reversion', 'breakout'];

console.log('🧠 Initialisation de la Q-Table...');
const insertQValue = db.prepare(`
  INSERT OR IGNORE INTO qtable (state, q_value, visits, last_update)
  VALUES (?, 0.0, 0, ?)
`);

const now = Date.now();
regimes.forEach(regime => {
  strategies.forEach(strategy => {
    const state = `${regime}_${strategy}`;
    insertQValue.run(state, now);
  });
});

// Créer des index pour améliorer les performances
console.log('⚡ Création des index...');
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_trades_close_time ON trades(close_time DESC);
  CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol);
`);

// Vérifier que tout est bien créé
const tables = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
`).all();

console.log('\n✨ Base de données initialisée avec succès !');
console.log('📋 Tables créées:');
tables.forEach((table: any) => {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
  console.log(`   - ${table.name}: ${count.count} enregistrements`);
});

// Fermer la connexion
db.close();
console.log('\n🎉 Terminé ! Vous pouvez maintenant démarrer votre application.');
