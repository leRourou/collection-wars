import type { GameCard } from "./GameCard";

export type GamePlayer = {
  id: string;
  name: string;
  placedCards: GameCard[];
  hand: GameCard[];
  score: number;
};
