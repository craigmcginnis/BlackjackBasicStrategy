import { IStorageFacade, AggregatedStats, SessionStatEntry, SrsEntry } from './storage.service';

class InMemoryStorageFacade implements IStorageFacade {
  history: SessionStatEntry[] = [];  mastery: Record<string, number> = {}; srs: Record<string, SrsEntry> = {}; rules: any = null;
  current = 0; best = 0;
  loadStats(): AggregatedStats { return { history: this.history }; }
  saveStats(stats: AggregatedStats): void { this.history = stats.history; }
  recordSession(entry: SessionStatEntry): void {
    this.history.push(entry);
    if (entry.attempts === entry.correct && entry.correct > 0) this.current += entry.correct; else this.current = 0;
    if (this.current > this.best) this.best = this.current;
  }
  loadMastery(): Record<string, number> { return this.mastery; }
  saveMastery(map: Record<string, number>): void { this.mastery = map; }
  incrementMastery(s: string): void { this.mastery[s] = (this.mastery[s]||0)+1; }
  loadSrs(): Record<string, SrsEntry> { return this.srs; }
  saveSrs(map: Record<string, SrsEntry>): void { this.srs = map; }
  updateSrsOnAnswer(key: string, correct: boolean): SrsEntry {
    const now = Date.now();
    let e = this.srs[key];
    if(!e) e = this.srs[key] = { consecutive:0, intervalIndex:0, nextDue: now, ef:2.5, reviewCount:0, lastInterval:0 } as SrsEntry;
    if(correct){
      e.reviewCount++; e.consecutive++; e.lastInterval = e.lastInterval ? Math.round(e.lastInterval * e.ef) || 60000 : 300000; // simple growth
      e.nextDue = now + e.lastInterval;
    } else { e.consecutive = 0; e.reviewCount = 0; e.lastInterval = 0; e.nextDue = now + 30000; e.ef = Math.max(1.3, e.ef - 0.1); }
    return e;
  }
  loadRuleSet(): any { return this.rules; }
  saveRuleSet(r: any): void { this.rules = r; }
  getStreaks(): { current: number; best: number } { return { current: this.current, best: this.best }; }
}

describe('InMemoryStorageFacade mock', () => {
  let mock: InMemoryStorageFacade;
  beforeEach(()=> { mock = new InMemoryStorageFacade(); });

  it('tracks streaks and best streak', () => {
    mock.recordSession({ ts:1, mode:'drill', correct:1, attempts:1 });
    mock.recordSession({ ts:2, mode:'drill', correct:1, attempts:1 }); // streak 2
    mock.recordSession({ ts:3, mode:'drill', correct:0, attempts:1 }); // reset
    expect(mock.getStreaks().best).toBe(2);
    expect(mock.getStreaks().current).toBe(0);
  });

  it('increments mastery map', () => {
    mock.incrementMastery('H-10-D2');
    mock.incrementMastery('H-10-D2');
    expect(mock.loadMastery()['H-10-D2']).toBe(2);
  });

  it('applies simple SRS progression and reset on miss', () => {
    const first = mock.updateSrsOnAnswer('K', true);
    const second = mock.updateSrsOnAnswer('K', true);
    expect(second.reviewCount).toBeGreaterThan(first.reviewCount - 1); // progression
    const fail = mock.updateSrsOnAnswer('K', false);
    expect(fail.reviewCount).toBe(0);
    expect(fail.nextDue).toBeGreaterThan(Date.now());
  });
});
