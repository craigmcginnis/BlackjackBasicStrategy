import { Injectable } from '@angular/core';
import { SessionStatEntry } from './storage.service';

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

@Injectable({ providedIn: 'root' })
export class AnalyticsMetricsService {
	computeTotals(history: SessionStatEntry[]): TotalsMetrics {
		const attempts = history.reduce((s, h) => s + h.attempts, 0);
		const correct = history.reduce((s, h) => s + h.correct, 0);
		const accuracy = attempts ? (correct / attempts) * 100 : 0;
		const times = history.filter((h) => h.ms != null).map((h) => h.ms!);
		const avgTime = times.length ? times.reduce((s, v) => s + v, 0) / times.length : 0;
		return { attempts, correct, accuracy, avgTime };
	}
	computeHintUsage(history: SessionStatEntry[]): HintMetrics {
		const drill = history.filter((h) => h.mode === 'drill');
		const total = drill.length;
		const withHint = drill.filter((h) => h.usedHint).length;
		return { total, withHint, hintRate: total ? (withHint / total) * 100 : 0 };
	}
	computeRecent(history: SessionStatEntry[], count = 25) {
		return [...history].slice(-count).reverse();
	}
	computeSpark(history: SessionStatEntry[], count = 50) {
		const last = [...history].slice(-count);
		return last.map((h) => (h.attempts ? (h.correct / h.attempts) * 100 : 0));
	}
	computeActionStats(history: SessionStatEntry[]): ActionStat[] {
		const map: Record<string, { attempts: number; correct: number }> = {};
		for (const h of history) {
			if (!h.expected) continue;
			const m = (map[h.expected] ||= { attempts: 0, correct: 0 });
			m.attempts += h.attempts;
			m.correct += h.correct;
		}
		return Object.entries(map)
			.map(([action, v]) => ({
				action,
				attempts: v.attempts,
				correct: v.correct,
				acc: v.attempts ? v.correct / v.attempts : 0
			}))
			.sort((a, b) => a.action.localeCompare(b.action));
	}
	computeWeakest(history: SessionStatEntry[], minAttempts = 3, limit = 10): WeakScenario[] {
		const map: Record<string, { attempts: number; correct: number }> = {};
		for (const h of history) {
			if (!h.scenario) continue;
			const m = (map[h.scenario] ||= { attempts: 0, correct: 0 });
			m.attempts += h.attempts;
			m.correct += h.correct;
		}
		return Object.entries(map)
			.map(([scenario, v]) => ({ scenario, acc: v.correct / v.attempts, attempts: v.attempts }))
			.filter((x) => x.attempts >= minAttempts)
			.sort((a, b) => a.acc - b.acc)
			.slice(0, limit);
	}
	computeActionTrends(history: SessionStatEntry[], window = 30) {
		// Returns map action -> array of rolling accuracy (%) over last N entries containing that action
		const perAction: Record<string, SessionStatEntry[]> = {};
		for (const h of history) {
			if (!h.expected) continue;
			(perAction[h.expected] ||= []).push(h);
		}
		const trends: Record<string, number[]> = {};
		for (const action of Object.keys(perAction)) {
			const list = perAction[action];
			const last = list.slice(-window);
			const acc: number[] = [];
			let runAttempts = 0,
				runCorrect = 0;
			for (const e of last) {
				runAttempts += e.attempts;
				runCorrect += e.correct;
				acc.push(runAttempts ? (runCorrect / runAttempts) * 100 : 0);
			}
			trends[action] = acc;
		}
		return trends;
	}
	computeHardestActions(history: SessionStatEntry[], minAttempts = 5, limit = 3): HardAction[] {
		const stats = this.computeActionStats(history)
			.filter((s) => s.attempts >= minAttempts)
			.sort((a, b) => a.acc - b.acc)
			.slice(0, limit)
			.map((s) => ({ action: s.action, acc: s.acc, attempts: s.attempts }));
		return stats;
	}

	computeOverdueSrs(
		entries: SessionStatEntry[],
		srsMap: Record<string, any>,
		now = Date.now(),
		limit = 10
	): OverdueMetric[] {
		const due: OverdueMetric[] = [];
		for (const key of Object.keys(srsMap)) {
			const e = srsMap[key];
			if (!e || !e.nextDue) continue;
			if (now > e.nextDue) {
				due.push({ key, overdueMinutes: Math.round((now - e.nextDue) / 60000), ef: e.ef, lapses: e.lapses });
			}
		}
		return due.sort((a, b) => b.overdueMinutes - a.overdueMinutes).slice(0, limit);
	}

	computeTimeDistribution(history: SessionStatEntry[]): TimeBucket[] {
		const buckets: { [k: string]: number } = {
			'<250ms': 0,
			'250-500ms': 0,
			'500ms-1s': 0,
			'1-2s': 0,
			'2-5s': 0,
			'>5s': 0
		};
		for (const h of history) {
			if (h.ms == null) continue;
			const ms = h.ms;
			let key: string;
			if (ms < 250) key = '<250ms';
			else if (ms < 500) key = '250-500ms';
			else if (ms < 1000) key = '500ms-1s';
			else if (ms < 2000) key = '1-2s';
			else if (ms < 5000) key = '2-5s';
			else key = '>5s';
			buckets[key]++;
		}
		return Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));
	}
}
