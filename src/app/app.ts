import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ShortcutHelpDialogComponent } from './accessibility/shortcut-help-dialog.component';
import { CommonModule } from '@angular/common';
import { AdService } from './core/services/ad.service';

@Component({
	selector: 'app-root',
	imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ShortcutHelpDialogComponent],
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App implements OnInit {
	protected readonly title = signal('blackjack-trainer');
	private router = inject(Router);
	private adService = inject(AdService);
	helpOpen = signal(false);
	menuOpen = signal(false);

	ngOnInit(): void {
		// Initialize ad service when app starts
		this.adService.initAds();

		// Add ads to dedicated slots in main layout
		setTimeout(() => {
			// Slight delay to ensure DOM is ready
			const topAdSlot = document.getElementById('top-ad-slot');
			const bottomAdSlot = document.getElementById('bottom-ad-slot');

			if (topAdSlot) {
				this.adService.displayAd('5096598407', topAdSlot);
			}

			if (bottomAdSlot) {
				this.adService.displayAd('5096598407', bottomAdSlot);
			}
		}, 100);
	}

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
