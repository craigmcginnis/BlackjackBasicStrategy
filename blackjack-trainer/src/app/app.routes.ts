import { Routes } from '@angular/router';

export const routes: Routes = [
	// Home redirects to strategy chart for now
	{ path: '', pathMatch: 'full', redirectTo: 'chart' },
	{
		path: 'chart',
		loadComponent: () =>
			import('./features/strategy-chart/strategy-chart.component').then((m) => m.StrategyChartComponent)
	},
	{
		path: 'drill',
		loadComponent: () => import('./features/drill/drill.component').then((m) => m.DrillComponent)
	},
	{
		path: 'flashcards',
		loadComponent: () => import('./features/flashcards/flashcards.component').then((m) => m.FlashcardsComponent)
	},
	{
		path: 'settings',
		loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent)
	},
	{
		path: 'analytics',
		loadComponent: () => import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent)
	},
	{ path: '**', redirectTo: 'chart' }
];
