import { Component, effect, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { STRATEGY_DATA } from '../../core/services/strategy.data';
import { STORAGE_FACADE, IStorageFacade } from '../../core/services/storage.service';

interface FlashItem {
	label: string;
	expected: string;
	type: 'hard' | 'soft' | 'pair';
	playerCards: { rank: string; value: number; suit: string }[];
	dealerUp: { rank: string; value: number; suit: string };
	key: string;
}

@Component({
	selector: 'app-flashcards',
	standalone: true,
	imports: [CommonModule, MatCardModule, MatButtonModule],
	templateUrl: './flashcards.component.html',
	styleUrls: ['./flashcards.component.scss']
})
export class FlashcardsComponent {
	tables = STRATEGY_DATA['S17'];
	decisions = ['HIT', 'STAND', 'DOUBLE', 'SPLIT', 'SURRENDER'];
	items: FlashItem[] = [];
	index = 0;
	current?: FlashItem;
	feedback?: string;
	private suits = ['♠', '♥', '♦', '♣'];
	private startTs = 0;
	masteryTarget = 3;
	mastery: Record<string, number> = {};
	private storage = inject<IStorageFacade>(STORAGE_FACADE);
	private srs = this.storage.loadSrs();
	get dueCount() {
		const now = Date.now();
		return Object.keys(this.srs).filter((k) => !this.srs[k] || this.srs[k].nextDue <= now).length;
	}
	get totalTracked() {
		return Object.keys(this.srs).length;
	}
	get currentEf() {
		return this.current && this.srs[this.current.key] ? this.srs[this.current.key].ef.toFixed(2) : '—';
	}
	get nextDue() {
		return this.current && this.srs[this.current.key] ? this.relativeTime(this.srs[this.current.key].nextDue) : '—';
	}
	get playerTotal() {
		if (!this.current) return '';
		// derive total with ace adjustment
		let sum = this.current.playerCards.reduce((s, c) => s + (c.rank === 'A' ? 11 : c.value), 0);
		const aces = this.current.playerCards.filter((c) => c.rank === 'A').length;
		let adjAces = aces;
		while (sum > 21 && adjAces > 0) {
			sum -= 10;
			adjAces--;
		}
		return sum;
	}
	private relativeTime(ts: number) {
		const diff = ts - Date.now();
		if (diff <= 0) return 'now';
		const mins = Math.round(diff / 60000);
		if (mins < 60) return mins + 'm';
		const hrs = Math.round(mins / 60);
		if (hrs < 24) return hrs + 'h';
		const days = Math.round(hrs / 24);
		return days + 'd';
	}

	constructor() {
		this.mastery = this.storage.loadMastery();
		effect(() => {
			this.rebuild();
		});
	}
	rebuild() {
		this.items = [];
		this.index = 0;
		this.build();
		// apply SRS due filtering & sorting
		const now = Date.now();
		const srsMap =
			this.srs || ({} as Record<string, { consecutive: number; intervalIndex: number; nextDue: number }>);
		const due = this.items.filter((i) => {
			const e = srsMap[i.key];
			return !e || e.nextDue <= now;
		});
		const future = this.items.filter((i) => !due.includes(i));
		// sort due by (nextDue asc) then by lowest consecutive to focus weak items
		due.sort((a, b) => {
			const ea = srsMap[a.key];
			const eb = srsMap[b.key];
			const nda = ea ? ea.nextDue : 0;
			const ndb = eb ? eb.nextDue : 0;
			if (nda !== ndb) return nda - ndb;
			const ca = ea ? ea.consecutive : 0;
			const cb = eb ? eb.consecutive : 0;
			return ca - cb;
		});
		this.items = [...due, ...future];
		this.shuffle();
		this.current = this.items[0];
		this.startTs = performance.now();
	}

	build() {
		// Hard totals
		Object.keys(this.tables.hard).forEach((totalStr) => {
			const total = Number(totalStr);
			const row = this.tables.hard[total];
			Object.keys(row).forEach((dStr) => {
				const d = Number(dStr);
				const dealerUp = this.makeCardFromValue(d);
				const combo = this.makePlayerCombo(total);
				const key = `H-${total}-D${dStr}`;
				this.items.push({
					key,
					label: `Hard ${total} vs ${d === 11 ? 'A' : d}`,
					expected: row[d],
					type: 'hard',
					playerCards: combo,
					dealerUp
				});
			});
		});
		// Soft totals
		Object.keys(this.tables.soft).forEach((k) => {
			const row = this.tables.soft[k];
			const second = k.substring(1); // e.g. 'A4' -> '4'
			const softVal = 11 + parseInt(second, 10); // A4 => 15
			Object.keys(row).forEach((dStr) => {
				const d = Number(dStr);
				const dealerUp = this.makeCardFromValue(d);
				const combo = this.makeSoftCombo(k);
				const key = `S-${k}-D${dStr}`;
				this.items.push({
					key,
					label: `Soft ${softVal} (${k}) vs ${d === 11 ? 'A' : d}`,
					expected: row[d],
					type: 'soft',
					playerCards: combo,
					dealerUp
				});
			});
		});
		// Pairs
		Object.keys(this.tables.pairs).forEach((p) => {
			const row = this.tables.pairs[p];
			Object.keys(row).forEach((dStr) => {
				const d = Number(dStr);
				const dealerUp = this.makeCardFromValue(d);
				const combo = [this.card(p), this.card(p)];
				const key = `P-${p}-D${dStr}`;
				this.items.push({
					key,
					label: `Pair ${p},${p} vs ${d === 11 ? 'A' : d}`,
					expected: row[d],
					type: 'pair',
					playerCards: combo,
					dealerUp
				});
			});
		});
		// Filter out auto-stand 21 duplicates or unrealistic combos if desired (skip for now)
	}
	private makeSoftCombo(key: string) {
		// key like A4 => use A + 4
		const rank = key[1];
		return [this.card('A'), this.card(rank)];
	}
	private shuffle() {
		for (let i = this.items.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.items[i], this.items[j]] = [this.items[j], this.items[i]];
		}
	}
	private mastered(key: string) {
		return (this.mastery[key] || 0) >= this.masteryTarget;
	}
	private nextUnmasteredIndex(start: number) {
		for (let i = 0; i < this.items.length; i++) {
			const idx = (start + i) % this.items.length;
			if (!this.mastered(this.items[idx].key)) return idx;
		}
		return -1;
	}
	private makePlayerCombo(total: number) {
		if (total === 21) return [this.card('A'), this.card('K')];
		if (total === 20) return [this.card('10'), this.card('Q')];
		const firstVal = Math.min(10, Math.max(2, total - 10));
		const secondVal = total - firstVal;
		return [this.cardFromValue(firstVal), this.cardFromValue(secondVal)];
	}
	private card(rank: string) {
		const value = rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank, 10);
		return { rank, value, suit: this.suits[Math.floor(Math.random() * this.suits.length)] };
	}
	private cardFromValue(v: number) {
		if (v === 11) return this.card('A');
		if (v === 10) return this.card(['10', 'J', 'Q', 'K'][Math.floor(Math.random() * 4)]);
		return this.card(String(v));
	}
	private makeCardFromValue(v: number) {
		return this.cardFromValue(v);
	}
	answer(decision: string) {
		if (!this.current) return;
		const dt = performance.now() - this.startTs;
		const correct = decision === this.current.expected;
		this.feedback = correct ? 'Correct' : `Expected ${this.current.expected}`;
		this.storage.recordSession({
			ts: Date.now(),
			mode: 'flash',
			correct: correct ? 1 : 0,
			attempts: 1,
			expected: this.current.expected,
			chosen: decision,
			scenario: this.current.key,
			ms: dt
		});
		const srsEntry = this.storage.updateSrsOnAnswer(this.current.key, correct);
		// refresh local reference to reflect updated EF and scheduling
		this.srs[this.current.key] = srsEntry as any;
		if (correct) {
			this.storage.incrementMastery(this.current.key);
			this.mastery[this.current.key] = (this.mastery[this.current.key] || 0) + 1;
		}
		setTimeout(() => {
			this.feedback = undefined;
			const nextIdx = this.nextUnmasteredIndex(this.index + 1);
			if (nextIdx === -1) {
				this.feedback = 'All combinations mastered!';
				return;
			}
			this.index = nextIdx;
			this.current = this.items[this.index];
			this.startTs = performance.now();
		}, 800);
	}
	@HostListener('window:keydown', ['$event'])
	onKey(ev: KeyboardEvent) {
		if (!this.current) return;
		const k = ev.key.toLowerCase();
		const map: Record<string, string> = { h: 'HIT', s: 'STAND', d: 'DOUBLE', p: 'SPLIT', r: 'SURRENDER' };
		const decision = map[k];
		if (decision && this.decisions.includes(decision)) {
			ev.preventDefault();
			this.answer(decision);
		}
	}
}
