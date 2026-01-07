import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { GameHistoryResponse } from "@/types/game-history";

/**
 * GET /api/game-history?page=1&limit=10
 * Récupère l'historique des parties de l'utilisateur connecté
 */
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Paramètres de pagination invalides" },
        { status: 400 },
      );
    }

    const skip = (page - 1) * limit;

    // Fetch total count
    const total = await prisma.gameResult.count({
      where: {
        OR: [{ player1Id: currentUserId }, { player2Id: currentUserId }],
      },
    });

    // Fetch game results
    const gameResults = await prisma.gameResult.findMany({
      where: {
        OR: [{ player1Id: currentUserId }, { player2Id: currentUserId }],
      },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
          },
        },
        player2: {
          select: {
            id: true,
            username: true,
          },
        },
        winner: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        endedAt: "desc",
      },
      skip,
      take: limit,
    });

    // Transform data
    const games = gameResults.map((game) => {
      // Determine if current user is player1 or player2
      const isPlayer1 = game.player1Id === currentUserId;
      const opponent = isPlayer1 ? game.player2 : game.player1;
      const opponentName = opponent.username || "Utilisateur supprimé";

      // Determine result
      let result: "win" | "loss" | "draw";
      if (!game.winnerId) {
        result = "draw";
      } else if (game.winnerId === currentUserId) {
        result = "win";
      } else {
        result = "loss";
      }

      // Get scores
      const currentUserScore = isPlayer1
        ? game.player1Score
        : game.player2Score;
      const opponentScore = isPlayer1 ? game.player2Score : game.player1Score;

      return {
        id: game.id,
        opponentName,
        result,
        currentUserScore,
        opponentScore,
        durationSeconds: game.durationSeconds,
        endedAt: game.endedAt,
        reason: game.reason,
      };
    });

    const totalPages = Math.ceil(total / limit);

    const response: GameHistoryResponse = {
      games,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching game history:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
