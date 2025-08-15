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

  for (const p of paths) {
    it(`route /${p} has no serious/critical axe violations (contrast logged separately)`, async () => {
      await router.navigate([p]);
      await fixture.whenStable();
      fixture.detectChanges();
      // Allow UI stabilization / async content
      await new Promise(r => setTimeout(r, 15));
      const root: HTMLElement = fixture.nativeElement;
      document.body.appendChild(root);
      const results: AxeResults = await axe.run(root, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
        resultTypes: ['violations']
      });
      const contrast = results.violations.filter(v => v.id === 'color-contrast');
      if (contrast.length) {
        // eslint-disable-next-line no-console
        console.warn(`[axe][color-contrast][/${p}]`, contrast[0].nodes.map(n => n.target.join(' > ')));
      }
      const serious = results.violations.filter((v: Result) => v.id !== 'color-contrast' && ['serious', 'critical'].includes(v.impact || ''));
      expect(serious.length).toBe(0, serious.map((v: Result) => `${v.id}: ${v.nodes.length} nodes`).join('\n'));
    });

  it(`route /${p} logs (but does not fail on) moderate axe issues (informational)`, async () => {
      await router.navigate([p]);
      await fixture.whenStable();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r, 10));
      const root: HTMLElement = fixture.nativeElement;
      document.body.appendChild(root);
      const results: AxeResults = await axe.run(root, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
        resultTypes: ['violations']
      });
      const moderate = results.violations.filter((v: Result) => (v.impact || '') === 'moderate');
      if (moderate.length) {
        // eslint-disable-next-line no-console
        console.warn('[axe][moderate]', moderate.map(m => `${m.id}(${m.nodes.length})`).join(', '));
      }
      expect(true).toBeTrue(); // informational only
    });
  }
});
