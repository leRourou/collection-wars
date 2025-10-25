// lib/game-logic.ts
import { getAllCardsShuffled } from "@/services/cardsService";
import type { GameAction } from "@/types/GameAction";
import type { GameCard } from "@/types/GameCard";
import type { GamePlayer } from "@/types/GamePlayer";

export type GameState = {
  players: GamePlayer[];
  currentPlayerIndex: number;
  currentRound: number;
  leftPile: GameCard[];
  rightPile: GameCard[];
  drawPile: GameCard[];
};

export const GameLogic = {
  async createInitialState(players: GamePlayer[]): Promise<GameState> {
    const shuffledCards = await getAllCardsShuffled();
    return {
      players,
      currentPlayerIndex: 0,
      currentRound: 1,
      leftPile: [shuffledCards[0]],
      rightPile: [shuffledCards[1]],
      drawPile: shuffledCards.slice(2),
    };
  },

  /**
   *  Performs an action in the game and returns the updated game state.
   * @param state Current game state
   * @param player The player performing the action
   * @param action The action to be performed
   * @returns Updated game state after performing the action
   */
  async act(state: GameState, action: GameAction): Promise<GameState> {
    switch (action.type) {
      case "PLAY_CARD":
        // Implement the logic for playing a card
        break;
      case "END_TURN":
        // Implement the logic for ending a turn
        break;
      default:
        throw new Error("Unknown action type");
    }
    return state;
  },

  async endGame(state: GameState): Promise<void> {
    // Placeholder for end game logic
    // Implement the logic for ending the game here
  },

  async getCurrentPlayer(state: GameState): Promise<GamePlayer> {
    return state.players[state.currentPlayerIndex];
  },
};
