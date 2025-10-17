export interface FlashItem {
    label: string;
    expected: string;
    type: 'hard' | 'soft' | 'pair';
    playerCards: { rank: string; value: number; suit: string }[];
    dealerUp: { rank: string; value: number; suit: string };
    key: string;
}