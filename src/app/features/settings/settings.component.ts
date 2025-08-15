import { Component } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectChange } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { RuleSet } from '../../core/models/blackjack.models';
import { StorageService } from '../../core/services/storage.service';

@Component({
	selector: 'app-settings',
	standalone: true,
	imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatInputModule, MatCardModule],
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
	rules: RuleSet = {
		id: 'default',
		name: '6D',
		decks: 6,
		hitSoft17: false,
		doubleAfterSplit: true,
		lateSurrender: false
	};
	private saveTimer: any;
	presets: RuleSet[] = [
		{
			id: 'vegas-6d-s17',
			name: 'Vegas 6D S17 DAS',
			decks: 6,
			hitSoft17: false,
			doubleAfterSplit: true,
			lateSurrender: false
		},
		{
			id: 'vegas-6d-h17',
			name: 'Vegas 6D H17 DAS',
			decks: 6,
			hitSoft17: true,
			doubleAfterSplit: true,
			lateSurrender: false
		},
		{
			id: 'atlantic-6d-h17-ls',
			name: 'Atlantic 6D H17 DAS LS',
			decks: 6,
			hitSoft17: true,
			doubleAfterSplit: true,
			lateSurrender: true
		},
		{
			id: 'single-deck-h17',
			name: 'Single Deck H17 No DAS',
			decks: 1,
			hitSoft17: true,
			doubleAfterSplit: false,
			lateSurrender: false
		}
	];
	constructor(private storage: StorageService) {
		const saved = this.storage.loadRuleSet();
		if (saved) this.rules = saved;
		this.difficulty = this.storage.loadDifficulty();
	}
	difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM';
	applyPreset(ev: MatSelectChange) {
		const id = ev.value as string;
		const preset = this.presets.find((p) => p.id === id);
		if (!preset) return;
		this.rules = { ...preset };
		this.queueSave();
		window.dispatchEvent(new CustomEvent('rules-changed'));
	}
	changeDecks(ev: MatSelectChange) {
		const v = parseInt(ev.value as any, 10);
		this.rules.decks = v;
		this.queueSave();
		window.dispatchEvent(new CustomEvent('rules-changed'));
	}
	private queueSave() {
		clearTimeout(this.saveTimer);
		this.saveTimer = setTimeout(() => this.storage.saveRuleSet({ ...this.rules }), 150);
		window.dispatchEvent(new CustomEvent('rules-changed'));
	}
	changeDifficulty(ev: MatSelectChange) {
		this.difficulty = ev.value as any;
		this.storage.saveDifficulty(this.difficulty);
	}
	set<K extends keyof RuleSet>(key: K, ev: MatCheckboxChange) {
		(this.rules as any)[key] = ev.checked;
		this.queueSave();
	}
}
