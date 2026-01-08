import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export interface PlayerStats {
  totalPoints: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
}

/**
 * GET /api/user/stats
 * Récupère les statistiques du joueur connecté
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    const gameResults = await prisma.gameResult.findMany({
      where: {
        OR: [{ player1Id: currentUserId }, { player2Id: currentUserId }],
      },
      select: {
        player1Id: true,
        player2Id: true,
        winnerId: true,
        player1Score: true,
        player2Score: true,
      },
    });

    const totalPoints = gameResults.reduce((sum, game) => {
      const isPlayer1 = game.player1Id === currentUserId;
      const playerScore = isPlayer1 ? game.player1Score : game.player2Score;
      return sum + playerScore;
    }, 0);

    const gamesPlayed = gameResults.length;

    const gamesWon = gameResults.filter(
      (game) => game.winnerId === currentUserId,
    ).length;

    const winRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0;

    const stats: PlayerStats = {
      totalPoints,
      gamesPlayed,
      gamesWon,
      winRate: Math.round(winRate * 10) / 10,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
