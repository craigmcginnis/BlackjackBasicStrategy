import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-root',
	imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App {
	protected readonly title = signal('blackjack-trainer');
	private router = inject(Router);
	showShortcuts() {
		const url = this.router.url || '';
		// Show only on drill or flashcards routes
		return url.startsWith('/drill') || url.startsWith('/flashcards');
	}
}
