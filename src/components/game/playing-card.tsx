"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GameCard } from "@/types/game-card";

interface PlayingCardProps {
  card: GameCard;
  isFlipped: boolean;
  selectable?: boolean;
  size?: "small" | "medium" | "large";
  isSelected?: boolean;
  disabled?: boolean;
}

export function PlayingCard({
  card,
  isFlipped,
  selectable,
  size = "large",
  isSelected = false,
  disabled = false,
}: PlayingCardProps) {
  const sizeClasses = {
    small: "w-20 h-28",
    medium: "w-28 h-40",
    large: "w-34 h-52",
  };

  const imageSizes = {
    small: { width: 80, height: 110 },
    medium: { width: 112, height: 154 },
    large: { width: 128, height: 176 },
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        "relative perspective-[1000px]",
        selectable && !disabled && "cursor-pointer",
        disabled && "cursor-not-allowed opacity-50 grayscale",
        isSelected && "ring-4 ring-blue-500 rounded-lg",
      )}
    >
      <div
        className={cn(
          "w-full h-full transition-transform duration-500",
          "transform-3d",
          selectable && !disabled && "hover:scale-105 active:scale-95",
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
            width={imageSizes[size].width}
            height={imageSizes[size].height}
            className="w-full h-full rounded-xl"
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
    </div>
  );
}
