import { Component, computed, signal, effect, inject } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { STORAGE_FACADE, SessionStatEntry, IStorageFacade } from '../../core/services/storage.service';
import { AnalyticsMetricsService } from '../../core/services/analytics-metrics.service';

@Component({
	selector: 'app-analytics',
	standalone: true,
	imports: [CommonModule, MatCardModule, MatTableModule, DatePipe, DecimalPipe],
	templateUrl: './analytics.component.html',
	styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent {
	private metrics = inject(AnalyticsMetricsService);
	private storage = inject<IStorageFacade>(STORAGE_FACADE);
	history = signal<SessionStatEntry[]>([]);
	constructor() {
		this.history.set(this.storage.loadStats().history);
		// effect to keep history reactive if future storage signal added
		effect(() => {
			/* placeholder for reactive tie-in */
		});
	}
	private recalc() {
		this.history.set([...this.storage.loadStats().history]);
	}
	totAttempts = computed(() => this.metrics.computeTotals(this.history()).attempts);
	totCorrect = computed(() => this.metrics.computeTotals(this.history()).correct);
	accuracy = computed(() => this.metrics.computeTotals(this.history()).accuracy);
	avgTime = computed(() => this.metrics.computeTotals(this.history()).avgTime);
	recent = computed(() => this.metrics.computeRecent(this.history()));
	spark = computed(() => this.metrics.computeSpark(this.history()));
	actionStats = computed(() => this.metrics.computeActionStats(this.history()));
	weakest = computed(() => this.metrics.computeWeakest(this.history()));
	actionTrends = computed(() => this.metrics.computeActionTrends(this.history()));
	hintUsage = computed(() => this.metrics.computeHintUsage(this.history()));
	streaks = computed(() => this.storage.getStreaks());
	hardestActions = computed(() => this.metrics.computeHardestActions(this.history()));
	timeDist = computed(() => this.metrics.computeTimeDistribution(this.history()));
	overdue = computed(() =>
		this.metrics.computeOverdueSrs(
			this.history(),
			(this.storage as any).loadSrs ? (this.storage as any).loadSrs() : {}
		)
	);
	reset() {
		this.storage.saveStats({ history: [] });
		this.recalc();
	}
}
