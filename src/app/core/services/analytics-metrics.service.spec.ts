import { TestBed } from '@angular/core/testing';
import { AnalyticsMetricsService } from './analytics-metrics.service';
import { SessionStatEntry } from './storage.service';

describe('AnalyticsMetricsService', () => {
	let svc: AnalyticsMetricsService;
	const history: SessionStatEntry[] = [
		{ ts: 1, mode: 'drill', correct: 1, attempts: 1, expected: 'HIT', chosen: 'HIT', scenario: 'H-10-D2', ms: 500 },
		{
			ts: 2,
			mode: 'drill',
			correct: 0,
			attempts: 1,
			expected: 'STAND',
			chosen: 'HIT',
			scenario: 'H-16-D10',
			ms: 900
		},
		{
			ts: 3,
			mode: 'flash',
			correct: 1,
			attempts: 1,
			expected: 'DOUBLE',
			chosen: 'DOUBLE',
			scenario: 'H-11-D6',
			ms: 700
		},
		{
			ts: 4,
			mode: 'flash',
			correct: 0,
			attempts: 1,
			expected: 'SPLIT',
			chosen: 'HIT',
			scenario: 'P-8-D10',
			ms: 600
		},
		{
			ts: 5,
			mode: 'flash',
			correct: 1,
			attempts: 1,
			expected: 'SPLIT',
			chosen: 'SPLIT',
			scenario: 'P-8-D6',
			ms: 650
		},
		{
			ts: 6,
			mode: 'drill',
			correct: 1,
			attempts: 1,
			expected: 'SURRENDER',
			chosen: 'SURRENDER',
			scenario: 'H-16-D11',
			ms: 800
		}
	];

	beforeEach(() => {
		TestBed.configureTestingModule({});
		svc = TestBed.inject(AnalyticsMetricsService);
	});

	it('computes totals correctly', () => {
		const t = svc.computeTotals(history);
		expect(t.attempts).toBe(6);
		expect(t.correct).toBe(4);
		expect(Math.round(t.accuracy)).toBe(Math.round((4 / 6) * 100));
		expect(t.avgTime).toBeGreaterThan(0);
	});

	it('computes action stats aggregated by expected action', () => {
		const stats = svc.computeActionStats(history);
		const hit = stats.find((s) => s.action === 'HIT');
		const stand = stats.find((s) => s.action === 'STAND');
		const split = stats.find((s) => s.action === 'SPLIT');
		expect(hit?.attempts).toBe(1);
		expect(stand?.attempts).toBe(1);
		expect(split?.attempts).toBe(2);
		expect(split?.correct).toBe(1); // one correct, one incorrect
	});

	it('computes weakest scenarios limited by min attempts', () => {
		const weakest = svc.computeWeakest(history, 1, 5);
		const first = weakest[0];
		expect(first.acc).toBeLessThan(1);
	});

	it('computes sparkline percentages', () => {
		const spark = svc.computeSpark(history);
		expect(spark.length).toBe(history.length);
		expect(spark.every((v) => v >= 0 && v <= 100)).toBeTrue();
	});

	it('computes per-action rolling trends', () => {
		const trend = svc.computeActionTrends(history, 5);
		expect(trend['HIT'].length).toBeGreaterThan(0);
		expect(trend['STAND'].length).toBe(1);
	});

	it('identifies hardest actions with minimum attempts', () => {
		const hard = svc.computeHardestActions(history, 1, 3);
		expect(hard.length).toBeGreaterThan(0);
		// Should include at least one action with <100% acc
		expect(hard.some((h) => h.acc < 1)).toBeTrue();
	});

	it('computes time distribution across all buckets', () => {
		const extended: SessionStatEntry[] = [
			{ ts: 10, mode: 'drill', correct: 1, attempts: 1, ms: 100 }, // <250ms
			{ ts: 11, mode: 'drill', correct: 1, attempts: 1, ms: 300 }, // 250-500ms
			{ ts: 12, mode: 'drill', correct: 1, attempts: 1, ms: 750 }, // 500ms-1s
			{ ts: 13, mode: 'drill', correct: 1, attempts: 1, ms: 1500 }, // 1-2s
			{ ts: 14, mode: 'drill', correct: 1, attempts: 1, ms: 2500 }, // 2-5s
			{ ts: 15, mode: 'drill', correct: 1, attempts: 1, ms: 6000 } // >5s
		];
		const dist = svc.computeTimeDistribution(extended);
		// Ensure each named bucket appears exactly once
		const names = dist.map((d) => d.bucket);
		expect(names).toEqual(['<250ms', '250-500ms', '500ms-1s', '1-2s', '2-5s', '>5s']);
		// Each bucket should have count 1
		dist.forEach((b) => expect(b.count).toBe(1));
	});

	it('classifies boundary times into correct buckets', () => {
		const edges: SessionStatEntry[] = [
			{ ts: 20, mode: 'drill', correct: 1, attempts: 1, ms: 249 }, // <250ms
			{ ts: 21, mode: 'drill', correct: 1, attempts: 1, ms: 250 }, // 250-500ms boundary start
			{ ts: 22, mode: 'drill', correct: 1, attempts: 1, ms: 499 }, // 250-500ms end
			{ ts: 23, mode: 'drill', correct: 1, attempts: 1, ms: 500 }, // 500ms-1s boundary start
			{ ts: 24, mode: 'drill', correct: 1, attempts: 1, ms: 999 }, // 500ms-1s end
			{ ts: 25, mode: 'drill', correct: 1, attempts: 1, ms: 1000 }, // 1-2s boundary start
			{ ts: 26, mode: 'drill', correct: 1, attempts: 1, ms: 1999 }, // 1-2s end
			{ ts: 27, mode: 'drill', correct: 1, attempts: 1, ms: 2000 }, // 2-5s boundary start
			{ ts: 28, mode: 'drill', correct: 1, attempts: 1, ms: 4999 }, // 2-5s end
			{ ts: 29, mode: 'drill', correct: 1, attempts: 1, ms: 5000 } // >5s boundary start
		];
		const dist = svc.computeTimeDistribution(edges);
		const map: Record<string, number> = {};
		dist.forEach((d) => (map[d.bucket] = d.count));
		expect(map['<250ms']).toBe(1); // only 249
		expect(map['250-500ms']).toBe(2); // 250 & 499
		expect(map['500ms-1s']).toBe(2); // 500 & 999
		expect(map['1-2s']).toBe(2); // 1000 & 1999
		expect(map['2-5s']).toBe(2); // 2000 & 4999
		expect(map['>5s']).toBe(1); // 5000
	});

	it('computes hint usage metrics including rate and zero-drill fallback', () => {
		const histWithHints: SessionStatEntry[] = [
			{ ts: 1, mode: 'drill', correct: 1, attempts: 1, usedHint: true },
			{ ts: 2, mode: 'drill', correct: 1, attempts: 1, usedHint: false },
			{ ts: 3, mode: 'flash', correct: 1, attempts: 1, usedHint: true }, // should be ignored (not drill)
			{ ts: 4, mode: 'drill', correct: 0, attempts: 1, usedHint: true }
		];
		const metrics = svc.computeHintUsage(histWithHints);
		expect(metrics.total).toBe(3); // only drill entries
		expect(metrics.withHint).toBe(2); // two drill with hints
		expect(Math.round(metrics.hintRate)).toBe(Math.round((2 / 3) * 100));
		// Zero case
		const zero = svc.computeHintUsage([]);
		expect(zero.hintRate).toBe(0);
	});

	it('returns most recent N entries in reverse chronological order', () => {
		const longHist: SessionStatEntry[] = [];
		for (let i = 0; i < 40; i++) {
			longHist.push({ ts: i + 1, mode: 'drill', correct: 1, attempts: 1 });
		}
		const recent = svc.computeRecent(longHist, 10);
		expect(recent.length).toBe(10);
		// First element should be latest (ts 40)
		expect(recent[0].ts).toBe(40);
		// Last element should be ts 31
		expect(recent[9].ts).toBe(31);
	});

	it('orders overdue SRS items by lateness and limits results', () => {
		const now = Date.now();
		const srsMap: Record<string, any> = {
			A: { nextDue: now - 60 * 1000, ef: 2.5, lapses: 0 }, // 1 min overdue
			B: { nextDue: now - 10 * 60 * 1000, ef: 2.4, lapses: 1 }, // 10 min overdue
			C: { nextDue: now + 5 * 60 * 1000, ef: 2.6, lapses: 0 }, // not overdue
			D: { nextDue: now - 3 * 60 * 1000, ef: 2.2, lapses: 2 } // 3 min overdue
		};
		const overdue = svc.computeOverdueSrs(history, srsMap, now, 2);
		// Expect only top 2 most overdue: B (10m) then D (3m)
		expect(overdue.length).toBe(2);
		expect(overdue[0].key).toBe('B');
		expect(overdue[1].key).toBe('D');
		// Ensure minutes are non-negative
		overdue.forEach((o) => expect(o.overdueMinutes).toBeGreaterThan(0));
	});
});
