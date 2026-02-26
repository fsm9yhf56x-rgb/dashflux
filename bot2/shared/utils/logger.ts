// bot2/shared/utils/logger.ts
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import type { LogLevel, LogEntry } from '../types';

export class Logger {
  private logFile: string;
  private level: LogLevel;

  constructor(name: string, level: LogLevel = 'info') {
    const logsDir = './logs';
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }
    
    this.logFile = `${logsDir}/${name}.log`;
    this.level = level;
    
    if (!existsSync(this.logFile)) {
      writeFileSync(this.logFile, '');
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private formatMessage(level: LogLevel, context: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}\n`;
  }

  private log(level: LogLevel, context: string, message: string) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, context, message);
    console.log(formatted.trim());
    appendFileSync(this.logFile, formatted);
  }

  debug(context: string, message: string) {
    this.log('debug', context, message);
  }

  info(context: string, message: string) {
    this.log('info', context, message);
  }

  warn(context: string, message: string) {
    this.log('warn', context, message);
  }

  error(context: string, message: string) {
    this.log('error', context, message);
  }

  signal(symbol: string, signal: any) {
    const emoji = signal.type === 'buy' ? '🟢' : signal.type === 'sell' ? '🔴' : '⚪';
    this.info('Bot2', `${emoji} ${signal.type.toUpperCase()} ${symbol} @ $${signal.price.toFixed(2)} (${signal.strategy})`);
  }

  trade(action: string, position: any) {
    this.info('Portfolio', `${action}: ${position.side} ${position.symbol} @ $${position.entryPrice}`);
  }

  header(text: string) {
    const separator = '='.repeat(80);
    console.log(`\n${separator}\n${text}\n${separator}`);
    appendFileSync(this.logFile, `\n${separator}\n${text}\n${separator}\n`);
  }

  separator() {
    const sep = '='.repeat(80);
    console.log(sep);
    appendFileSync(this.logFile, `${sep}\n`);
  }
}

export class TelegramNotifier {
  private botToken?: string;
  private chatId?: string;

  constructor(botToken?: string, chatId?: string) {
    this.botToken = botToken;
    this.chatId = chatId;
  }

  async send(message: string) {
    if (!this.botToken || !this.chatId) return;
    console.log(`[Telegram] ${message}`);
  }

  async tradeAlert(trade: any) {
    const emoji = trade.pnl >= 0 ? '✅' : '❌';
    const message = `${emoji} Trade Closed\n${trade.symbol}: ${trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)} (${trade.pnlPercent.toFixed(2)}%)`;
    await this.send(message);
  }

  async errorAlert(error: string) {
    await this.send(`🚨 Error: ${error}`);
  }
}