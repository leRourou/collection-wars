import type { GameCard } from "./GameCard";

/**
 *  Les différents types d'actions possible dans le jeu
 */
export type GameAction =
  | { type: "DRAW_CARD"; pile: "left" | "right" | "draw" }
  | { type: "PLAY_CARD"; card: GameCard }
  | { type: "PLAY_COMBO"; firstCard: GameCard; secondCard: GameCard }
  | { type: "END_TURN" };
