import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrillComponent } from './drill.component';
import { STORAGE_FACADE, IStorageFacade, SessionStatEntry } from '../../core/services/storage.service';
import { StrategyEngineService } from '../../core/services/strategy-engine.service';
import { StrategyDataService } from '../../core/services/strategy-data.service';
import { Injectable } from '@angular/core';
import { Decision, EvaluatedHand, RuleSet } from '../../core/models/blackjack.models';
import { of } from 'rxjs';

class MockStorage implements IStorageFacade {
	private difficulty: 'HARD_TOTALS' | 'SOFT_TOTALS' | 'PAIRS' | 'ALL' = 'ALL';
	loadStats() {
		return { history: [] };
	}
	saveStats(_s: any) {}
	recordSession(_e: SessionStatEntry) {}
	loadMastery() {
		return {};
	}
	saveMastery(_m: any) {}
	incrementMastery(_k: string) {}
	loadSrs() {
		return {};
	}
	saveSrs(_m: any) {}
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
	saveRuleSet(_r: RuleSet) {}
	getStreaks() {
		return { current: 0, best: 0 };
	}
	loadDifficulty(){ return this.difficulty; }
	saveDifficulty(l: 'HARD_TOTALS'|'SOFT_TOTALS'|'PAIRS'|'ALL'){ this.difficulty = l; }
}
class MockEngine {
	getDecision(_h: EvaluatedHand, _r: RuleSet): Decision {
		return 'HIT';
	}
	evaluateHand(p: any[], d: any): EvaluatedHand {
		return { total: 12, isSoft: false, isPair: false, dealerUpValue: d.value };
	}
}
@Injectable()
class MockStrategyDataService extends StrategyDataService {
	// override to avoid needing STRATEGY_DATA
	override getTablesFor() {
		return {
			hard: {
				12: {
					2: 'HIT',
					3: 'STAND',
					4: 'HIT',
					5: 'HIT',
					6: 'HIT',
					7: 'HIT',
					8: 'HIT',
					9: 'HIT',
					10: 'HIT',
					11: 'HIT'
				}
			},
			soft: {},
			pairs: {}
		} as any;
	}
	override ruleKey(): string {
		return 'S17';
	}
}

describe('DrillComponent', () => {
	let fixture: ComponentFixture<DrillComponent>;
	let component: DrillComponent;
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [DrillComponent],
			providers: [
				{ provide: STORAGE_FACADE, useClass: MockStorage },
				{ provide: StrategyEngineService, useClass: MockEngine },
				{ provide: StrategyDataService, useClass: MockStrategyDataService }
			]
		}).compileComponents();
		fixture = TestBed.createComponent(DrillComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('shows explanation and waits for manual next', () => {
		// simulate answer
		const initialHand = component.current;
		component.answer('HIT');
		expect(component.explanation).toBeTruthy();
		expect(component.awaitingNext).toBeTrue();
		// ensure next not auto-called
		expect(component.current).toBe(initialHand);
		component.next();
		expect(component.awaitingNext).toBeFalse();
	});

	it('prevents multiple answers before next', () => {
		component.answer('HIT');
		const feedback = component.feedback;
		component.answer('HIT');
		expect(component.feedback).toBe(feedback); // unchanged
	});

	it('generates a hint only once', () => {
		expect(component.hint).toBeUndefined();
		component.showHint();
		const first = component.hint;
		expect(first).toContain('Chart');
		component.showHint();
		expect(component.hint).toBe(first); // unchanged
	});

	it('N key advances to next after answering', () => {
		const firstHand = component.current;
		component.answer('HIT');
		expect(component.awaitingNext).toBeTrue();
		// simulate keydown N
		const evt = new KeyboardEvent('keydown', { key: 'n' });
		component.onKey(evt as any);
		expect(component.awaitingNext).toBeFalse();
		expect(component.current).not.toBe(firstHand);
	});
});
