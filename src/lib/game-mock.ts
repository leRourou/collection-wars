import type { GameState } from "@/lib/game-logic";
import { getAllCardsShuffled } from "@/services/cardsService";

/**
 * Generates a mock game state for development and testing
 */
export async function generateMockGameState(
  playerId?: string,
  playerName?: string,
): Promise<GameState> {
  // Récupère toutes les cartes depuis le service
  const allCards = await getAllCardsShuffled();

  const currentPlayerId =
    playerId || `player-${Math.random().toString(36).substr(2, 9)}`;
  const currentPlayerName =
    playerName || `Joueur ${Math.floor(Math.random() * 100)}`;

  // Distribue les cartes
  const playerHand = allCards.slice(0, 3);
  const leftPileCard = allCards.slice(3, 4);
  const rightPileCard = allCards.slice(4, 5);
  const drawPile = allCards.slice(5);

  const mockPlayers = [
    {
      id: currentPlayerId,
      name: currentPlayerName,
      hand: playerHand,
      placedCards: [],
      score: 0,
    },
    {
      id: "bot-1",
      name: "Bot Alice",
      hand: [],
      placedCards: [],
      score: 0,
    },
  ];

  return {
    players: mockPlayers,
    currentPlayerIndex: 0,
    currentRound: 1,
    leftPile: leftPileCard,
    rightPile: rightPileCard,
    drawPile,
  };
}

/**
 * Generates a random player ID
 */
export function generatePlayerId(): string {
  return `player-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates a random player name
 */
export function generatePlayerName(): string {
  const adjectives = ["Brave", "Sage", "Swift", "Mighty", "Clever"];
  const nouns = ["Warrior", "Mage", "Rogue", "Paladin", "Archer"];
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdj} ${randomNoun}`;
}
