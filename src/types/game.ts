import type { GameCard } from "./game-card";

export type PlayerId = string;
export type RoomCode = string;
export type GameId = string;

export enum GameStatus {
  WAITING = "waiting",
  PLAYING = "playing",
  ENDED = "ended",
}

export enum RoundPhase {
  DRAW = "draw",
  PLAY_DUO = "play_duo",
  END_TURN = "end_turn",
}

export enum EndRoundChoice {
  STOP = "stop",
  LAST_CHANCE = "last_chance",
}

export type GameEndReason = "score_reached" | "immediate_win" | "host_stopped";

export interface PlayerState {
  userId: string;
  name: string;
  hand: GameCard[];
  playedCards: GameCard[];
  score: number;
  connected: boolean;
}

export interface GameState {
  id: GameId;
  roomCode: RoomCode;
  status: GameStatus;

  players: PlayerState[];
  currentPlayerIndex: number;

  deck: GameCard[];
  discardPile1: GameCard[];
  discardPile2: GameCard[];
  drawnCards?: [GameCard, GameCard];

  roundNumber: number;
  roundPhase: RoundPhase;

  roundEnder?: PlayerId;
  endChoice?: EndRoundChoice;
  lastChancePlayed: PlayerId[];

  pendingEffect?: {
    type: "crab" | "shark_swimmer";
    playerId: string;
    duoCards: [string, string];
  };

  createdAt: number;
  startedAt?: number;
  targetScore: number;
}

export interface Room {
  code: RoomCode;
  hostId: PlayerId;
  players: PlayerId[];
  playerNames?: Record<PlayerId, string>;
  maxPlayers: number;
  status: "waiting" | "playing";
  gameState?: GameState;
}

export interface ServerToClientEvents {
  "room:created": (data: { roomCode: RoomCode }) => void;
  "room:joined": (data: { room: Room }) => void;
  "room:player-joined": (data: {
    playerId: PlayerId;
    playerName: string;
    room: Room;
  }) => void;
  "room:player-left": (data: { playerId: PlayerId }) => void;
  "room:error": (data: { message: string }) => void;
  "room:info": (data: { room: Room }) => void;

  "game:started": (data: { gameState: GameState }) => void;
  "game:state-update": (data: { gameState: GameState }) => void;
  "game:invalid-action": (data: { message: string }) => void;
  "game:cards-drawn": (data: { cards: [GameCard, GameCard] }) => void;

  "round:ended": (data: {
    scores: Record<PlayerId, number>;
    gameState: GameState;
    roundResult?: any;
  }) => void;
  "round:continue-requested": () => void;
  "game:ended": (data: {
    winnerId: PlayerId;
    finalScores: Record<PlayerId, number>;
  }) => void;

  // Duo effect events
  "effect:crab-choose-pile": () => void;
  "effect:crab-show-cards": (data: {
    pileIndex: 1 | 2;
    cards: GameCard[];
  }) => void;
  "effect:shark-swimmer-choose-target": (data: {
    possibleTargets: Array<{
      userId: string;
      name: string;
      handCount: number;
    }>;
  }) => void;
  "effect:executed": (data: {
    effectType: string;
    metadata: any;
  }) => void;
  "effect:failed": (data: { effectType: string; reason: string }) => void;
}

export interface ClientToServerEvents {
  "room:create": (data: { maxPlayers: number }) => void;
  "room:join": (data: { roomCode: RoomCode }) => void;
  "room:leave": () => void;
  "room:get-info": (data: { roomCode: RoomCode }) => void;
  "room:start-game": () => void;

  "game:get-state": (data: { roomCode: RoomCode }) => void;
  "game:draw-from-deck": () => void;
  "game:draw-from-discard": (data: { pileIndex: 1 | 2 }) => void;
  "game:keep-card": (data: { cardId: string; discardPileIndex: 1 | 2 }) => void;
  "game:play-duo": (data: { cardIds: [string, string] }) => void;
  "game:end-round": (data: { choice: EndRoundChoice }) => void;
  "game:pass-turn": () => void;
  "round:host-continue": () => void;
  "round:host-stop": () => void;

  // Duo effect events
  "effect:crab-select-pile": (data: { pileIndex: 1 | 2 }) => void;
  "effect:crab-select-card": (data: {
    cardId: string;
    pileIndex: 1 | 2;
  }) => void;
  "effect:shark-swimmer-select-target": (data: {
    targetPlayerId: string;
  }) => void;
}
