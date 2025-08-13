import { Injectable } from '@angular/core';
import { Decision, EvaluatedHand, RuleSet } from '../models/blackjack.models';
import { StrategyDataService } from './strategy-data.service';

@Injectable({ providedIn: 'root' })
export class StrategyEngineService {
  constructor(private provider: StrategyDataService) {}
  getDecision(hand: EvaluatedHand, rules: RuleSet): Decision {
    const tables = this.provider.getTablesFor(rules);
    if (!tables) return 'HIT';

    let base: Decision | undefined;
    if (hand.isPair && hand.pairRank) base = tables.pairs[hand.pairRank]?.[hand.dealerUpValue];
    if (!base && hand.isSoft) base = tables.soft[`A${hand.total - 11}`]?.[hand.dealerUpValue];
    if (!base) base = tables.hard[hand.total]?.[hand.dealerUpValue];
    return base || 'HIT';
  }

  evaluateHand(playerCards: { value: number; rank: string }[], dealerUp: { value: number }): EvaluatedHand {
    const totalRaw = playerCards.reduce((s, c) => s + c.value, 0);
    const aces = playerCards.filter(c => c.rank === 'A').length;
    let total = totalRaw;
    let soft = false;
    while (total > 21 && aces > 0) total -= 10;
    if (aces > 0 && total <= 21) soft = true;
    const isPair = playerCards.length === 2 && playerCards[0].rank === playerCards[1].rank;
    return { total, isSoft: soft && total <= 21 && !(isPair && playerCards[0].rank !== 'A'), isPair, pairRank: isPair ? playerCards[0].rank : undefined, dealerUpValue: dealerUp.value };
  }

  // rule key responsibility delegated to provider
}
