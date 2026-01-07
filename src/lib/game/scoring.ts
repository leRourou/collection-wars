import type { PlayerState } from "@/types/game";
import type { GameCard } from "@/types/game-card";

export function calculateScore(player: PlayerState): number {
  const allCards = [...player.hand, ...player.playedCards];
  let score = 0;

  score += countDuoPoints(allCards);
  score += countCollectionPoints(allCards);
  score += countSirenPoints(allCards);
  score += countMarinePoints(allCards);

  return score;
}

function countDuoPoints(cards: GameCard[]): number {
  let points = 0;

  const crabs = cards.filter((c) => c.type === "crab").length;
  const boats = cards.filter((c) => c.type === "boat").length;
  const fish = cards.filter((c) => c.type === "fish").length;

  // 2 points per duo (pair of cards)
  points += Math.floor(crabs / 2) * 2;
  points += Math.floor(boats / 2) * 2;
  points += Math.floor(fish / 2) * 2;

  const swimmers = cards.filter((c) => c.type === "swimmer").length;
  const sharks = cards.filter((c) => c.type === "shark").length;
  // 2 points per swimmer-shark duo
  points += Math.min(swimmers, sharks) * 2;

  return points;
}

function countCollectionPoints(cards: GameCard[]): number {
  let points = 0;

  const shells = cards.filter((c) => c.type === "shell").length;
  const shellPoints = [0, 0, 2, 4, 6, 8, 10];
  points += shellPoints[Math.min(shells, 6)];

  const octopuses = cards.filter((c) => c.type === "octopus").length;
  const octopusPoints = [0, 0, 3, 6, 9, 12];
  points += octopusPoints[Math.min(octopuses, 5)];

  const penguins = cards.filter((c) => c.type === "pinguin").length;
  const penguinPoints = [0, 1, 3, 5];
  points += penguinPoints[Math.min(penguins, 3)];

  return points;
}

function countSirenPoints(cards: GameCard[]): number {
  const sirens = cards.filter((c) => c.type === "sirene");
  if (sirens.length === 0) return 0;

  const colorCounts = cards.reduce(
    (acc, card) => {
      acc[card.color] = (acc[card.color] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const sortedColors = Object.entries(colorCounts).sort(
    ([, a], [, b]) => b - a,
  );

  let points = 0;
  for (let i = 0; i < sirens.length && i < sortedColors.length; i++) {
    points += sortedColors[i][1];
  }

  return points;
}

function countMarinePoints(cards: GameCard[]): number {
  const marines = cards.filter((c) => c.type === "marine");

  // Separate regular marines from multiplier
  const regularMarines = marines.filter((c) => c.id !== "marine_imp");
  const hasMultiplier = marines.some((c) => c.id === "marine_imp");

  // Need at least 2 regular marines for base scoring
  if (regularMarines.length < 2) return 0;

  // Base: 2+ marines = 5 points
  let points = 5;

  // Multiplier triples the base score
  if (hasMultiplier) {
    points *= 3; // 5 × 3 = 15 points
  }

  return points;
}

export function calculateColorBonus(player: PlayerState): number {
  const allCards = [...player.hand, ...player.playedCards];
  const colorCounts = allCards.reduce(
    (acc, card) => {
      acc[card.color] = (acc[card.color] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Math.max(...Object.values(colorCounts), 0);
}

export function hasWinningCondition(player: PlayerState): boolean {
  const sirenCount = player.playedCards.filter(
    (c) => c.type === "sirene",
  ).length;
  return sirenCount === 4;
}
