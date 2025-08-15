// Basic WCAG contrast ratio checks for current design tokens.
// This is a lightweight guard; full visual regression or axe color-contrast rules still advised.

interface ColorPair { fg: string; bg: string; min: number; note?: string }

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#','');
  const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const num = parseInt(v, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function channel(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(hex: string) {
  const [r,g,b] = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(fg: string, bg: string) {
  const L1 = luminance(fg);
  const L2 = luminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Tokens mirrored from inline CSS variables in app.html
const tokens = {
  bg: '#0d1319',
  bgAlt: '#16222d',
  card: '#1e2a36',
  text: '#ffffff',
  textDim: '#e2e8ee',
  accent: '#5ab2ff',
  accentAlt: '#ff9950'
};

// Define representative foreground/background pair expectations.
const pairs: ColorPair[] = [
  { fg: tokens.text, bg: tokens.bg, min: 4.5 },
  { fg: tokens.text, bg: tokens.bgAlt, min: 4.5 },
  { fg: tokens.text, bg: tokens.card, min: 4.5 },
  // Dim text accepted at >= 3:1 (secondary text) but target 4.5 if feasible.
  { fg: tokens.textDim, bg: tokens.bg, min: 3, note: 'secondary text' },
  { fg: tokens.textDim, bg: tokens.card, min: 3, note: 'secondary text' },
  // Accent used for focus outline / interactive; ensure at least 3:1 vs darkest bg.
  { fg: tokens.accent, bg: tokens.bg, min: 3, note: 'accent interactive' },
  { fg: tokens.accentAlt, bg: tokens.bg, min: 3, note: 'accent-alt interactive' }
];

describe('Design token contrast ratios', () => {
  it('meets declared minimum contrast thresholds', () => {
    const failures: string[] = [];
    for (const p of pairs) {
      const ratio = contrast(p.fg, p.bg);
      if (ratio < p.min) {
        failures.push(`${p.fg} on ${p.bg} ratio ${ratio.toFixed(2)} < ${p.min} ${p.note||''}`.trim());
      }
    }
    if (failures.length) {
      fail('Contrast failures:\n' + failures.join('\n'));
    }
  });
});
