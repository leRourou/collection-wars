"use client";

import { useEffect } from "react";
import { CardStack } from "@/components/game/card-stack";
import { useGameStore } from "@/hooks/useGame";

export function GameBoard() {
  const { leftPile, rightPile, drawPile, isConnected, connect } =
    useGameStore();

  useEffect(() => {
    connect("game123", "Player1");
  }, [connect]);

  return (
    <div className="w-full max-w-6xl flex flex-col lg:flex-row items-start justify-between gap-12">
      <div className="flex-1 flex justify-center gap-4 pt-8">
        <CardStack faceUp name="Défausse 1" cards={leftPile} />
        <CardStack name="Pioche" cards={drawPile} />
        <CardStack faceUp name="Défausse 2" cards={rightPile} />
      </div>
      {!isConnected && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded">
          Connexion au serveur...
        </div>
      )}
    </div>
  );
}
