import { Component, ElementRef, EventEmitter, Output, ViewChild, ChangeDetectorRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgIf } from '@angular/common';

/**
 * Focus-trapped help dialog presenting keyboard shortcuts. Lightweight inline trap (no Material dialog dependency).
 */
@Component({
  selector: 'app-shortcut-help-dialog',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="open" class="dialog-backdrop" (click)="onBackdrop($event)"></div>
  <div *ngIf="open" id="shortcut-help-dialog" class="dialog-surface" role="dialog" aria-modal="true" aria-labelledby="shortcutHelpTitle" #dialogRoot>
      <h2 id="shortcutHelpTitle" tabindex="-1">Keyboard Shortcuts</h2>
      <p>Use these keys during Drill & Flashcards:</p>
      <ul>
        <li><kbd>H</kbd> – Hit</li>
        <li><kbd>S</kbd> – Stand</li>
        <li><kbd>D</kbd> – Double</li>
        <li><kbd>P</kbd> – Split</li>
        <li><kbd>R</kbd> – Surrender</li>
  <li><kbd>N</kbd> – Next hand (Drill after feedback)</li>
      </ul>
      <p>Other:</p>
      <ul>
        <li><kbd>?</kbd> – Open this help</li>
        <li><kbd>Esc</kbd> – Close dialog</li>
      </ul>
  <div class="dialog-actions">
    <button type="button" (click)="close()" class="btn btn--primary">Close</button>
  </div>
  <span class="u-visually-hidden" aria-live="polite">Dialog open. Press Escape to close.</span>
    </div>
  `,
  /* Styles moved to global dialog primitive partial */
  styles: []
})
export class ShortcutHelpDialogComponent implements OnChanges {
  open = false;
  @Output() closed = new EventEmitter<void>();
  @ViewChild('dialogRoot') dialogRoot?: ElementRef<HTMLElement>;
  private previouslyFocused?: HTMLElement | null;

  private keyHandler?: (e: KeyboardEvent) => void;

  constructor(private cdr: ChangeDetectorRef) { }

  // External visibility control. When parent sets visible=true we open; when false we close.
  @Input() visible = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (Object.prototype.hasOwnProperty.call(changes, 'visible')) {
      const v = changes['visible'].currentValue;
      if (v && !this.open) {
        this.show();
      } else if (!v && this.open) {
        this.close();
      }
    }
  }

  show() {
    if (this.open) return;
    this.previouslyFocused = document.activeElement as HTMLElement;
    this.open = true;
    // Immediately trigger change detection so template (heading) is in DOM for tests
    this.cdr.detectChanges();
    // Register keyboard events
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      } else if (e.key === 'Tab') {
        this.maintainFocus(e);
      }
    };
    document.addEventListener('keydown', this.keyHandler);
    // Defer focus to next frame to ensure template rendered
    // Retry focus a few times until element is in DOM (headless test env timing)
    let attempts = 0;
    const tryFocus = () => {
      attempts++;
      const heading = document.getElementById('shortcutHelpTitle');
      if (heading) {
        heading.focus();
        return;
      }
      if (attempts < 5) setTimeout(tryFocus, 5);
    };
    setTimeout(tryFocus, 0);
  }

  close() {
    if (!this.open) return;
    this.open = false;
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = undefined;
    }
    this.closed.emit();
    if (this.previouslyFocused) {
      setTimeout(() => this.previouslyFocused?.focus(), 0);
    }
  }

  onBackdrop(evt: MouseEvent) {
    evt.stopPropagation();
    this.close();
  }

  private focusableElements(): HTMLElement[] {
    if (!this.dialogRoot) return [];
    return Array.from(this.dialogRoot.nativeElement.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    )).filter(el => !el.hasAttribute('disabled'));
  }

  private focusFirst() {
    const heading = this.dialogRoot?.nativeElement.querySelector<HTMLElement>('#shortcutHelpTitle');
    if (heading) {
      heading.focus();
      return;
    }
    const first = this.focusableElements()[0];
    if (first) first.focus();
  }

  private maintainFocus(e: KeyboardEvent) {
    const items = this.focusableElements();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
