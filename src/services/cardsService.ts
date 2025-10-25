import type { GameCard } from "@/types/GameCard";

const CARDS_PATH = "../data/cards.json";

const getAllCards = async (): Promise<GameCard[]> => {
  const cards = (await import(CARDS_PATH).then((m) => m.default)) as GameCard[];
  return cards;
};

export const getAllCardsShuffled = async (): Promise<GameCard[]> => {
  const cards = await getAllCards();
  return cards.sort(() => Math.random() - 0.5);
};
