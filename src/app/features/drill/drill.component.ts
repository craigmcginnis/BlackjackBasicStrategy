import { Component, effect, inject, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { StrategyEngineService } from '../../core/services/strategy-engine.service';
import { StrategyDataService } from '../../core/services/strategy-data.service';
import { Decision, EvaluatedHand, RuleSet } from '../../core/models/blackjack.models';
import { STORAGE_FACADE, IStorageFacade } from '../../core/services/storage.service';

@Component({
	selector: 'app-drill',
	standalone: true,
	imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule],
	templateUrl: './drill.component.html',
	styleUrls: ['./drill.component.scss']
})
export class DrillComponent implements OnDestroy {
	rules: RuleSet = {
		id: 'default',
		name: '6D S17',
		decks: 6,
		hitSoft17: false,
		doubleAfterSplit: true,
		lateSurrender: false
	};
	actions: Decision[] = ['HIT', 'STAND', 'DOUBLE', 'SPLIT', 'SURRENDER'];
	streak = 0;
	bestStreak = 0;
	explanation = '';
	private startTs = 0;
	current?: EvaluatedHand;
	expected?: Decision;
	attempts = 0;
	correct = 0;
	// Difficulty tier controlling hand generation distribution
	difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM';
	feedback?: { correct: boolean; message: string };
	awaitingNext = false;
	playerCards: { rank: string; value: number; suit: string }[] = [];
	dealerCards: { rank: string; value: number; suit: string }[] = [];
	private suits = ['♠', '♥', '♦', '♣'];
	private storage = inject<IStorageFacade>(STORAGE_FACADE);
	hint?: string;
	private hintUsed = false;
	constructor(
		private engine: StrategyEngineService,
		private data: StrategyDataService
	) {
		effect(() => {
			this.loadRules();
			this.refreshExpected();
		});
		this.difficulty = this.storage.loadDifficulty();
		this.diffListener = () => {
			this.difficulty = this.storage.loadDifficulty();
		};
		window.addEventListener('difficulty-changed', this.diffListener);
		this.next();
	}
	private diffListener?: () => void;
	ngOnDestroy() {
		if (this.diffListener) window.removeEventListener('difficulty-changed', this.diffListener);
	}
	private loadRules() {
		const saved = this.storage.loadRuleSet();
		if (saved) this.rules = saved;
		// Filter actions based on surrender availability
		this.actions = ['HIT', 'STAND', 'DOUBLE', 'SPLIT'].concat(
			this.rules.lateSurrender ? ['SURRENDER'] : []
		) as Decision[];
	}
	private refreshExpected() {
		if (this.current) this.expected = this.engine.getDecision(this.current, this.rules);
	}
	private genHand() {
		// Weighted generation: occasionally bias towards previously missed scenarios to reinforce weak spots
		const history = this.storage
			.loadStats()
			.history.slice(-300)
			.filter((h) => h.mode === 'drill' && h.scenario);
		const agg: Record<string, { a: number; c: number }> = {};
		for (const h of history) {
			const key = h.scenario!;
			(agg[key] ||= { a: 0, c: 0 }).a += h.attempts;
			(agg[key] ||= { a: 0, c: 0 }).c += h.correct;
		}
		const weak = Object.entries(agg)
			.map(([k, v]) => ({ k, acc: v.a ? v.c / v.a : 0, a: v.a }))
			.filter((x) => x.a >= 2 && x.acc < 0.75);
		let forced: {
			player: [{ rank: string; value: number; suit: string }, { rank: string; value: number; suit: string }];
			dealer: { rank: string; value: number; suit: string };
		} | null = null;
		if (weak.length && Math.random() < 0.35) {
			// pick a weak scenario and reconstruct approximate hand
			const sel = weak[Math.floor(Math.random() * weak.length)].k; // format like H-16-D10 or S-15-D6 or P-8-D5
			const parts = sel.split('-');
			const type = parts[0];
			const totalOrRank = parts[1];
			const dealerCode = parts[2];
			const dealerVal = dealerCode?.substring(1); // D10
			const dValNum = dealerVal === 'A' ? 11 : parseInt(dealerVal, 10);
			const dealer = this.makeCardFromValue(dValNum);
			let player: [any, any];
			if (type === 'P') {
				// Backward compatibility: older stored keys used the TOTAL (e.g. P-14 for 7,7 or P-12 for A,A)
				// New format will store the actual pair rank (e.g. P-7, P-A). Accept both.
				const legacyMap: Record<string, string> = { '12': 'A', '14': '7', '16': '8', '18': '9', '20': '10' };
				let r = totalOrRank;
				if (!['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'].includes(r)) {
					r = legacyMap[r] || r; // map if legacy total, else leave (may degrade gracefully)
				}
				player = [this.card(r), this.card(r)];
			} else if (type === 'S') {
				// soft key like A7 or A4 encoded as full soft total (e.g., S-A7-D6? original key uses 'S-15-D6' pattern for soft value or k?). We used scenarioKey format H-<total>-D<dealer>; for soft we used 'S-<total>-D<dealer>'. So reconstruct A + (total-11)
				const total = parseInt(totalOrRank, 10);
				const second = total - 11;
				player = [this.card('A'), this.card(String(second))];
			} else {
				// hard
				const total = parseInt(totalOrRank, 10);
				// simple decomposition
				if (total >= 12) {
					player = [this.card('10'), this.card(String(total - 10))];
				} else {
					player = [
						this.card(String(Math.max(2, total - 2))),
						this.card(String(Math.min(10, total - Math.max(2, total - 2))))
					];
				}
			}
			forced = { player, dealer } as any;
		}
		if (forced) {
			this.playerCards = forced.player;
			this.dealerCards = [forced.dealer];
		} else {
			// Difficulty-driven generation
			const dealer = this.randomDealerCard();
			let player: { rank: string; value: number; suit: string }[] = [];
			if (this.difficulty === 'EASY') {
				const mode = Math.random();
				if (mode < 0.4) player = this.buildHardTotal(this.randInt(8, 13)); // mid low hard totals
				else if (mode < 0.7) player = this.buildSoftTotal(this.randInt(13, 18)); // soft A2-A7
				else {
					const pairRanks = ['2', '7', '8', 'A'];
					const r = this.randChoice(pairRanks);
					player = [this.card(r), this.card(r)];
				}
			} else if (this.difficulty === 'HARD') {
				const mode = Math.random();
				if (mode < 0.45) player = this.buildHardTotal(this.randInt(12, 16)); // stiff hands
				else if (mode < 0.7) player = this.buildSoftTotal(this.randInt(17, 20)); // soft 17-19 nuance
				else if (mode < 0.85) {
					// potential surrender scenario
					player = this.buildHardTotal(this.randChoice([15, 16]));
					if (![9, 10, 11].includes(dealer.value)) {
						this.dealerCards = [this.makeCardFromValue(this.randChoice([9, 10, 11]))];
					}
				} else {
					const pairRanks = ['9', '4', '5', 'A'];
					const r = this.randChoice(pairRanks);
					player = [this.card(r), this.card(r)];
				}
			} else {
				// MEDIUM broad distribution
				const mode = Math.random();
				if (mode < 0.33) player = this.buildHardTotal(this.randInt(8, 17));
				else if (mode < 0.66) player = this.buildSoftTotal(this.randInt(13, 20));
				else {
					const pairRanks = ['2', '3', '4', '6', '7', '8', '9', 'A'];
					const r = this.randChoice(pairRanks);
					player = [this.card(r), this.card(r)];
				}
			}
			if (!player.length) player = [this.randomCard(), this.randomCard()];
			this.playerCards = player;
			if (!this.dealerCards.length) this.dealerCards = [dealer];
		}
		const evaluated = this.engine.evaluateHand(this.playerCards, this.dealerCards[0]);
		this.current = evaluated;
		this.expected = this.engine.getDecision(evaluated, this.rules);
		this.startTs = performance.now();
	}
	answer(a: Decision) {
		if (!this.current || !this.expected || this.awaitingNext) return;
		const dt = performance.now() - this.startTs;
		this.attempts++;
		const ok = a === this.expected;
		if (ok) {
			this.correct++;
			this.streak++;
			if (this.streak > this.bestStreak) this.bestStreak = this.streak;
		} else {
			this.streak = 0;
		}
		this.feedback = { correct: ok, message: ok ? 'Correct!' : `Expected ${this.expected}` };
		this.explanation = this.buildExplanation(this.current, this.expected);
		this.storage.recordSession({
			ts: Date.now(),
			mode: 'drill',
			correct: ok ? 1 : 0,
			attempts: 1,
			expected: this.expected,
			chosen: a,
			scenario: this.scenarioKey(),
			ms: dt,
			usedHint: this.hintUsed,
			difficulty: this.difficulty
		});
		this.awaitingNext = true;
	}
	private buildExplanation(hand: EvaluatedHand, decision: Decision): string {
		const d = hand.dealerUpValue === 11 ? 'A' : hand.dealerUpValue;
		if (decision === 'SURRENDER')
			return `Late surrender: Hard ${hand.total} vs dealer ${d} has poor expectation; surrender minimizes loss.`;
		if (decision === 'SPLIT' && hand.isPair && hand.pairRank) {
			if (hand.pairRank === '8' || hand.pairRank === 'A')
				return `Always split ${hand.pairRank}${hand.pairRank} to improve outcomes.`;
			return `Splitting ${hand.pairRank}${hand.pairRank} vs dealer ${d} yields better EV per basic strategy.`;
		}
		if (decision === 'DOUBLE') {
			if (hand.isSoft)
				return `Soft ${hand.total} (A+${hand.total - 11}) vs dealer ${d}: double while dealer is in vulnerable range.`;
			return `Hard ${hand.total} vs dealer ${d}: favorable doubling window for maximizing winnings.`;
		}
		if (decision === 'STAND') {
			if (hand.total >= 17 && !hand.isSoft) return `Hard ${hand.total}: standing avoids bust risk.`;
			if (hand.isSoft) return `Soft ${hand.total}: sufficient total; hitting risks converting soft advantage.`;
			return `Stand: dealer ${d} is weak; forcing dealer to draw is higher EV.`;
		}
		if (decision === 'HIT') {
			if (hand.isSoft) return `Soft ${hand.total}: hitting leverages flexible Ace to improve total.`;
			return `Hard ${hand.total} vs dealer ${d}: too low / unsafe to stand; hit to improve.`;
		}
		return '';
	}
	next() {
		this.feedback = undefined;
		this.explanation = '';
		this.hint = undefined;
		this.hintUsed = false;
		this.awaitingNext = false;
		this.genHand();
	}
	private randomCard(): { rank: string; value: number; suit: string } {
		const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
		const r = ranks[Math.floor(Math.random() * ranks.length)];
		const value = r === 'A' ? 11 : ['J', 'Q', 'K'].includes(r) ? 10 : parseInt(r, 10);
		const suit = this.suits[Math.floor(Math.random() * this.suits.length)];
		return { rank: r, value, suit };
	}
	private randomDealerCard() {
		// Slight weighting towards 10-value cards similar to real deck composition
		const pool = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];
		return this.makeCardFromValue(this.randChoice(pool));
	}
	private buildHardTotal(total: number) {
		if (total < 4) total = 4;
		if (total > 20) total = 20;
		let first = Math.min(10, Math.max(2, total - this.randInt(2, 10)));
		let second = total - first;
		if (second < 2 || second > 11) {
			first = Math.min(10, Math.floor(total / 2));
			second = total - first;
		}
		if (first === second) {
			if (first > 2) first -= 1;
			second = total - first;
		}
		return [this.card(String(first)), this.card(String(second))];
	}
	private buildSoftTotal(total: number) {
		const second = Math.max(2, Math.min(10, total - 11));
		return [this.card('A'), this.card(String(second))];
	}
	private randInt(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	private randChoice<T>(arr: T[]): T {
		return arr[Math.floor(Math.random() * arr.length)];
	}
	// helpers used by weak-scenario reconstruction
	private card(rank: string) {
		const value = rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank, 10);
		return { rank, value, suit: this.suits[Math.floor(Math.random() * this.suits.length)] };
	}
	private makeCardFromValue(v: number) {
		if (v === 11) return this.card('A');
		if (v === 10) return this.card(['10', 'J', 'Q', 'K'][Math.floor(Math.random() * 4)]);
		return this.card(String(v));
	}
	descPlayer() {
		if (!this.current) return '';
		if (this.current.isPair && this.current.pairRank) return this.current.pairRank + this.current.pairRank;
		return (this.current.isSoft ? 'Soft ' : '') + this.current.total;
	}
	dealerLabel(v: number) {
		return v === 11 ? 'A' : v;
	}
	cardFace(c: { rank: string; suit: string }) {
		return c.rank;
	}
	private scenarioKey() {
		if (!this.current) return '';
		if (this.current.isPair && this.current.pairRank) {
			// Store actual pair rank (fixes prior bug where total produced ranks like '14')
			return `P-${this.current.pairRank}-D${this.dealerLabel(this.dealerCards[0].value)}`;
		}
		return `${this.current.isSoft ? 'S' : 'H'}-${this.current.total}-D${this.dealerLabel(this.dealerCards[0].value)}`;
	}
	showHint() {
		if (!this.current || this.hint) return;
		const hand = this.current;
		const dLabel = this.dealerLabel(this.dealerCards[0].value);
		const classification =
			hand.isPair && hand.pairRank
				? `${hand.pairRank}${hand.pairRank}`
				: hand.isSoft
					? `Soft ${hand.total}`
					: `Hard ${hand.total}`;
		const tables = this.data.getTablesFor(this.rules);
		let source = '';
		if (tables) {
			if (hand.isPair && hand.pairRank && tables.pairs[hand.pairRank]) source = 'pairs';
			else if (hand.isSoft && tables.soft[`A${hand.total - 11}`]) source = 'soft';
			else if (tables.hard[hand.total]) source = 'hard';
		}
		// Build heuristic-style guidance without giving away the specific action
		let guidance = '';
		const dealerStrong = ['9', '10', 'A'].includes(dLabel.toString());
		if (hand.isPair && hand.pairRank) {
			const pr = hand.pairRank;
			if (['A', '8'].includes(pr))
				guidance = 'Some pairs (like Aces or 8s) are often separated to avoid weak composite totals.';
			else if (pr === '5')
				guidance =
					'Fives act like a strong hard 10; consider value of treating them as a total versus splitting.';
			else if (pr === '4')
				guidance = `Fours can be sensitive to whether double-after-split is ${this.rules.doubleAfterSplit ? 'allowed' : 'disallowed'} and the dealer card.`;
			else if (pr === '9')
				guidance =
					'Nines are sometimes split against many dealer cards but not always against strong tens or Aces.';
			else guidance = 'Pairs are split more when dealer is weak and kept intact versus strong up-cards.';
			if (this.rules.doubleAfterSplit) guidance += ' DAS increases the value of splitting some mid pairs.';
		} else if (hand.isSoft) {
			if (hand.total <= 17)
				guidance =
					'Lower soft totals aim to leverage doubling windows against weak dealer cards (especially 4-6).';
			else if (hand.total === 18)
				guidance =
					'Soft 18 is a border case: response shifts based on a narrow dealer range; aggression increases vs mid weak cards.';
			else
				guidance =
					'High soft totals usually stand unless a special double opportunity exists under specific rules.';
			if (this.rules.hitSoft17)
				guidance += ' H17 rules slightly favor more aggressive doubles on some soft hands.';
		} else {
			// hard
			if (hand.total <= 8) guidance = 'Very low hard totals always continue drawing; risk is minimal.';
			else if (hand.total === 9)
				guidance = 'Hard 9 often looks for mid dealer weakness (3-6) to consider an aggressive option.';
			else if (hand.total === 10 || hand.total === 11)
				guidance = 'Hard 10/11 target broad dealer ranges for maximizing value.';
			else if (hand.total === 12)
				guidance =
					'Hard 12 is a razor-edge total: standing only becomes attractive versus certain weak dealer cards.';
			else if (hand.total >= 13 && hand.total <= 16)
				guidance = dealerStrong
					? 'Mid stiff total versus strong dealer often requires minimizing bust chances while considering surrender if available.'
					: 'Dealer weakness shifts mid stiff totals toward holding position.';
			else guidance = 'High hard totals (17+) lock in; additional hits carry too much bust risk.';
			if (this.rules.lateSurrender && (hand.total === 15 || hand.total === 16) && dealerStrong) {
				guidance +=
					' With late surrender available, reducing expected loss can sometimes outweigh playing out a stiff hand here.';
			}
		}
		this.hint = `Chart context (${source}): ${classification} vs ${dLabel}. ${guidance}`;
		this.hintUsed = true;
	}
	@HostListener('window:keydown', ['$event'])
	onKey(ev: KeyboardEvent) {
		if (!this.current || !this.expected) return;
		const key = ev.key.toLowerCase();
		const map: Record<string, Decision> = { h: 'HIT', s: 'STAND', d: 'DOUBLE', p: 'SPLIT', r: 'SURRENDER' };
		const decision = map[key];
		if (decision && this.actions.includes(decision)) {
			ev.preventDefault();
			this.answer(decision);
		}
	}
}
