import { create } from "zustand";
import type { GameState } from "@/lib/game-logic";
import type { GameAction } from "@/types/GameAction";
import { useSocketStore } from "./useSocket";

interface GameStoreState extends GameState {
  error: string | null;
  isConnected: boolean;
  gameId: string | null;

  // Actions de connexion
  connect: (gameId: string, playerName: string) => void;
  disconnect: () => void;

  // Actions de jeu
  updateGameState: (state: GameState) => void;
  playCard: (cardId: number, pileId: "left" | "right") => void;
  endTurn: () => void;
  sendAction: (action: GameAction) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: GameState = {
  players: [],
  currentPlayerIndex: 0,
  currentRound: 1,
  leftPile: [],
  rightPile: [],
  drawPile: [],
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  // État initial
  ...initialState,
  error: null,
  isConnected: false,
  gameId: null,

  // Connexion au serveur WebSocket via useSocket
  connect: (gameId: string, playerName: string) => {
    const { connect, on } = useSocketStore.getState();

    // Connecte au serveur
    connect(gameId, playerName);

    // Écoute les mises à jour de l'état du jeu
    on("game-state", (state: GameState) => {
      console.log("📦 État reçu du serveur:", state);
      get().updateGameState(state);
    });

    // Synchronise l'état de connexion
    useSocketStore.subscribe((socketState) => {
      set({
        isConnected: socketState.isConnected,
        error: socketState.error,
      });
    });

    set({ gameId });
  },

  // Déconnexion
  disconnect: () => {
    const { disconnect } = useSocketStore.getState();
    disconnect();
    get().reset();
  },

  // Envoie une action au serveur
  sendAction: (action: GameAction) => {
    const { gameId, isConnected } = get();
    const { emit } = useSocketStore.getState();

    if (!isConnected || !gameId) {
      set({ error: "Non connecté au serveur" });
      return;
    }

    emit("game-action", { gameId, action });
  },

  // Met à jour tout l'état du jeu (reçu du serveur ou du mock)
  updateGameState: (state: GameState) => {
    set({
      ...state,
      error: null,
    });
  },

  // Joue une carte
  playCard: (cardId: number, pileId: "left" | "right") => {
    const state = get();
    const currentPlayer = state.players[state.currentPlayerIndex];

    if (!currentPlayer) {
      set({ error: "Aucun joueur actuel" });
      return;
    }

    const card = currentPlayer.hand.find((c) => c.id === cardId);
    if (!card) {
      set({ error: "Carte non trouvée" });
      return;
    }

    // Envoie l'action au serveur
    get().sendAction({
      type: "PLAY_CARD",
      card,
    });

    // Logique simplifiée locale - sera remplacée par la réponse du serveur
    const updatedHand = currentPlayer.hand.filter((c) => c.id !== cardId);
    const updatedPlayers = [...state.players];
    updatedPlayers[state.currentPlayerIndex] = {
      ...currentPlayer,
      hand: updatedHand,
    };

    const pile = pileId === "left" ? state.leftPile : state.rightPile;
    const updatedPile = [...pile, card];

    set({
      players: updatedPlayers,
      leftPile: pileId === "left" ? updatedPile : state.leftPile,
      rightPile: pileId === "right" ? updatedPile : state.rightPile,
    });
  },

  // Termine le tour
  endTurn: () => {
    const state = get();

    // Envoie l'action au serveur
    get().sendAction({
      type: "END_TURN",
    });

    // Logique locale
    const nextPlayerIndex =
      (state.currentPlayerIndex + 1) % state.players.length;
    set({ currentPlayerIndex: nextPlayerIndex });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set({
      ...initialState,
      error: null,
      isConnected: false,
      gameId: null,
    });
  },
}));
