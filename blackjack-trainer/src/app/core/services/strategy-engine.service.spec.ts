import { TestBed } from '@angular/core/testing';
import { StrategyEngineService } from './strategy-engine.service';
import { RuleSet } from '../models/blackjack.models';

const baseRules = (over: Partial<RuleSet> = {}): RuleSet => ({
  id:'t', name:'Test', decks:6, hitSoft17:false, doubleAfterSplit:false, lateSurrender:false, ...over
});

describe('StrategyEngineService', () => {
  let service: StrategyEngineService;

  beforeEach(()=>{
    TestBed.configureTestingModule({});
    service = TestBed.inject(StrategyEngineService);
  });

  function evalHand(cards: {rank:string; value:number}[], dealer:number){
    return service.evaluateHand(cards, { value: dealer });
  }

  it('S17: Hard 11 should double vs dealer 10', ()=>{
    const rules = baseRules({ hitSoft17:false });
    const hand = evalHand([{rank:'6',value:6},{rank:'5',value:5}], 10);
    expect(service.getDecision(hand, rules)).toBe('DOUBLE');
  });

  it('S17: Hard 16 vs 10 no surrender without LS', ()=>{
    const rules = baseRules({ lateSurrender:false });
    const hand = evalHand([{rank:'9',value:9},{rank:'7',value:7}], 10);
    expect(service.getDecision(hand, rules)).not.toBe('SURRENDER');
  });

  it('S17_LS: Hard 16 vs 10 surrender with LS', ()=>{
    const rules = baseRules({ lateSurrender:true });
    const hand = evalHand([{rank:'9',value:9},{rank:'7',value:7}], 10);
    expect(service.getDecision(hand, rules)).toBe('SURRENDER');
  });

  it('H17: Soft 17 (A6) double vs 2 when H17', ()=>{
    const rules = baseRules({ hitSoft17:true });
    const hand = evalHand([{rank:'A',value:11},{rank:'6',value:6}], 2);
    expect(service.getDecision(hand, rules)).toBe('DOUBLE');
  });

  it('DAS affects pair 4,4 split vs 5', ()=>{
    const rules = baseRules({ doubleAfterSplit:true });
    const hand = evalHand([{rank:'4',value:4},{rank:'4',value:4}], 5);
    expect(service.getDecision(hand, rules)).toBe('SPLIT');
  });
});
