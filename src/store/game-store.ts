import { create } from "zustand";
import type { GameState, Room } from "@/types/game";
import type { GameCard } from "@/types/game-card";

interface GameStore {
  currentRoom: Room | null;
  setCurrentRoom: (room: Room | null) => void;

  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;

  selectedCards: string[];
  toggleCardSelection: (cardId: string) => void;
  clearSelection: () => void;

  drawnCards: [GameCard, GameCard] | null;
  setDrawnCards: (cards: [GameCard, GameCard] | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentRoom: null,
  setCurrentRoom: (room) => set({ currentRoom: room }),

  gameState: null,
  setGameState: (state) => set({ gameState: state }),

  selectedCards: [],
  toggleCardSelection: (cardId) =>
    set((state) => {
      const index = state.selectedCards.indexOf(cardId);
      if (index > -1) {
        return {
          selectedCards: state.selectedCards.filter((id) => id !== cardId),
        };
      }
      if (state.selectedCards.length >= 2) return state;
      return { selectedCards: [...state.selectedCards, cardId] };
    }),
  clearSelection: () => set({ selectedCards: [] }),

  drawnCards: null,
  setDrawnCards: (cards) => set({ drawnCards: cards }),
}));
