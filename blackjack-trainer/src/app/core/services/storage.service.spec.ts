import { StorageService } from './storage.service';

describe('StorageService SRS adaptive algorithm', () => {
	let svc: StorageService;
	beforeEach(() => {
		svc = new StorageService();
		try {
			localStorage.clear();
		} catch {
			/* ignore */
		}
	});

	it('initial correct answers increase interval and ef', () => {
		const first = svc.updateSrsOnAnswer('H-10-D2', true);
		expect(first.reviewCount).toBe(1);
		const second = svc.updateSrsOnAnswer('H-10-D2', true);
		expect(second.reviewCount).toBe(2);
		const third = svc.updateSrsOnAnswer('H-10-D2', true);
		expect(third.reviewCount).toBe(3);
		expect(third.lastInterval).toBeGreaterThan(second.lastInterval);
		expect(third.ef).toBeGreaterThanOrEqual(2.5); // may rise slightly
	});

	it('incorrect answer resets progression and lowers ef modestly', () => {
		svc.updateSrsOnAnswer('S-A7-D10', true);
		const beforeFail = svc.updateSrsOnAnswer('S-A7-D10', true);
		const fail = svc.updateSrsOnAnswer('S-A7-D10', false);
		// Early failure (reviewCount <3) should hard reset to 0
		expect(fail.reviewCount).toBe(0);
		expect(fail.nextDue - Date.now()).toBeLessThan(65 * 1000);
		expect(fail.ef).toBeLessThan(beforeFail.ef);
	});

	it('lapse after maturity sets reviewCount to 1 and schedules short reintroduction', () => {
		const key = 'H-16-D10';
		svc.updateSrsOnAnswer(key, true); // 1
		svc.updateSrsOnAnswer(key, true); // 2
		svc.updateSrsOnAnswer(key, true); // 3 (mature threshold)
		const mature = svc.updateSrsOnAnswer(key, true); // 4
		const efBefore = mature.ef;
		const lapse = svc.updateSrsOnAnswer(key, false);
		expect(lapse.reviewCount).toBe(1); // partial reset
		expect(lapse.nextDue - Date.now()).toBeGreaterThan(4 * 60 * 1000); // ~5m
		expect(lapse.ef).toBeLessThan(efBefore);
		expect(lapse.lapses).toBeGreaterThanOrEqual(1);
	});

	it('overdue review applies EF penalty before scheduling next interval', () => {
		const key = 'S-A8-D6';
		svc.updateSrsOnAnswer(key, true); // 1
		svc.updateSrsOnAnswer(key, true); // 2
		const third = svc.updateSrsOnAnswer(key, true); // 3
		const map: any = (svc as any).loadSrs();
		const originalEf = third.ef;
		// Simulate being 2x interval late
		map[key].nextDue = Date.now() - third.lastInterval * 2;
		(svc as any).saveSrs(map);
		const after = svc.updateSrsOnAnswer(key, true);
		expect(after.ef).toBeLessThanOrEqual(originalEf); // should not increase due to lateness penalty
	});
});
