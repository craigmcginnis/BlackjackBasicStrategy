import { STRATEGY_DATA } from './strategy.data';

describe('Strategy Data Variant Consistency', () => {
	const variants = Object.keys(STRATEGY_DATA);

	it('contains expected variant count (8)', () => {
		expect(variants.length).toBe(8);
	});

	it('all variants include mandatory matrices', () => {
		for (const k of variants) {
			const v = STRATEGY_DATA[k];
			expect(v.hard).toBeTruthy();
			expect(v.soft).toBeTruthy();
			expect(v.pairs).toBeTruthy();
		}
	});

	it('late surrender variants encode surrender decisions (16 vs 10)', () => {
		const ls = variants.filter((v) => v.includes('LS'));
		for (const k of ls) {
			const table = STRATEGY_DATA[k];
			expect(table.hard[16][10]).toBe('SURRENDER');
		}
	});

	it('non-surrender variants do not surrender 16 vs 10', () => {
		const noLs = variants.filter((v) => !v.includes('LS'));
		for (const k of noLs) {
			const table = STRATEGY_DATA[k];
			expect(table.hard[16][10]).not.toBe('SURRENDER');
		}
	});

	it('H17 variants double A6 vs 2, S17 variants do not', () => {
		const h17 = variants.filter((v) => v.startsWith('H17'));
		const s17 = variants.filter((v) => v.startsWith('S17'));
		for (const k of h17) {
			expect(STRATEGY_DATA[k].soft['A6'][2]).toBe('DOUBLE');
		}
		for (const k of s17) {
			expect(STRATEGY_DATA[k].soft['A6'][2]).not.toBe('DOUBLE');
		}
	});

	it('DAS variants allow 4,4 split vs 5, non-DAS do not', () => {
		const das = variants.filter((v) => v.includes('DAS'));
		const nodas = variants.filter((v) => !v.includes('DAS'));
		for (const k of das) {
			expect(STRATEGY_DATA[k].pairs['4'][5]).toBe('SPLIT');
		}
		for (const k of nodas) {
			expect(STRATEGY_DATA[k].pairs['4'][5]).not.toBe('SPLIT');
		}
	});

	it('H17 DAS doubles A7 vs 2 while S17 DAS stands', () => {
		expect(STRATEGY_DATA['H17_DAS'].soft['A7'][2]).toBe('DOUBLE');
		expect(STRATEGY_DATA['S17_DAS'].soft['A7'][2]).toBe('STAND');
	});

	it('H17 variants double A8 vs 6 while S17 variants stand', () => {
		const h17 = variants.filter((v) => v.startsWith('H17'));
		const s17 = variants.filter((v) => v.startsWith('S17'));
		for (const k of h17) {
			expect(STRATEGY_DATA[k].soft['A8'][6]).toBe('DOUBLE');
		}
		for (const k of s17) {
			expect(STRATEGY_DATA[k].soft['A8'][6]).toBe('STAND');
		}
	});

	it('All variants HIT soft 18 (A7) vs Ace (11)', () => {
		for (const k of variants) {
			expect(STRATEGY_DATA[k].soft['A7'][11]).toBe('HIT');
		}
	});

	it('H17 (non-DAS) stands A7 vs 2 while H17_DAS doubles (already validated) and S17 variants stand', () => {
		// control: existing expectation for H17_DAS covered above; here ensure plain H17 does NOT double
		expect(STRATEGY_DATA['H17'].soft['A7'][2]).toBe('STAND');
		// All S17 variants should also stand A7 vs 2
		for (const k of variants.filter((v) => v.startsWith('S17'))) {
			expect(STRATEGY_DATA[k].soft['A7'][2]).toBe('STAND');
		}
	});

	it('Late surrender variants surrender 16 vs 9/10/A and 15 vs 10; non-LS do not (full matrix check)', () => {
		const ls = variants.filter((v) => v.includes('LS'));
		const nols = variants.filter((v) => !v.includes('LS'));
		for (const k of ls) {
			const table = STRATEGY_DATA[k];
			expect(table.hard[16][9]).toBe('SURRENDER');
			expect(table.hard[16][10]).toBe('SURRENDER');
			expect(table.hard[16][11]).toBe('SURRENDER');
			expect(table.hard[15][10]).toBe('SURRENDER');
		}
		for (const k of nols) {
			const table = STRATEGY_DATA[k];
			expect(table.hard[16][9]).not.toBe('SURRENDER');
			expect(table.hard[16][10]).not.toBe('SURRENDER');
			expect(table.hard[16][11]).not.toBe('SURRENDER');
			expect(table.hard[15][10]).not.toBe('SURRENDER');
		}
	});

	it('Hard 17+ always stands (no accidental overrides)', () => {
		for (const k of variants) {
			const hard = STRATEGY_DATA[k].hard;
			for (let total = 17; total <= 21; total++) {
				for (let d = 2; d <= 11; d++) {
					expect(hard[total][d]).toBe('STAND');
				}
			}
		}
	});
});
