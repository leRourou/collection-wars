import type { GameCard } from "@/types/game-card";
import cardsData from "@/data/cards.json";

export async function getAllCards(): Promise<GameCard[]> {
  return cardsData as GameCard[];
}

export async function getAllCardsShuffled(): Promise<GameCard[]> {
  const cards = await getAllCards();
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function getCardById(id: string): Promise<GameCard | undefined> {
  const cards = await getAllCards();
  return cards.find((card) => card.id === id);
}
