import { TestBed } from '@angular/core/testing';
import { StrategyChartComponent } from './strategy-chart.component';
import { StrategyEngineService } from '../../core/services/strategy-engine.service';
import { STRATEGY_DATA } from '../../core/services/strategy.data';
import { StorageService } from '../../core/services/storage.service';

class EngineStub {};

describe('StrategyChartComponent', () => {
  let comp: StrategyChartComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StrategyChartComponent],
      providers: [
        { provide: StrategyEngineService, useClass: EngineStub },
        StorageService
      ]
    });
    const fixture = TestBed.createComponent(StrategyChartComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('merges consecutive hard total rows with identical signatures', () => {
    const base = STRATEGY_DATA['S17'];
    const clone = JSON.parse(JSON.stringify(base));
    for (let t = 5; t <= 8; t++) {
      clone.hard[t] = { ...clone.hard[5] };
    }
    clone.hard[9] = { ...clone.hard[9] };
    (comp as any).tables = clone;
    (comp as any).rebuildHardGroups();
    expect(comp.hardDisplay[0].label).toBe('5-8');
    const hasNineSeparate = comp.hardDisplay.some(r => r.label === '9');
    expect(hasNineSeparate).toBeTrue();
  });

  it('abbreviates actions correctly including split and surrender', () => {
    expect(comp.abbr('HIT')).toBe('H');
    expect(comp.abbr('STAND')).toBe('S');
    expect(comp.abbr('DOUBLE')).toBe('D');
    expect(comp.abbr('SPLIT')).toBe('Sp');
    expect(comp.abbr('SURRENDER')).toBe('R');
    expect(comp.abbr('?')).toBe('?');
  });

  it('returns ? when no hard decision rows present', () => {
    const row = { totals: [30, 31] } as any;
    const decision = comp.decisionFor(row, 2);
    expect(decision).toBe('?');
  });
});
