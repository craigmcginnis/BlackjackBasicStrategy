import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
		title: 'Blackjack Basic Strategy Trainer | Learn Optimal Blackjack Play'
	},
	{
		path: 'chart',
		loadComponent: () =>
			import('./features/strategy-chart/strategy-chart.component').then((m) => m.StrategyChartComponent),
		title: 'Strategy Chart | Blackjack Basic Strategy Trainer'
	},
	{
		path: 'drill',
		loadComponent: () => import('./features/drill/drill.component').then((m) => m.DrillComponent),
		title: 'Practice Drills | Blackjack Basic Strategy Trainer'
	},
	{
		path: 'flashcards',
		loadComponent: () => import('./features/flashcards/flashcards.component').then((m) => m.FlashcardsComponent),
		title: 'Flashcard Practice | Blackjack Basic Strategy Trainer'
	},
	{
		path: 'settings',
		loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent),
		title: 'Settings | Blackjack Basic Strategy Trainer'
	},
	{
		path: 'analytics',
		loadComponent: () => import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent),
		title: 'Performance Analytics | Blackjack Basic Strategy Trainer'
	},
	{ path: '**', redirectTo: 'chart' }
];
