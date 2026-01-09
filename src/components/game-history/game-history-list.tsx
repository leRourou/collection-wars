"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type {
  GameHistoryItem as GameHistoryItemType,
  GameHistoryResponse,
} from "@/types/game-history";
import { GameHistoryItem } from "./game-history-item";

export function GameHistoryList() {
  const [games, setGames] = useState<GameHistoryItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchGameHistory = async (page: number, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch(`/api/game-history?page=${page}&limit=10`);

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'historique");
      }

      const data: GameHistoryResponse = await response.json();

      if (append) {
        setGames((prev) => [...prev, ...data.games]);
      } else {
        setGames(data.games);
      }

      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchGameHistory should only run once on mount
  useEffect(() => {
    fetchGameHistory(1);
  }, []);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchGameHistory(currentPage + 1, true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          Aucune partie jouée pour le moment. Lancez votre première partie !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {games.map((game) => (
        <GameHistoryItem key={game.id} game={game} />
      ))}

      {currentPage < totalPages && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
          >
            {isLoadingMore ? "Chargement..." : "Charger plus"}
          </Button>
        </div>
      )}
    </div>
  );
}
