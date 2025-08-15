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
});
