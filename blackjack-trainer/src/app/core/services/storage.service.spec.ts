import { StorageService } from './storage.service';

describe('StorageService SRS adaptive algorithm', ()=>{
  let svc: StorageService;
  beforeEach(()=>{ svc = new StorageService(); try { localStorage.clear(); } catch { /* ignore */ } });

  it('initial correct answers increase interval and ef', ()=>{
    const first = svc.updateSrsOnAnswer('H-10-D2', true);
    expect(first.reviewCount).toBe(1);
    const second = svc.updateSrsOnAnswer('H-10-D2', true);
    expect(second.reviewCount).toBe(2);
    const third = svc.updateSrsOnAnswer('H-10-D2', true);
    expect(third.reviewCount).toBe(3);
    expect(third.lastInterval).toBeGreaterThan(second.lastInterval);
    expect(third.ef).toBeGreaterThanOrEqual(2.5); // may rise slightly
  });

  it('incorrect answer resets progression and lowers ef modestly', ()=>{
    svc.updateSrsOnAnswer('S-A7-D10', true);
    const beforeFail = svc.updateSrsOnAnswer('S-A7-D10', true);
    const fail = svc.updateSrsOnAnswer('S-A7-D10', false);
    expect(fail.reviewCount).toBe(0);
    expect(fail.nextDue - Date.now()).toBeLessThan(60*1000);
    expect(fail.ef).toBeLessThan(beforeFail.ef);
  });
});
