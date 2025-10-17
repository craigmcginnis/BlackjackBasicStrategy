import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FlashcardsComponent } from './flashcards.component';
import { StorageService, STORAGE_FACADE } from '../../core/services/storage.service';
import { SrsEntry } from '../../core/models';

class MockStorageService {
	mastery: Record<string, number> = {};
	loadMastery() {
		return this.mastery;
	}
	incrementMastery(key: string) {
		this.mastery[key] = (this.mastery[key] || 0) + 1;
	}
	recordSession() { }
	loadSrs() { return {}; }
	saveSrs() { }
	updateSrsOnAnswer() { return { consecutive: 0, intervalIndex: 0, nextDue: Date.now(), ef: 2.5, reviewCount: 0, lastInterval: 0 }; }
	loadStats() {
		return { history: [] };
	}
	saveStats() { }
	loadRuleSet() { return null; }
	saveRuleSet() { }
	getStreaks() { return { current: 0, best: 0 }; }
}

describe('FlashcardsComponent', () => {
	let component: FlashcardsComponent;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [FlashcardsComponent],
			providers: [
				{ provide: StorageService, useClass: MockStorageService },
				{ provide: STORAGE_FACADE, useExisting: StorageService }
			]
		});
		const fixture = TestBed.createComponent(FlashcardsComponent);
		component = fixture.componentInstance;
	});

	it('builds items including hard, soft, and pair categories', () => {
		component.rebuild();
		expect(component.items.length).toBeGreaterThan(0);
		const types = new Set(component.items.map((i) => i.type));
		expect(types.has('hard')).toBeTrue();
		expect(types.has('soft')).toBeTrue();
		expect(types.has('pair')).toBeTrue();
	});

	it('advances to next unmastered item on correct answer', fakeAsync(() => {
		component.rebuild();
		const first = component.current!;
		component.answer(first.expected);
		tick(800);
		expect(component.current!.key).not.toBe(first.key); // moved forward
	}));

	it('marks mastery and eventually reports all mastered', fakeAsync(() => {
		component.masteryTarget = 1; // easier
		component.rebuild();
		// Answer every item correctly once
		const seen = new Set<string>();
		while (true) {
			const curr = component.current!;
			if (seen.has(curr.key)) break; // loop protection
			component.answer(curr.expected);
			tick(800);
			seen.add(curr.key);
			if (component.feedback === 'All combinations mastered!') break;
		}
		expect(component.feedback).toBe('All combinations mastered!');
	}));
});
