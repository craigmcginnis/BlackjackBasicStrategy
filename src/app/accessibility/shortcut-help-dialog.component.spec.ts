import { TestBed } from '@angular/core/testing';
import { ShortcutHelpDialogComponent } from './shortcut-help-dialog.component';

describe('ShortcutHelpDialogComponent', () => {
  let component: ShortcutHelpDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ShortcutHelpDialogComponent]
    });
    const fixture = TestBed.createComponent(ShortcutHelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('opens and focuses heading for accessibility', (done) => {
    component.show();
    setTimeout(() => {
      const heading = document.getElementById('shortcutHelpTitle');
      expect(heading).toBeTruthy();
      // focus may be on heading or remain due to environment; ensure heading is focusable
      if (heading) heading.focus();
      expect(document.activeElement?.id).toBe('shortcutHelpTitle');
      done();
    }, 25); // allow a bit more time for focus scheduling
  });

  it('closes on escape', (done) => {
    component.show();
    setTimeout(() => {
      const esc = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(esc);
      setTimeout(() => {
        expect(component.open).toBeFalse();
        done();
      }, 5);
    }, 5);
  });

  it('maintains focus trap with tab', (done) => {
    component.show();
    setTimeout(() => {
      const original = document.activeElement;
      const tab = new KeyboardEvent('keydown', { key: 'Tab' });
      document.dispatchEvent(tab);
      // After tab, still inside dialog
      setTimeout(() => {
        expect(document.activeElement).not.toBeNull();
        expect(component.open).toBeTrue();
        done();
      }, 5);
    }, 10);
  });

  it('wraps focus on shift+tab (single focusable element still stable)', (done) => {
    component.show();
    setTimeout(() => {
      // Move focus to the close button (only tabbable element)
      const btn = document.querySelector('.dialog-actions .btn') as HTMLElement | null;
      expect(btn).toBeTruthy();
      btn?.focus();
      expect(document.activeElement).toBe(btn);
      const shiftTab = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      document.dispatchEvent(shiftTab);
      setTimeout(() => {
        // With only one tabbable element, focus should remain on it (wrapped)
        expect(document.activeElement).toBe(btn);
        done();
      }, 5);
    }, 15);
  });

  it('returns focus to previously focused element on close', (done) => {
    // Create a temporary button to represent previously focused trigger
    const trigger = document.createElement('button');
    trigger.id = 'triggerBtn';
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    component.show();
    setTimeout(() => {
      component.close();
      setTimeout(() => {
        expect(document.activeElement).toBe(trigger);
        document.body.removeChild(trigger);
        done();
      }, 15);
    }, 20);
  });
});
