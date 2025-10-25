import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import type { GameState } from "@/lib/game-logic";
import type { GameAction } from "@/types/GameAction";

interface ServerToClientEvents {
  "game-state": (state: GameState) => void;
  error: (error: { message: string }) => void;
  "player-joined": (data: { playerId: string; playerName: string }) => void;
}

interface ClientToServerEvents {
  "start-game": (data: { gameId: string; playerName: string }) => void;
  "game-action": (data: { gameId: string; action: GameAction }) => void;
  "join-game": (data: { gameId: string; playerName: string }) => void;
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketStoreState {
  socket: TypedSocket | null;
  isConnected: boolean;
  gameId: string | null;
  error: string | null;

  connect: (gameId: string, playerName: string) => void;
  disconnect: () => void;
  emit: (event: keyof ClientToServerEvents, data: any) => void;
  on: (
    event: keyof ServerToClientEvents,
    handler: (...args: any[]) => void,
  ) => void;
  setError: (error: string | null) => void;
}

export const useSocketStore = create<SocketStoreState>((set, get) => ({
  socket: null,
  isConnected: false,
  gameId: null,
  error: null,

  connect: (gameId: string, playerName: string) => {
    const existingSocket = get().socket;
    if (existingSocket?.connected) {
      console.warn("Socket déjà connecté");
      return;
    }

    const socket: TypedSocket = io();

    socket.on("connect", () => {
      console.log("Connecté au serveur");
      set({ isConnected: true, gameId });
      socket.emit("start-game", { gameId, playerName });
    });

    socket.on("disconnect", () => {
      console.log("Déconnecté du serveur");
      set({ isConnected: false });
    });

    socket.on("error", (error) => {
      console.error("Erreur serveur:", error.message);
      set({ error: error.message });
    });

    socket.on("player-joined", (data) => {
      console.log("Joueur rejoint:", data.playerName);
    });

    set({ socket });
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        gameId: null,
        error: null,
      });
    }
  },

  emit: (event: keyof ClientToServerEvents, data: any) => {
    const { socket, isConnected } = get();

    if (!isConnected || !socket) {
      console.error("Socket non connecté");
      set({ error: "Non connecté au serveur" });
      return;
    }

    console.log(`📤 Envoi ${event}:`, data);
    socket.emit(event, data);
  },

  on: (
    event: keyof ServerToClientEvents,
    handler: (...args: any[]) => void,
  ) => {
    const socket = get().socket;
    if (socket) {
      socket.on(event, handler);
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
