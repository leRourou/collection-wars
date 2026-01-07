export interface GameHistoryItem {
  id: string;
  opponentName: string;
  result: "win" | "loss" | "draw";
  currentUserScore: number;
  opponentScore: number;
  durationSeconds: number;
  endedAt: Date;
  reason: string;
}

export interface GameHistoryResponse {
  games: GameHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
