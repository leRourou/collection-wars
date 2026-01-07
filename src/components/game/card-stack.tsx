"use client";

import { cn } from "@/lib/utils";
import type { GameCard } from "@/types/game-card";
import { PlayingCard } from "./playing-card";

interface CardStackProps {
  cards: GameCard[];
  name: string;
  faceUp?: boolean;
  onClick?: () => void;
}

export function CardStack({
  name,
  cards,
  faceUp = false,
  onClick,
}: CardStackProps) {
  const maxVisibleCards = Math.min(cards.length, 5);

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-lg font-semibold text-white">{name}</p>
      <button
        type="button"
        className={cn(
          "relative cursor-pointer bg-transparent border-none p-0",
          "transition-transform duration-200",
          onClick && "hover:scale-105 active:scale-95",
          !onClick && "cursor-default",
        )}
        onClick={onClick}
        disabled={!onClick}
      >
        {cards.map((card, index) => {
          const offset = index * 2;
          const isTopCard = index === maxVisibleCards - 1;

          if (isTopCard) {
            return (
              <div
                key={card.id}
                className="absolute"
                style={{
                  top: `${offset}px`,
                  left: `${offset}px`,
                  zIndex: index,
                }}
              >
                <PlayingCard
                  card={card}
                  isFlipped={!faceUp}
                  selectable={!!onClick}
                />
              </div>
            );
          }

          return (
            <div
              key={card.id}
              className={cn(
                "absolute w-34 h-52 rounded-sm shadow-xl",
                "border-2",
                faceUp
                  ? "bg-gradient-to-br from-white to-gray-50 border-gray-200"
                  : "bg-blue-950 border-blue-950",
              )}
              style={{
                top: `${offset}px`,
                left: `${offset}px`,
                zIndex: index,
              }}
            >
              {!faceUp && (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-2xl font-bold text-white">
                    Collection wars
                  </p>
                </div>
              )}
            </div>
          );
        })}
        <div
          className="w-32 h-48"
          style={{ marginTop: `${(maxVisibleCards - 1) * 2}px` }}
        />
      </button>
    </div>
  );
}
