import { Injectable, signal, InjectionToken } from '@angular/core';
import { RuleSet } from '../models/blackjack.models';

const SETTINGS_KEY = 'bj_settings_v1';
const STATS_KEY = 'bj_stats_v1';
const MASTERY_KEY = 'bj_mastery_v1';
const SRS_KEY = 'bj_srs_v1';

export interface SessionStatEntry { ts:number; mode:'drill'|'flash'; correct:number; attempts:number; expected?:string; chosen?:string; scenario?:string; ms?:number; usedHint?: boolean; }
export interface AggregatedStats { history: SessionStatEntry[]; }

// Repository abstractions for future backend swap
export interface IStatsRepository {
  loadStats(): AggregatedStats;
  saveStats(stats: AggregatedStats): void;
  recordSession(entry: SessionStatEntry): void;
}
export interface IMasteryRepository {
  loadMastery(): Record<string, number>;
  saveMastery(map: Record<string, number>): void;
  incrementMastery(scenario: string): void;
}
export interface SrsEntry { consecutive:number; intervalIndex:number; nextDue:number; ef:number; reviewCount:number; lastInterval:number; }
export interface ISrsRepository {
  loadSrs(): Record<string,SrsEntry>;
  saveSrs(map: Record<string,SrsEntry>): void;
  updateSrsOnAnswer(key:string, correct:boolean): SrsEntry;
}
export interface IRuleSetRepository {
  loadRuleSet(): RuleSet | null;
  saveRuleSet(rules: RuleSet): void;
}

// Facade interface combining all repositories for convenient DI
export interface IStorageFacade extends IStatsRepository, IMasteryRepository, ISrsRepository, IRuleSetRepository {
  getStreaks(): { current:number; best:number };
}
export const STORAGE_FACADE = new InjectionToken<IStorageFacade>('STORAGE_FACADE');

@Injectable({ providedIn: 'root' })
export class StorageService implements IStatsRepository, IMasteryRepository, ISrsRepository, IRuleSetRepository {
  private ruleSetSig = signal<RuleSet | null>(null);
  private statsSig = signal<AggregatedStats>({ history: [] });
  private currentStreak = 0;
  private bestStreak = 0;
  private masteryCache: Record<string, number> | null = null;
  private srsCache: Record<string,SrsEntry> | null = null;

  loadRuleSet(): RuleSet | null {
    if (this.ruleSetSig()) return this.ruleSetSig();
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as RuleSet;
      this.ruleSetSig.set(parsed);
      return parsed;
    } catch {
      return null;
    }
  }

  saveRuleSet(rules: RuleSet) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(rules));
    this.ruleSetSig.set(rules);
  }

  ruleSetSignal() { return this.ruleSetSig; }

  loadStats(): AggregatedStats {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if(!raw) return this.statsSig();
      const parsed = JSON.parse(raw) as AggregatedStats;
      this.statsSig.set(parsed);
      return parsed;
    } catch { return this.statsSig(); }
  }
  saveStats(stats: AggregatedStats){
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    this.statsSig.set(stats);
  }
  recordSession(entry: SessionStatEntry){
    const cur = this.loadStats();
    cur.history.push(entry);
    // Streak logic: only increments on fully correct entry (all attempts correct)
    if(entry.attempts === entry.correct && entry.correct > 0){
      this.currentStreak += entry.correct; // treat count of correct in entry
    } else {
      this.currentStreak = 0;
    }
    if(this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;
    this.saveStats(cur);
  }
  getStreaks(){ return { current: this.currentStreak, best: this.bestStreak }; }
  statsSignal(){ return this.statsSig; }

  loadMastery(): Record<string, number> {
    if(this.masteryCache) return this.masteryCache as Record<string,number>;
    try {
      const raw = localStorage.getItem(MASTERY_KEY);
      this.masteryCache = raw ? JSON.parse(raw) : {};
    } catch { this.masteryCache = {}; }
    return this.masteryCache as Record<string,number>;
  }
  saveMastery(map: Record<string, number>){
    this.masteryCache = map;
    localStorage.setItem(MASTERY_KEY, JSON.stringify(map));
  }
  incrementMastery(scenario: string){
    const m = this.loadMastery();
    m[scenario] = (m[scenario] || 0) + 1;
    this.saveMastery(m);
  }

  // --- Spaced Repetition (SRS) ---
  loadSrs(){
    if(this.srsCache) return this.srsCache;
    try {
      const raw = localStorage.getItem(SRS_KEY);
      this.srsCache = raw ? JSON.parse(raw) : {};
    } catch { this.srsCache = {}; }
  return this.srsCache as Record<string,SrsEntry>;
  }
  saveSrs(map: Record<string,SrsEntry>){
    this.srsCache = map;
    localStorage.setItem(SRS_KEY, JSON.stringify(map));
  }
  updateSrsOnAnswer(key:string, correct:boolean){
    const map = this.loadSrs();
    if(!this.srsCache) this.srsCache = {};
    const srsMap = this.srsCache;
    const now = Date.now();
    let entry = srsMap[key];
    if(!entry){
      entry = { consecutive:0, intervalIndex:0, nextDue: now, ef:2.5, reviewCount:0, lastInterval:0 };
    }
    // SM-2 style adaptation simplified: quality=5 if correct else 2
    const quality = correct ? 5 : 2;
    // update ease factor
    entry.ef = Math.max(1.3, entry.ef + (0.1 - (5-quality)*(0.08 + (5-quality)*0.02)));
    if(correct){
      entry.consecutive += 1;
      entry.reviewCount += 1;
      let interval: number;
      if(entry.reviewCount === 1) interval = 5*60*1000; // 5m
      else if(entry.reviewCount === 2) interval = 30*60*1000; // 30m
      else {
        interval = Math.round(entry.lastInterval * entry.ef);
        // Cap growth for early stages
        interval = Math.min(interval, 30*24*60*60*1000); // max 30d for now
      }
      entry.lastInterval = interval;
      entry.nextDue = now + interval;
      entry.intervalIndex += 1;
    } else {
      // failure: quick retry and reduce ease factor slightly
      entry.consecutive = 0;
      entry.reviewCount = 0;
      entry.lastInterval = 0;
      entry.intervalIndex = 0;
      entry.nextDue = now + 30*1000; // 30s retry
    }
    srsMap[key] = entry;
    this.saveSrs(srsMap);
    return entry;
  }
}
