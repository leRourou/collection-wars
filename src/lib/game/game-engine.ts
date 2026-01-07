import { getAllCardsShuffled } from "@/services/cards-service";
import type {
  EndRoundChoice,
  GameState,
  PlayerState,
  Room,
} from "@/types/game";
import { GameStatus, RoundPhase } from "@/types/game";
import type { GameCard } from "@/types/game-card";
import { calculateScore } from "./scoring";

export async function initializeGame(
  room: Room,
  playerNames: Map<string, string>,
): Promise<GameState> {
  const cards = await getAllCardsShuffled();

  const discardPile1 = [cards[0]];
  const discardPile2 = [cards[1]];
  const deck = cards.slice(2);

  const targetScore =
    room.players.length === 2 ? 40 : room.players.length === 3 ? 35 : 30;

  const players: PlayerState[] = room.players.map((userId) => ({
    userId,
    name: playerNames.get(userId) || userId,
    hand: [],
    playedCards: [],
    score: 0,
    connected: true,
  }));

  return {
    id: crypto.randomUUID(),
    roomCode: room.code,
    status: GameStatus.PLAYING,
    players,
    currentPlayerIndex: 0,
    deck,
    discardPile1,
    discardPile2,
    roundNumber: 1,
    roundPhase: RoundPhase.DRAW,
    createdAt: Date.now(),
    startedAt: Date.now(),
    targetScore,
    lastChancePlayed: [],
  };
}

export function canDrawFromDeck(state: GameState): boolean {
  return state.deck.length >= 2 && state.roundPhase === RoundPhase.DRAW;
}

export function canDrawFromDiscard(
  state: GameState,
  pileIndex: 1 | 2,
): boolean {
  if (state.roundPhase !== RoundPhase.DRAW) return false;
  const pile = pileIndex === 1 ? state.discardPile1 : state.discardPile2;
  return pile.length > 0;
}

export function drawFromDiscard(state: GameState, pileIndex: 1 | 2): GameState {
  if (!canDrawFromDiscard(state, pileIndex)) {
    throw new Error("Cannot draw from discard");
  }

  const pile = pileIndex === 1 ? state.discardPile1 : state.discardPile2;
  const card = pile[pile.length - 1];

  const newDiscardPile1 =
    pileIndex === 1 ? [...state.discardPile1.slice(0, -1)] : state.discardPile1;
  const newDiscardPile2 =
    pileIndex === 2 ? [...state.discardPile2.slice(0, -1)] : state.discardPile2;

  const currentPlayer = state.players[state.currentPlayerIndex];
  const newPlayers = state.players.map((p) =>
    p.userId === currentPlayer.userId ? { ...p, hand: [...p.hand, card] } : p,
  );

  return {
    ...state,
    players: newPlayers,
    discardPile1: newDiscardPile1,
    discardPile2: newDiscardPile2,
    roundPhase: RoundPhase.PLAY_DUO,
  };
}

export function drawFromDeck(state: GameState): {
  state: GameState;
  drawnCards: [GameCard, GameCard];
} {
  if (!canDrawFromDeck(state)) {
    throw new Error("Cannot draw from deck");
  }

  const card1 = state.deck.pop()!;
  const card2 = state.deck.pop()!;
  const drawnCards: [GameCard, GameCard] = [card1, card2];

  return {
    state: {
      ...state,
      roundPhase: RoundPhase.PLAY_DUO,
      drawnCards,
    },
    drawnCards,
  };
}

export function keepCard(
  state: GameState,
  cardToKeep: GameCard,
  cardToDiscard: GameCard,
  discardPileIndex: 1 | 2,
): GameState {
  const currentPlayerIndex = state.currentPlayerIndex;

  const newPlayers = state.players.map((player, idx) => {
    if (idx !== currentPlayerIndex) return player;
    return { ...player, hand: [...player.hand, cardToKeep] };
  });

  const newDiscardPile1 = discardPileIndex === 1
    ? [...state.discardPile1, cardToDiscard]
    : state.discardPile1;

  const newDiscardPile2 = discardPileIndex === 2
    ? [...state.discardPile2, cardToDiscard]
    : state.discardPile2;

  return {
    ...state,
    players: newPlayers,
    discardPile1: newDiscardPile1,
    discardPile2: newDiscardPile2,
    roundPhase: RoundPhase.PLAY_DUO,
    drawnCards: undefined,
  };
}

export function canPlayDuo(
  state: GameState,
  card1: GameCard,
  card2: GameCard,
): boolean {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const hasCard1 = currentPlayer.hand.some((c) => c.id === card1.id);
  const hasCard2 = currentPlayer.hand.some((c) => c.id === card2.id);

  if (!hasCard1 || !hasCard2) return false;

  return isDuoValid(card1, card2);
}

export function isDuoValid(card1: GameCard, card2: GameCard): boolean {
  const allowedTypes = ["boat", "crab", "fish", "swimmer", "shark"];

  // Check if both cards are of allowed types
  if (
    !allowedTypes.includes(card1.type) ||
    !allowedTypes.includes(card2.type)
  ) {
    return false;
  }

  // Special case: swimmer+shark (bidirectional)
  if (
    (card1.type === "swimmer" && card2.type === "shark") ||
    (card1.type === "shark" && card2.type === "swimmer")
  ) {
    return true;
  }

  // Same type duos - BUT NOT swimmer+swimmer or shark+shark
  if (card1.type === card2.type) {
    // Explicitly disallow swimmer+swimmer and shark+shark
    if (card1.type === "swimmer" || card1.type === "shark") {
      return false;
    }
    return true; // boat+boat, crab+crab, fish+fish allowed
  }

  return false;
}

export function playDuo(
  state: GameState,
  card1Id: string,
  card2Id: string,
): GameState {
  const currentPlayerIndex = state.currentPlayerIndex;
  const currentPlayer = state.players[currentPlayerIndex];

  const card1 = currentPlayer.hand.find((c) => c.id === card1Id)!;
  const card2 = currentPlayer.hand.find((c) => c.id === card2Id)!;

  const newPlayers = state.players.map((player, idx) => {
    if (idx !== currentPlayerIndex) return player;

    return {
      ...player,
      hand: player.hand.filter((c) => c.id !== card1Id && c.id !== card2Id),
      playedCards: [...player.playedCards, card1, card2],
    };
  });

  return { ...state, players: newPlayers };
}

export function canEndRound(state: GameState, userId?: string): boolean {
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (userId && currentPlayer.userId !== userId) return false;

  const totalPoints = calculatePlayerPoints(currentPlayer);
  return totalPoints >= 7;
}

export function calculatePlayerPoints(player: PlayerState): number {
  return calculateScore(player);
}

export function passTurn(state: GameState): GameState {
  return {
    ...state,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    roundPhase: RoundPhase.DRAW,
  };
}

export function endRound(
  state: GameState,
  userId: string,
  choice: EndRoundChoice,
): GameState {
  if (!canEndRound(state, userId)) {
    throw new Error("Cannot end round");
  }

  return {
    ...state,
    roundEnder: userId,
    endChoice: choice,
    roundPhase: RoundPhase.END_TURN,
  };
}

export function resetForNextRound(state: GameState): GameState {
  return {
    ...state,
    roundNumber: state.roundNumber + 1,
    roundPhase: RoundPhase.DRAW,
    roundEnder: undefined,
    endChoice: undefined,
    lastChancePlayed: [],
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    drawnCards: undefined,
  };
}
