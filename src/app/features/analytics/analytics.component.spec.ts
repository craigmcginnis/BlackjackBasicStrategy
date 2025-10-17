import { TestBed } from '@angular/core/testing';
import { AnalyticsComponent } from './analytics.component';
import { STORAGE_FACADE } from '../../core/services/storage.service';
import { AggregatedStats, IStorageFacade, SessionStatEntry } from '../../core/models';

class MockStorageFacade implements IStorageFacade {
	private stats: AggregatedStats = { history: [] };
	private difficulty: 'HARD_TOTALS' | 'SOFT_TOTALS' | 'PAIRS' | 'ALL' = 'ALL';
	loadStats() {
		return this.stats;
	}
	saveStats(s: AggregatedStats) {
		this.stats = s;
	}
	recordSession(e: SessionStatEntry) {
		this.stats.history.push(e);
	}
	loadMastery() {
		return {};
	}
	saveMastery(_m: Record<string, number>) { }
	incrementMastery(_k: string) { }
	loadSrs() {
		return {};
	}
	saveSrs(_m: any) { }
	updateSrsOnAnswer() {
		return {
			consecutive: 0,
			intervalIndex: 0,
			nextDue: Date.now(),
			ef: 2.5,
			reviewCount: 0,
			lastInterval: 0,
			lapses: 0
		};
	}
	loadRuleSet() {
		return null;
	}
	saveRuleSet(_r: any) { }
	getStreaks() {
		return { current: 3, best: 7 };
	}
	loadDifficulty() { return this.difficulty; }
	saveDifficulty(l: 'HARD_TOTALS' | 'SOFT_TOTALS' | 'PAIRS' | 'ALL') { this.difficulty = l; }
}

describe('AnalyticsComponent', () => {
	let component: AnalyticsComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [AnalyticsComponent],
			providers: [{ provide: STORAGE_FACADE, useClass: MockStorageFacade }]
		});
		const fixture = TestBed.createComponent(AnalyticsComponent);
		component = fixture.componentInstance;
	});

	function setHistory(entries: any[]) {
		const storage = TestBed.inject(STORAGE_FACADE) as unknown as MockStorageFacade;
		storage.saveStats({ history: entries });
		// Force component to reload by calling private recalc via (any) cast
		(component as any).recalc();
	}

	it('computes totals, accuracy, avgTime', () => {
		setHistory([
			{ ts: 1, mode: 'flash', correct: 1, attempts: 2, ms: 100 },
			{ ts: 2, mode: 'drill', correct: 2, attempts: 3, ms: 200 }
		]);
		expect(component.totAttempts()).toBe(5);
		expect(component.totCorrect()).toBe(3);
		expect(component.accuracy()).toBeCloseTo(60, 1); // 3/5 * 100
		expect(component.avgTime()).toBeCloseTo(150, 0);
	});

	it('builds per-action stats sorted by action name', () => {
		setHistory([
			{ ts: 1, mode: 'flash', correct: 1, attempts: 1, expected: 'HIT' },
			{ ts: 2, mode: 'flash', correct: 0, attempts: 2, expected: 'STAND' },
			{ ts: 3, mode: 'drill', correct: 1, attempts: 1, expected: 'HIT' }
		]);
		const stats = component.actionStats();
		expect(stats.length).toBe(2);
		const hit = stats.find((s) => s.action === 'HIT')!;
		const stand = stats.find((s) => s.action === 'STAND')!;
		expect(hit.attempts).toBe(2);
		expect(hit.correct).toBe(2);
		expect(hit.acc).toBe(1);
		expect(stand.attempts).toBe(2);
		expect(stand.correct).toBe(0);
	});

	it('derives weakest scenarios with minimum attempts filter', () => {
		setHistory([
			{ ts: 1, mode: 'flash', correct: 1, attempts: 3, scenario: 'H-10-D10' },
			{ ts: 2, mode: 'flash', correct: 3, attempts: 3, scenario: 'H-9-D2' },
			{ ts: 3, mode: 'drill', correct: 2, attempts: 3, scenario: 'S-A7-D10' }
		]);
		const weakest = component.weakest();
		expect(weakest[0].scenario).toBe('H-10-D10');
		// All have >=3 attempts so count should be 3
		expect(weakest.length).toBe(3);
	});

	it('computes spark rolling accuracy for up to last 50 entries', () => {
		const many = Array.from({ length: 60 }).map((_, i) => ({ ts: i, mode: 'flash', correct: 1, attempts: 1 }));
		setHistory(many);
		expect(component.spark().length).toBe(50);
	});

	it('exposes streaks from storage facade', () => {
		const s = component.streaks();
		expect(s.best).toBe(7);
	});
});
