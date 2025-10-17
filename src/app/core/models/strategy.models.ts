import { Decision } from './blackjack.models';
import { RuleSet } from './blackjack.models';

export interface StrategyTables {
    hard: Record<number, Record<number, Decision>>;
    soft: Record<string, Record<number, Decision>>;
    pairs: Record<string, Record<number, Decision>>;
}

export interface IStrategyProvider {
    getTablesFor(rules: RuleSet): StrategyTables | undefined;
    ruleKey(rules: RuleSet): string;
}