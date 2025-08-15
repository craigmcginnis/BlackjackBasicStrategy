import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, Router } from '@angular/router';
import { STORAGE_FACADE, StorageService } from './core/services/storage.service';
import { routes } from './app.routes';
import axe, { AxeResults, Result } from 'axe-core';

/**
 * Basic accessibility smoke test using axe-core on the root app component.
 * This helps catch regressions in semantics, ARIA usage, and contrast (to an extent).
 */

describe('App Accessibility', () => {
  let fixture: any;
  let router: Router;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        StorageService,
        { provide: STORAGE_FACADE, useExisting: StorageService }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  const paths = ['', 'chart', 'drill', 'flashcards', 'analytics', 'settings'];

  // Accessibility gating thresholds (can be overridden via env vars in CI if needed)
  const MAX_SERIOUS = Number((globalThis as any).A11Y_MAX_SERIOUS ?? 0);
  const INCLUDE_BEST_PRACTICE = true; // broaden scope beyond WCAG success criteria

  for (const p of paths) {
    it(`route /${p} passes a11y gate (no serious/critical WCAG violations; contrast logged)`, async () => {
      await router.navigate([p]);
      await fixture.whenStable();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r, 20));
      const root: HTMLElement = fixture.nativeElement;
      document.body.appendChild(root);
      const wcagResults: AxeResults = await axe.run(root, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
        resultTypes: ['violations']
      });
      const contrast = wcagResults.violations.filter(v => v.id === 'color-contrast');
      if (contrast.length) {
        // eslint-disable-next-line no-console
        console.warn(`[axe][color-contrast][/${p}]`, contrast[0].nodes.map(n => n.target.join(' > ')));
      }
      const gateViolations = wcagResults.violations.filter((v: Result) => v.id !== 'color-contrast' && ['serious', 'critical'].includes(v.impact || ''));
      expect(gateViolations.length).toBeLessThanOrEqual(MAX_SERIOUS, gateViolations.map((v: Result) => `${v.id}: ${v.nodes.length} nodes`).join('\n'));

      if (INCLUDE_BEST_PRACTICE) {
        const bestPractice: AxeResults = await axe.run(root, {
          runOnly: { type: 'tag', values: ['best-practice'] },
          resultTypes: ['violations']
        });
        const bestSerious = bestPractice.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''));
        if (bestSerious.length) {
          // eslint-disable-next-line no-console
          console.warn(`[axe][best-practice-serious][/${p}]`, bestSerious.map(v => `${v.id}(${v.nodes.length})`).join(', '));
        }
      }
    });

    it(`route /${p} logs moderate WCAG & best-practice issues (informational)`, async () => {
      await router.navigate([p]);
      await fixture.whenStable();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r, 15));
      const root: HTMLElement = fixture.nativeElement;
      document.body.appendChild(root);
      const results: AxeResults = await axe.run(root, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'best-practice'] },
        resultTypes: ['violations']
      });
      const moderate = results.violations.filter((v: Result) => (v.impact || '') === 'moderate');
      if (moderate.length) {
        // eslint-disable-next-line no-console
        console.warn(`[axe][moderate][/${p}]`, moderate.map(m => `${m.id}(${m.nodes.length})`).join(', '));
      }
      expect(true).toBeTrue();
    });
  }
});
