import { SessionStatEntry } from './storage.models';

export interface TotalsMetrics {
    attempts: number;
    correct: number;
    accuracy: number;
    avgTime: number;
}

export interface HintMetrics {
    total: number;
    withHint: number;
    hintRate: number;
}

export interface ActionStat {
    action: string;
    attempts: number;
    correct: number;
    acc: number;
}

export interface HardAction {
    action: string;
    acc: number;
    attempts: number;
}

export interface WeakScenario {
    scenario: string;
    acc: number;
    attempts: number;
}

export interface OverdueMetric {
    key: string;
    overdueMinutes: number;
    ef: number;
    lapses?: number;
}

export interface TimeBucket {
    bucket: string;
    count: number;
}