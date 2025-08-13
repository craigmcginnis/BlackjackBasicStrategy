import { Decision } from '../models/blackjack.models';

export interface StrategyTables {
  hard: Record<number, Record<number, Decision>>;
  soft: Record<string, Record<number, Decision>>;
  pairs: Record<string, Record<number, Decision>>;
}

// Variants: (S17|H17) x (LS?) x (DAS?)
export const STRATEGY_DATA: Record<string, StrategyTables> = {
  S17: buildStrategy(false,false,false),
  S17_LS: buildStrategy(false,true,false),
  S17_DAS: buildStrategy(false,false,true),
  S17_LS_DAS: buildStrategy(false,true,true),
  H17: buildStrategy(true,false,false),
  H17_LS: buildStrategy(true,true,false),
  H17_DAS: buildStrategy(true,false,true),
  H17_LS_DAS: buildStrategy(true,true,true)
};

function buildRow(initial: Decision = 'HIT'): Record<number, Decision> {
  const row: Record<number, Decision> = {} as Record<number, Decision>;
  for (let d = 2; d <= 11; d++) row[d] = initial;
  return row;
}

function buildStrategy(isH17: boolean, surrender: boolean, das: boolean): StrategyTables {
  const hard: StrategyTables['hard'] = {};
  const soft: StrategyTables['soft'] = {};
  const pairs: StrategyTables['pairs'] = {};

  for (let t = 5; t <= 21; t++) hard[t] = buildRow('HIT');
  for (let d = 2; d <= 11; d++) for (let t = 17; t <= 21; t++) hard[t][d] = 'STAND';
  for (let t = 13; t <= 16; t++) for (let d = 2; d <= 6; d++) hard[t][d] = 'STAND';
  for (let d = 4; d <= 6; d++) hard[12][d] = 'STAND';
  for (let d = 3; d <= 6; d++) hard[9][d] = 'DOUBLE';
  for (let d = 2; d <= 9; d++) hard[10][d] = 'DOUBLE';
  for (let d = 2; d <= 11; d++) hard[11][d] = 'DOUBLE';
  if (surrender){ [9,10,11].forEach(d=> hard[16][d] = 'SURRENDER'); hard[15][10] = 'SURRENDER'; }

  const softKeys = ['A2','A3','A4','A5','A6','A7','A8','A9'];
  softKeys.forEach(k => soft[k] = buildRow('HIT'));
  ['A2','A3'].forEach(k => { for (let d = 5; d <= 6; d++) soft[k][d] = 'DOUBLE'; });
  ['A4','A5'].forEach(k => { for (let d = 4; d <= 6; d++) soft[k][d] = 'DOUBLE'; });
  for (let d = 3; d <= 6; d++) soft['A6'][d] = 'DOUBLE';
  for (let d of [2,7,8]) soft['A7'][d] = 'STAND';
  for (let d = 3; d <= 6; d++) soft['A7'][d] = 'DOUBLE';
  for (let d of [9,10,11]) soft['A7'][d] = 'HIT';
  ['A8','A9'].forEach(k => { for (let d = 2; d <= 11; d++) soft[k][d] = 'STAND'; });
  if (isH17){
    // Additional H17 differences: Soft 17 (A6) double vs 2; Soft 18 (A7) handling already HIT vs A, allow DOUBLE vs 2 when DAS (optional enhancement) else STAND
    soft['A6'][2] = 'DOUBLE';
    if (das) soft['A7'][2] = 'DOUBLE';
  // Soft 19 (A8) doubles vs 6 under H17 (common multi-deck deviation)
  soft['A8'][6] = 'DOUBLE';
  }

  ;['2','3','4','5','6','7','8','9','10','A'].forEach(p => pairs[p] = buildRow('HIT'));
  ['2','3'].forEach(p => { for (let d = 2; d <= 7; d++) pairs[p][d] = 'SPLIT'; });
  // 4,4 split vs 5-6 only if DAS permitted
  if (das) for (let d = 5; d <= 6; d++) pairs['4'][d] = 'SPLIT';
  for (let d = 2; d <= 9; d++) pairs['5'][d] = 'DOUBLE'; // treat as hard 10
  for (let d = 2; d <= 6; d++) pairs['6'][d] = 'SPLIT';
  for (let d = 2; d <= 7; d++) pairs['7'][d] = 'SPLIT';
  for (let d = 2; d <= 11; d++) pairs['8'][d] = 'SPLIT';
  for (let d = 2; d <= 6; d++) pairs['9'][d] = 'SPLIT';
  for (let d of [8,9]) pairs['9'][d] = 'SPLIT';
  for (let d of [7,10,11]) pairs['9'][d] = 'STAND';
  for (let d = 2; d <= 11; d++) pairs['10'][d] = 'STAND';
  for (let d = 2; d <= 11; d++) pairs['A'][d] = 'SPLIT';

  return { hard, soft, pairs };
}
