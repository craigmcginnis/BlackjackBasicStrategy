import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ShortcutHelpDialogComponent } from './accessibility/shortcut-help-dialog.component';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-root',
	imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ShortcutHelpDialogComponent],
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App {
	protected readonly title = signal('blackjack-trainer');
	private router = inject(Router);
	helpOpen = signal(false);
	menuOpen = signal(false);

	showShortcuts() {
		const url = this.router.url || '';
		// Show only on drill or flashcards routes
		return url.startsWith('/drill') || url.startsWith('/flashcards');
	}

	toggleMenu() {
		this.menuOpen.update(value => !value);
	}

	openShortcutHelp() {
		this.helpOpen.set(true);
	}

	closeShortcutHelp() {
		this.helpOpen.set(false);
	}
}
