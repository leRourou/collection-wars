import type { GameCard } from "./GameCard";

export type GameAction =
  | { type: "DRAW_CARD"; pile: "left" | "right" | "draw" }
  | { type: "PLAY_CARD"; card: GameCard }
  | { type: "PLAY_COMBO"; firstCard: GameCard; secondCard: GameCard }
  | { type: "END_TURN" };
