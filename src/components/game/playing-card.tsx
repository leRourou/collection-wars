"use client";

import { cn } from "@/lib/utils";
import type { GameCard } from "@/types/game-card";
import Image from "next/image";

interface PlayingCardProps {
  card: GameCard;
  isFlipped: boolean;
  selectable?: boolean;
}

export function PlayingCard({ card, isFlipped, selectable }: PlayingCardProps) {
  return (
    <button
      type="button"
      className={cn(
        "w-34 h-52 cursor-pointer bg-transparent border-none p-0",
        "perspective-[1000px] transform-3d",
        "transition-transform duration-500",
        selectable && "cursor-pointer hover:scale-105 active:scale-95",
      )}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500",
          "transform-3d",
          isFlipped && "transform-[rotateY(180deg)]",
        )}
      >
        <div
          className={cn(
            "absolute w-full h-full rounded-sm",
            "bg-linear-to-br from-white to-gray-50",
            "border-2 border-gray-200",
            "shadow-2xl",
            "flex items-center justify-center",
            "backface-hidden",
            "transform-[rotateY(0deg)]",
          )}
        >
          <Image
            src={`/cards/${card.id}.webp`}
            alt={card.id}
            width={128}
            height={176}
            className="w-32 h-50 rounded-xl"
          />
        </div>

        <div
          className={cn(
            "absolute w-full h-full rounded-xl",
            "bg-blue-950 border-2 border-blue-950",
            "shadow-2xl",
            "flex items-center justify-center",
            "backface-hidden",
            "[transform:rotateY(180deg)]",
          )}
        >
          <p className="text-2xl font-bold text-white">Collection wars</p>
        </div>
      </div>
    </button>
  );
}
