import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { StrategyEngineService } from '../../core/services/strategy-engine.service';
import { STRATEGY_DATA } from '../../core/services/strategy.data';
import { StorageService } from '../../core/services/storage.service';

@Component({
	selector: 'app-strategy-chart',
	standalone: true,
	imports: [CommonModule, MatCardModule, MatTableModule],
	templateUrl: './strategy-chart.component.html',
	styleUrls: ['./strategy-chart.component.scss']
})
export class StrategyChartComponent {
	dealerValues = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
	hardColumns: string[] = ['label'];
	 softColumns: string[] = ['label'];
	 pairColumns: string[] = ['label'];
	hardDisplay: { label: string; totals: number[] }[] = [];
	// Group pairs with identical patterns: (2,3), (4) (since 4's strategy differs), (5) (treated as 10), (6), (7), (8), (9), (10), (A)
	pairDisplay = [
		{ label: '2,3', keys: ['2', '3'] },
		{ label: '4,4', keys: ['4'] },
		{ label: '5,5', keys: ['5'] },
		{ label: '6,6', keys: ['6'] },
		{ label: '7,7', keys: ['7'] },
		{ label: '8,8', keys: ['8'] },
		{ label: '9,9', keys: ['9'] },
		{ label: '10,10', keys: ['10'] },
		{ label: 'A,A', keys: ['A'] }
	];
	// Grouped soft hands per similar strategy patterns
	softDisplay = [
		{ label: 'A-2,3', keys: ['A2', 'A3'] },
		{ label: 'A-4,5', keys: ['A4', 'A5'] },
		{ label: 'A-6', keys: ['A6'] },
		{ label: 'A-7', keys: ['A7'] },
		{ label: 'A-8,9', keys: ['A8', 'A9'] }
	];
	tables = STRATEGY_DATA['S17'];
	hasSurrender = false;
	titleVariant = 'S17';
	ruleNotes: string[] = ['S17: Dealer stands on soft 17'];
	private storage = inject(StorageService);
	constructor(private engine: StrategyEngineService) {
		effect(() => {
			const rs = this.storage.loadRuleSet();
			if (rs) {
				const base = rs.hitSoft17 ? 'H17' : 'S17';
				const key = base + (rs.lateSurrender ? '_LS' : '') + (rs.doubleAfterSplit ? '_DAS' : '');
				this.tables = STRATEGY_DATA[key];
				this.hasSurrender = !!rs.lateSurrender;
				const variant = base + (rs.lateSurrender ? ' LS' : '') + (rs.doubleAfterSplit ? ' DAS' : '');
				this.titleVariant = variant.trim();
				this.ruleNotes = [
					rs.hitSoft17 ? 'H17: Dealer hits soft 17 (A-6)' : 'S17: Dealer stands on soft 17',
					rs.doubleAfterSplit
						? 'DAS: Doubling allowed after a split'
						: 'No DAS: Doubling after split not allowed',
					rs.lateSurrender
						? 'LS: Late surrender available (after dealer checks for blackjack)'
						: 'No LS: Surrender not available'
				];
				this.rebuildHardGroups();
			}
		});
		// initial build for default tables
		this.rebuildHardGroups();
		// initialize other column arrays (dealerValues static)
		this.softColumns = ['label', ...this.dealerValues.map(d => 'd' + d)];
		this.pairColumns = ['label', ...this.dealerValues.map(d => 'd' + d)];
	}
	abbr(d: string) {
		if (d === '?') return '?';
		if (d === 'SPLIT') return 'Sp'; // clearer than P and distinct from Stand
		if (d === 'SURRENDER') return 'R';
		return d[0];
	}
	dLabel(v: number) {
		return v === 11 ? 'A' : v;
	}
	cls(d: string) {
		return d === '?' ? '' : d.toLowerCase();
	}
	decisionFor(row: { totals: number[] }, dealer: number) {
		const decisions = row.totals.filter((t) => this.tables.hard[t]).map((t) => this.tables.hard[t][dealer]);
		if (!decisions.length) return '?';
		return decisions[0];
	}
	decisionForPairs(keys: string[], dealer: number) {
		const decisions = keys.map((k) => this.tables.pairs[k][dealer]);
		return decisions[0];
	}
	decisionForSoft(keys: string[], dealer: number) {
		const decisions = keys.map((k) => this.tables.soft[k][dealer]);
		return decisions[0];
	}
	private rebuildHardGroups() {
		const groups: { totals: number[]; sig: string }[] = [];
		const startTotal = 5;
		const endTotal = 21;
		for (let t = startTotal; t <= endTotal; t++) {
			const row = this.tables.hard[t];
			if (!row) continue;
			const sig = this.dealerValues.map((d) => row[d]).join('|');
			const last = groups[groups.length - 1];
			if (last && last.sig === sig) {
				last.totals.push(t);
			} else {
				groups.push({ totals: [t], sig });
			}
		}
		this.hardDisplay = groups.map((g) => ({
			label: g.totals.length > 1 ? `${g.totals[0]}-${g.totals[g.totals.length - 1]}` : String(g.totals[0]),
			totals: g.totals
		}));
		this.hardColumns = ['label', ...this.dealerValues.map((d) => 'd' + d)];
	}
}
