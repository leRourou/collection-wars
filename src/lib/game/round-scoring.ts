import type { EndRoundChoice, GameState, PlayerState } from "@/types/game";
import { calculateColorBonus, calculateScore } from "./scoring";

export interface PlayerRoundScore {
  userId: string;
  name: string;
  cardPoints: number;
  colorBonus: number;
  totalPoints: number;
  wasRoundEnder: boolean;
}

export interface RoundResult {
  playerScores: PlayerRoundScore[];
  roundEnder: string;
  choice: EndRoundChoice;
  roundEnderWon: boolean;
}

export function calculateRoundScores(state: GameState): RoundResult | null {
  if (!state.roundEnder || !state.endChoice) return null;

  const roundEnder = state.players.find((p) => p.userId === state.roundEnder);
  if (!roundEnder) return null;

  const choice = state.endChoice;
  const playerScores: PlayerRoundScore[] = [];

  if (choice === "stop") {
    // STOP: Tous les joueurs marquent leurs points normalement
    for (const player of state.players) {
      const cardPoints = calculateScore(player);
      const colorBonus = 0; // Pas de bonus couleur en mode STOP
      playerScores.push({
        userId: player.userId,
        name: player.name,
        cardPoints,
        colorBonus,
        totalPoints: cardPoints,
        wasRoundEnder: player.userId === state.roundEnder,
      });
    }

    return {
      playerScores,
      roundEnder: state.roundEnder,
      choice,
      roundEnderWon: true, // Toujours vrai pour STOP
    };
  }

  // DERNIÈRE CHANCE: Calculer qui a le plus de points
  const roundEnderPoints = calculateScore(roundEnder);
  let maxOpponentPoints = 0;

  for (const player of state.players) {
    if (player.userId !== state.roundEnder) {
      const points = calculateScore(player);
      maxOpponentPoints = Math.max(maxOpponentPoints, points);
    }
  }

  const roundEnderWon = roundEnderPoints > maxOpponentPoints;

  // Calculer les scores selon le résultat du pari
  for (const player of state.players) {
    const cardPoints = calculateScore(player);
    const colorBonus = calculateColorBonus(player);
    const isRoundEnder = player.userId === state.roundEnder;

    let totalPoints = 0;

    if (roundEnderWon) {
      // Le round ender a gagné son pari
      if (isRoundEnder) {
        totalPoints = cardPoints + colorBonus;
      } else {
        totalPoints = colorBonus; // Adversaires: uniquement bonus couleur
      }
    } else {
      // Le round ender a perdu son pari
      if (isRoundEnder) {
        totalPoints = colorBonus; // Uniquement bonus couleur
      } else {
        totalPoints = cardPoints; // Adversaires: points normaux (sans bonus)
      }
    }

    playerScores.push({
      userId: player.userId,
      name: player.name,
      cardPoints,
      colorBonus,
      totalPoints,
      wasRoundEnder: isRoundEnder,
    });
  }

  return {
    playerScores,
    roundEnder: state.roundEnder,
    choice,
    roundEnderWon,
  };
}
