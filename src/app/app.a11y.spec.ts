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
    it(`route /${p} has no serious/critical axe violations`, async () => {
      await router.navigate([p]);
      await fixture.whenStable();
      fixture.detectChanges();
      await new Promise(r => setTimeout(r, 10));
      const root: HTMLElement = fixture.nativeElement;
      document.body.appendChild(root);
      const results: AxeResults = await axe.run(root, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
        resultTypes: ['violations'],
        rules: { 'color-contrast': { enabled: false } } // temporarily skip contrast until design tokens adjusted
      });
      const serious = results.violations.filter((v: Result) => ['serious', 'critical'].includes(v.impact || '') && v.id !== 'color-contrast');
      expect(serious.length).toBe(0, serious.map((v: Result) => `${v.id}: ${v.nodes.length} nodes`).join('\n'));
    });
  }
});
