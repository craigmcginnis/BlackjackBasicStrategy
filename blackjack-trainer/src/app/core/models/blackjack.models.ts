export interface RuleSet {
  id: string;
  name: string;
  decks: number;
  hitSoft17: boolean; // true = H17, false = S17
  doubleAfterSplit: boolean;
  lateSurrender: boolean;
}

export interface Card {
  rank: string; // '2'-'10','J','Q','K','A'
  value: number; // 2-11
}

export interface HandState {
  playerCards: Card[];
  dealerUp: Card;
}

export type Decision = 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT' | 'SURRENDER';

export interface DrillResult {
  id: string;
  hand: EvaluatedHand;
  expected: Decision;
  chosen: Decision;
  correct: boolean;
  timestamp: number;
}

export interface EvaluatedHand {
  total: number;
  isSoft: boolean;
  isPair: boolean;
  pairRank?: string;
  dealerUpValue: number; // 2-11 (Ace=11)
}
