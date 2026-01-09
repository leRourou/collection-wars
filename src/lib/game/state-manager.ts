import type { GameState, PlayerId, Room, RoomCode } from "@/types/game";

class StateManager {
  private rooms = new Map<RoomCode, Room>();
  private games = new Map<RoomCode, GameState>();
  private playerToRoom = new Map<PlayerId, RoomCode>();
  private playerNames = new Map<PlayerId, string>();

  setPlayerName(playerId: PlayerId, name: string): void {
    this.playerNames.set(playerId, name);
  }

  getPlayerName(playerId: PlayerId): string {
    return this.playerNames.get(playerId) || playerId;
  }

  createRoom(hostId: PlayerId, maxPlayers: number): RoomCode {
    const code = this.generateRoomCode();
    const room: Room = {
      code,
      hostId,
      players: [hostId],
      playerNames: { [hostId]: this.getPlayerName(hostId) },
      maxPlayers,
      status: "waiting",
    };
    this.rooms.set(code, room);
    this.playerToRoom.set(hostId, code);
    return code;
  }

  getRoom(code: RoomCode): Room | undefined {
    const room = this.rooms.get(code);
    if (!room) return undefined;

    // Mettre à jour les noms des joueurs
    const playerNames: Record<PlayerId, string> = {};
    for (const playerId of room.players) {
      playerNames[playerId] = this.getPlayerName(playerId);
    }
    return { ...room, playerNames };
  }

  joinRoom(code: RoomCode, playerId: PlayerId): boolean {
    const room = this.rooms.get(code);
    if (!room) return false;
    if (room.players.length >= room.maxPlayers) return false;
    if (room.status !== "waiting") return false;

    room.players.push(playerId);
    this.playerToRoom.set(playerId, code);
    return true;
  }

  leaveRoom(playerId: PlayerId): RoomCode | undefined {
    const code = this.playerToRoom.get(playerId);
    if (!code) return undefined;

    const room = this.rooms.get(code);
    if (!room) return undefined;

    room.players = room.players.filter((p) => p !== playerId);
    this.playerToRoom.delete(playerId);

    if (room.players.length === 0) {
      this.rooms.delete(code);
      this.games.delete(code);
    }

    return code;
  }

  getRoomByPlayer(playerId: PlayerId): Room | undefined {
    const code = this.playerToRoom.get(playerId);
    return code ? this.rooms.get(code) : undefined;
  }

  async createGameState(room: Room): Promise<GameState> {
    const gameState = await this.initializeGameState(room);
    this.games.set(room.code, gameState);
    return gameState;
  }

  getGameState(code: RoomCode): GameState | undefined {
    return this.games.get(code);
  }

  updateGameState(
    code: RoomCode,
    updater: (state: GameState) => GameState,
  ): GameState | undefined {
    const current = this.games.get(code);
    if (!current) return undefined;

    const updated = updater(current);
    this.games.set(code, updated);
    return updated;
  }

  private generateRoomCode(): RoomCode {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code: string;
    do {
      code = Array.from(
        { length: 5 },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join("");
    } while (this.rooms.has(code));
    return code;
  }

  private async initializeGameState(room: Room): Promise<GameState> {
    var { initializeGame } = require("./game-engine");
    const playerNamesMap = new Map<PlayerId, string>();
    for (const playerId of room.players) {
      playerNamesMap.set(playerId, this.getPlayerName(playerId));
    }
    return await initializeGame(room, playerNamesMap);
  }
}

export const stateManager = new StateManager();
