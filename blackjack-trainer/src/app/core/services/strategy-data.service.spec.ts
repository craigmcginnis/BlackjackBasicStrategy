import { TestBed } from '@angular/core/testing';
import { StrategyDataService } from './strategy-data.service';
import { RuleSet } from '../models/blackjack.models';
import { STRATEGY_DATA } from './strategy.data';

describe('StrategyDataService', ()=>{
  let svc: StrategyDataService;
  const base: RuleSet = { id:'t', name:'Test', decks:6, hitSoft17:false, doubleAfterSplit:false, lateSurrender:false };

  beforeEach(()=>{
    TestBed.configureTestingModule({});
    svc = TestBed.inject(StrategyDataService);
  });

  it('builds S17 key default', ()=>{
    expect(svc.ruleKey(base)).toBe('S17');
    expect(svc.getTablesFor(base)).toBe(STRATEGY_DATA['S17']);
  });

  it('builds H17_LS_DAS key', ()=>{
    const rules: RuleSet = { ...base, hitSoft17:true, lateSurrender:true, doubleAfterSplit:true };
    expect(svc.ruleKey(rules)).toBe('H17_LS_DAS');
  });
});
