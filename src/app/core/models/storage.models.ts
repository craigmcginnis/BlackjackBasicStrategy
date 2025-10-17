import { RuleSet } from './blackjack.models';

export interface SessionStatEntry {
    ts: number;
    mode: 'drill' | 'flash';
    correct: number;
    attempts: number;
    expected?: string;
    chosen?: string;
    scenario?: string;
    ms?: number;
    usedHint?: boolean;
    difficulty?: string;
}

export interface AggregatedStats {
    history: SessionStatEntry[];
}

export interface SrsEntry {
    consecutive: number;
    intervalIndex: number;
    nextDue: number;
    ef: number;
    reviewCount: number;
    lastInterval: number;
    lapses?: number;
}

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

export interface ISrsRepository {
    loadSrs(): Record<string, SrsEntry>;
    saveSrs(map: Record<string, SrsEntry>): void;
    updateSrsOnAnswer(key: string, correct: boolean): SrsEntry;
}

export interface IRuleSetRepository {
    loadRuleSet(): RuleSet | null;
    saveRuleSet(rules: RuleSet): void;
}

// Facade interface combining all repositories for convenient DI
export interface IStorageFacade extends IStatsRepository, IMasteryRepository, ISrsRepository, IRuleSetRepository {
    getStreaks(): { current: number; best: number };
    loadDifficulty(): 'HARD_TOTALS' | 'SOFT_TOTALS' | 'PAIRS' | 'ALL';
    saveDifficulty(level: 'HARD_TOTALS' | 'SOFT_TOTALS' | 'PAIRS' | 'ALL'): void;
}