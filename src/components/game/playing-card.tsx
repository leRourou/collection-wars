"use client";

import { cn } from "@/lib/utils";

interface PlayingCardProps {
  text: string;
  isFlipped: boolean;
  selectable?: boolean;
}

export function PlayingCard({ text, isFlipped, selectable }: PlayingCardProps) {
  return (
    <button
      type="button"
      className={cn(
        "w-64 h-96 cursor-pointer bg-transparent border-none p-0",
        "[perspective:1000px] [transform-style:preserve-3d]",
        "transition-transform duration-500",
        selectable && "cursor-pointer hover:scale-105 active:scale-95",
      )}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500",
          "[transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]",
        )}
      >
        <div
          className={cn(
            "absolute w-full h-full rounded-2xl",
            "bg-gradient-to-br from-white to-gray-50",
            "border-2 border-gray-200",
            "shadow-2xl",
            "flex items-center justify-center",
            "[backface-visibility:hidden]",
            "[transform:rotateY(0deg)]",
          )}
        >
          <div className="p-8 text-center relative z-10">
            <p className="text-2xl font-bold text-gray-800">{text}</p>
          </div>
          <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full" />
          <div className="absolute bottom-4 right-4 w-3 h-3 bg-red-500 rounded-full" />
        </div>

        <div
          className={cn(
            "absolute w-full h-full rounded-2xl",
            "bg-blue-950 border-2 border-blue-950",
            "shadow-2xl",
            "flex items-center justify-center",
            "[backface-visibility:hidden]",
            "[transform:rotateY(180deg)]",
          )}
        >
          <p className="text-2xl font-bold text-white">Collection wars</p>
        </div>
      </div>
    </button>
  );
}
