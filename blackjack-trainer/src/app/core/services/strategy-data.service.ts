import { Injectable } from '@angular/core';
import { STRATEGY_DATA, StrategyTables } from './strategy.data';
import { RuleSet } from '../models/blackjack.models';

export interface IStrategyProvider {
  getTablesFor(rules: RuleSet): StrategyTables | undefined;
  ruleKey(rules: RuleSet): string;
}

@Injectable({ providedIn: 'root' })
export class StrategyDataService implements IStrategyProvider {
  ruleKey(rules: RuleSet): string {
    const base = rules.hitSoft17 ? 'H17' : 'S17';
    const ls = rules.lateSurrender ? '_LS' : '';
    const das = rules.doubleAfterSplit ? '_DAS' : '';
    return base + ls + das;
  }
  getTablesFor(rules: RuleSet){
    return STRATEGY_DATA[this.ruleKey(rules)];
  }
}
