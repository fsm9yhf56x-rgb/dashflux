// bot1/standalone/index.ts
import { DashFluxExecutor } from './executor';
import { Bot1Database } from '../shared/utils/db';
import { BOT1_CONFIG } from './config';

const db = new Bot1Database();
const executor = new DashFluxExecutor();

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

/**
 * Démarre le bot
 */
async function start() {
  if (isRunning) {
    console.log('[Bot1] Already running');
    return;
  }

  console.log('[Bot1] 🚀 Starting DashFlux Executor Bot...');
  console.log(`[Bot1] Check interval: ${BOT1_CONFIG.checkIntervalMs / 1000 / 60} minutes`);
  console.log(`[Bot1] Buy threshold: ${BOT1_CONFIG.buyScoreThreshold}`);
  console.log(`[Bot1] Sell threshold: ${BOT1_CONFIG.sellScoreThreshold}`);
  console.log(`[Bot1] Max positions: ${BOT1_CONFIG.maxPositions}`);
  
  isRunning = true;
  db.updateControl({ is_running: true });

  // Premier run immédiat
  await executor.run();

  // Boucle de vérification
  intervalId = setInterval(async () => {
    const control = db.getControl();
    
    if (!control.is_running) {
      console.log('[Bot1] Bot stopped from dashboard');
      stop();
      return;
    }

    // Check manual trigger
    if (control.should_run_now) {
      console.log('[Bot1] 🎯 Manual run triggered');
      db.updateControl({ should_run_now: false });
      await executor.run();
      return;
    }

    // Regular cycle
    await executor.run();
  }, BOT1_CONFIG.checkIntervalMs);

  console.log('[Bot1] ✅ Bot started successfully');
}

/**
 * Arrête le bot
 */
function stop() {
  if (!isRunning) {
    console.log('[Bot1] Not running');
    return;
  }

  console.log('[Bot1] 🛑 Stopping bot...');
  
  isRunning = false;
  db.updateControl({ is_running: false });
  
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  console.log('[Bot1] ✅ Bot stopped');
}

/**
 * Gestion arrêt propre
 */
process.on('SIGINT', () => {
  console.log('\n[Bot1] Received SIGINT, shutting down gracefully...');
  stop();
  executor.close();
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Bot1] Received SIGTERM, shutting down gracefully...');
  stop();
  executor.close();
  db.close();
  process.exit(0);
});

// Démarre le bot
start().catch(error => {
  console.error('[Bot1] Fatal error:', error);
  process.exit(1);
});