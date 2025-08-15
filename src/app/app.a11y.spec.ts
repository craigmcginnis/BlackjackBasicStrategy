import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import axe, { AxeResults, Result } from 'axe-core';

/**
 * Basic accessibility smoke test using axe-core on the root app component.
 * This helps catch regressions in semantics, ARIA usage, and contrast (to an extent).
 */

describe('App Accessibility', () => {
  let fixture: any;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)]
    }).compileComponents();
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
  });

  it('should have no critical or serious axe violations', async () => {
    const root: HTMLElement = fixture.nativeElement;
    // axe requires a real document body context
    document.body.appendChild(root);
  const results: AxeResults = await axe.run(root, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa']
      },
      resultTypes: ['violations']
    });
    // Filter to serious & critical to keep initial bar attainable; expand later.
  const serious = results.violations.filter((v: Result) => ['serious', 'critical'].includes(v.impact || ''));
    if (serious.length) {
  const details = serious.map((v: Result) => `${v.id}: ${v.nodes.length} nodes`).join('\n');
      fail(`Serious/critical a11y violations found:\n${details}`);
    }
  });
});
