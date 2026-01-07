import type { GameState } from "@/types/game";
import type { GameCard } from "@/types/game-card";

export interface DuoEffectResult {
  state: GameState;
  success: boolean;
  metadata?: {
    stolenCard?: GameCard;
    drawnCard?: GameCard;
    selectedCard?: GameCard;
    targetPlayerId?: string;
    targetPlayerName?: string;
  };
}

/**
 * Determine the effect type from a duo of cards
 * Returns the effect type or null if no effect
 */
export function getDuoEffectType(
  card1: GameCard,
  card2: GameCard,
): string | null {
  if (card1.type === "crab" && card2.type === "crab") return "crab";
  if (card1.type === "boat" && card2.type === "boat") return "boat";
  if (card1.type === "fish" && card2.type === "fish") return "fish";
  if (
    (card1.type === "swimmer" && card2.type === "shark") ||
    (card1.type === "shark" && card2.type === "swimmer")
  ) {
    return "shark_swimmer";
  }
  return null;
}

/**
 * Crab duo effect: Add a card from a discard pile to the player's hand
 * The player chooses which pile and which card
 */
export function applyCrabEffect(
  state: GameState,
  cardId: string,
  pileIndex: 1 | 2,
): DuoEffectResult {
  const pile = pileIndex === 1 ? state.discardPile1 : state.discardPile2;
  const cardIndex = pile.findIndex((c) => c.id === cardId);

  if (cardIndex === -1) {
    return { state, success: false };
  }

  const selectedCard = pile[cardIndex];
  const newPile = [...pile.slice(0, cardIndex), ...pile.slice(cardIndex + 1)];

  const currentPlayer = state.players[state.currentPlayerIndex];
  currentPlayer.hand.push(selectedCard);

  if (pileIndex === 1) {
    state.discardPile1 = newPile;
  } else {
    state.discardPile2 = newPile;
  }

  return {
    state,
    success: true,
    metadata: { selectedCard },
  };
}

/**
 * Boat duo effect: Replay immediately (don't pass turn)
 * This is handled directly in the socket handler, no function needed
 */

/**
 * Fish duo effect: Draw the top card from the deck
 */
export function applyFishEffect(state: GameState): DuoEffectResult {
  if (state.deck.length === 0) {
    return { state, success: false };
  }

  const newDeck = [...state.deck];
  const drawnCard = newDeck.pop()!;

  const currentPlayerIndex = state.currentPlayerIndex;
  const newPlayers = state.players.map((player, idx) => {
    if (idx !== currentPlayerIndex) return player;
    return { ...player, hand: [...player.hand, drawnCard] };
  });

  return {
    state: { ...state, deck: newDeck, players: newPlayers },
    success: true,
    metadata: { drawnCard },
  };
}

/**
 * Shark/Swimmer duo effect: Steal a random card from target player
 */
export function applySharkSwimmerEffect(
  state: GameState,
  targetPlayerId: string,
): DuoEffectResult {
  const targetPlayer = state.players.find((p) => p.userId === targetPlayerId);

  if (!targetPlayer || targetPlayer.hand.length === 0) {
    return { state, success: false };
  }

  // Steal a random card
  const randomIndex = Math.floor(Math.random() * targetPlayer.hand.length);
  const stolenCard = targetPlayer.hand[randomIndex];

  targetPlayer.hand = targetPlayer.hand.filter((_, i) => i !== randomIndex);

  const currentPlayer = state.players[state.currentPlayerIndex];
  currentPlayer.hand.push(stolenCard);

  return {
    state,
    success: true,
    metadata: {
      stolenCard,
      targetPlayerId,
      targetPlayerName: targetPlayer.name,
    },
  };
}
