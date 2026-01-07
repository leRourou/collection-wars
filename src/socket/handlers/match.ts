import * as engine from "@/lib/game/game-engine";
import { calculateScore, hasWinningCondition } from "@/lib/game/scoring";
import { stateManager } from "@/lib/game/state-manager";
import { prisma } from "@/lib/prisma";
import type { GameEndReason, GameState, PlayerId } from "@/types/game";
import { EndRoundChoice, RoundPhase } from "@/types/game";
import type { TypedServer, TypedSocket } from "../server";

export function registerMatchHandlers(io: TypedServer, socket: TypedSocket) {
  socket.on("game:end-round", async ({ choice }) => {
    try {
      const room = stateManager.getRoomByPlayer(socket.userId);
      if (!room) return;

      const state = stateManager.getGameState(room.code);
      if (!state) return;

      const currentPlayer = state.players[state.currentPlayerIndex];
      if (currentPlayer.userId !== socket.userId) {
        socket.emit("game:invalid-action", { message: "Not your turn" });
        return;
      }

      if (hasWinningCondition(currentPlayer)) {
        await handleGameEnd(io, room.code, socket.userId, "immediate_win");
        return;
      }

      const currentPoints = calculateScore(currentPlayer);
      if (currentPoints < 7) {
        socket.emit("game:invalid-action", {
          message: "Need at least 7 points",
        });
        return;
      }

      state.roundEnder = socket.userId;
      state.endChoice = choice;

      if (choice === EndRoundChoice.STOP) {
        await handleRoundEndStop(io, state);
      } else {
        state.lastChancePlayed = [socket.userId];
        stateManager.updateGameState(room.code, () => state);
        io.to(room.code).emit("game:state-update", { gameState: state });
      }
    } catch (error) {
      console.error("Error ending round:", error);
      socket.emit("game:invalid-action", { message: "Failed to end round" });
    }
  });

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

      const newState = engine.resetForNextRound(state);
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

      await handleGameEnd(io, room.code, winner.userId, "host_stopped");
    } catch (error) {
      console.error("Error stopping game:", error);
      socket.emit("game:invalid-action", { message: "Failed to stop" });
    }
  });
}

async function handleRoundEndStop(io: TypedServer, state: GameState) {
  const scores: Record<string, number> = {};

  for (const player of state.players) {
    const points = calculateScore(player);
    player.score += points;
    scores[player.userId] = points;
  }

  const winner = state.players.find((p) => p.score >= state.targetScore);

  if (winner) {
    await handleGameEnd(io, state.roomCode, winner.userId, "score_reached");
  } else {
    state.roundNumber++;
    io.to(state.roomCode).emit("round:ended", { scores, gameState: state });
  }
}

async function handleGameEnd(
  io: TypedServer,
  roomCode: string,
  winnerId: PlayerId,
  reason: GameEndReason,
) {
  const state = stateManager.getGameState(roomCode);
  if (!state) return;

  const finalScores: Record<string, number> = {};
  for (const player of state.players) {
    finalScores[player.userId] = player.score;
  }

  if (state.players.length === 2) {
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
        reason,
      },
    });
  }

  io.to(roomCode).emit("game:ended", { winnerId, finalScores });

  for (const player of state.players) {
    stateManager.leaveRoom(player.userId);
  }
}
