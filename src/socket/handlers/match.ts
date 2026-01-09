import * as engine from "@/lib/game/game-engine";
import { stateManager } from "@/lib/game/state-manager";
import { prisma } from "@/lib/prisma";
import type { PlayerId } from "@/types/game";
import { RoundPhase } from "@/types/game";
import type { TypedServer, TypedSocket } from "../server";

/**
 * Match handlers for host-controlled game flow (continue/stop between rounds)
 * Note: game:end-round is now handled in game.ts to avoid conflicts
 */
export function registerMatchHandlers(io: TypedServer, socket: TypedSocket) {
  // REMOVED: game:end-round handler (now in game.ts to avoid duplicate handlers)

  socket.on("round:host-continue", async () => {
    try {
      const room = stateManager.getRoomByPlayer(socket.userId);
      if (!room || room.hostId !== socket.userId) {
        socket.emit("game:invalid-action", {
          message: "Only host can continue",
        });
        return;
      }

      const state = stateManager.getGameState(room.code);
      if (!state || state.roundPhase !== RoundPhase.END_TURN) {
        socket.emit("game:invalid-action", { message: "Invalid state" });
        return;
      }

      const hasWinner = state.players.some((p) => p.score >= state.targetScore);
      if (hasWinner) {
        socket.emit("game:invalid-action", {
          message: "Game already won",
        });
        return;
      }

      const newState = await engine.resetForNextRound(state);
      stateManager.updateGameState(room.code, () => newState);

      io.to(room.code).emit("round:continue-requested");
      io.to(room.code).emit("game:state-update", { gameState: newState });
    } catch (error) {
      console.error("Error continuing round:", error);
      socket.emit("game:invalid-action", { message: "Failed to continue" });
    }
  });

  socket.on("round:host-stop", async () => {
    try {
      const room = stateManager.getRoomByPlayer(socket.userId);
      if (!room || room.hostId !== socket.userId) {
        socket.emit("game:invalid-action", { message: "Only host can stop" });
        return;
      }

      const state = stateManager.getGameState(room.code);
      if (!state) return;

      const winner = state.players.reduce((prev, current) =>
        current.score > prev.score ? current : prev,
      );

      // Save game result and end game
      await handleHostStopGameEnd(io, room.code, winner.userId);
    } catch (error) {
      console.error("Error stopping game:", error);
      socket.emit("game:invalid-action", { message: "Failed to stop" });
    }
  });
}

/**
 * Helper function to handle game end when host manually stops the game
 */
async function handleHostStopGameEnd(
  io: TypedServer,
  roomCode: string,
  winnerId: PlayerId,
) {
  const state = stateManager.getGameState(roomCode);
  if (!state) return;

  const finalScores: Record<string, number> = {};
  for (const player of state.players) {
    finalScores[player.userId] = player.score;
  }

  // Save game result to database if exactly 2 players
  if (state.players.length === 2) {
    try {
      await prisma.gameResult.create({
        data: {
          player1Id: state.players[0].userId,
          player2Id: state.players[1].userId,
          winnerId,
          player1Score: state.players[0].score,
          player2Score: state.players[1].score,
          durationSeconds: Math.floor(
            (Date.now() - (state.startedAt || Date.now())) / 1000,
          ),
          reason: "host_stopped",
        },
      });
    } catch (error) {
      console.error("Error saving game result:", error);
    }
  }

  // Emit game ended event
  io.to(roomCode).emit("game:ended", { winnerId, finalScores });

  // Cleanup: remove all players from room
  for (const player of state.players) {
    stateManager.leaveRoom(player.userId);
  }
}
