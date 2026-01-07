import * as engine from "@/lib/game/game-engine";
import {
  applySharkSwimmerEffect,
  applyCrabEffect,
  applyFishEffect,
  getDuoEffectType,
} from "@/lib/game/duo-effects";
import { calculateRoundScores } from "@/lib/game/round-scoring";
import { hasWinningCondition } from "@/lib/game/scoring";
import { stateManager } from "@/lib/game/state-manager";
import { prisma } from "@/lib/prisma";
import type { GameEndReason, PlayerId } from "@/types/game";
import type { TypedServer, TypedSocket } from "../server";

export function registerGameHandlers(io: TypedServer, socket: TypedSocket) {
  socket.on("game:get-state", ({ roomCode }) => {
    try {
      const state = stateManager.getGameState(roomCode);
      if (!state) {
        socket.emit("game:invalid-action", { message: "Game not found" });
        return;
      }

      socket.emit("game:state-update", { gameState: state });
    } catch (error) {
      console.error("Error getting game state:", error);
      socket.emit("game:invalid-action", {
        message: "Failed to get game state",
      });
    }
  });

  socket.on("game:draw-from-deck", async () => {
    try {
      const room = stateManager.getRoomByPlayer(socket.userId);
      if (!room) {
        console.error("Room not found for user:", socket.userId);
        return;
      }

      const state = stateManager.getGameState(room.code);
      if (!state) {
        console.error("Game state not found for room:", room.code);
        return;
      }

      console.log(
        "Draw from deck - Players:",
        state.players.length,
        "Current index:",
        state.currentPlayerIndex,
      );
      console.log("Current player:", state.players[state.currentPlayerIndex]);

      const currentPlayer = state.players[state.currentPlayerIndex];
      if (!currentPlayer) {
        console.error(
          "Current player undefined at index:",
          state.currentPlayerIndex,
        );
        socket.emit("game:invalid-action", { message: "Invalid game state" });
        return;
      }

      if (currentPlayer.userId !== socket.userId) {
        socket.emit("game:invalid-action", { message: "Not your turn" });
        return;
      }

      if (!engine.canDrawFromDeck(state)) {
        socket.emit("game:invalid-action", {
          message: "Cannot draw from deck",
        });
        return;
      }

      const { state: newState, drawnCards } = engine.drawFromDeck(state);
      stateManager.updateGameState(room.code, () => newState);

      socket.emit("game:cards-drawn", { cards: drawnCards });
      io.to(room.code).emit("game:state-update", { gameState: newState });
    } catch (error) {
      console.error("Error drawing from deck:", error);
      socket.emit("game:invalid-action", { message: "Failed to draw" });
    }
  });

  socket.on("game:draw-from-discard", ({ pileIndex }) => {
    try {
      const room = stateManager.getRoomByPlayer(socket.userId);
      if (!room) return;

      const state = stateManager.getGameState(room.code);
      if (!state) return;

      if (state.players[state.currentPlayerIndex].userId !== socket.userId) {
        socket.emit("game:invalid-action", { message: "Not your turn" });
        return;
      }

      if (!engine.canDrawFromDiscard(state, pileIndex)) {
        socket.emit("game:invalid-action", {
          message: "Cannot draw from discard",
        });
        return;
      }

      const newState = engine.drawFromDiscard(state, pileIndex);
      stateManager.updateGameState(room.code, () => newState);
      io.to(room.code).emit("game:state-update", { gameState: newState });
    } catch (error) {
      console.error("Error drawing from discard:", error);
      socket.emit("game:invalid-action", { message: "Failed to draw" });
    }
  });

  socket.on("game:keep-card", ({ cardId, discardPileIndex }) => {
    try {
      const room = stateManager.getRoomByPlayer(socket.userId);
      if (!room) return;

      const state = stateManager.getGameState(room.code);
      if (!state) return;

      const currentPlayer = state.players[state.currentPlayerIndex];
      if (!currentPlayer || currentPlayer.userId !== socket.userId) {
        socket.emit("game:invalid-action", { message: "Not your turn" });
        return;
      }

      if (!state.drawnCards || state.drawnCards.length !== 2) {
        socket.emit("game:invalid-action", {
          message: "No cards to choose from",
        });
        return;
      }

      const cardToKeep = state.drawnCards.find((c) => c.id === cardId);
      const cardToDiscard = state.drawnCards.find((c) => c.id !== cardId);

      if (!cardToKeep || !cardToDiscard) {
        socket.emit("game:invalid-action", { message: "Invalid card" });
        return;
      }

      const newState = engine.keepCard(
        state,
        cardToKeep,
        cardToDiscard,
        discardPileIndex,
      );
      stateManager.updateGameState(room.code, () => newState);

      io.to(room.code).emit("game:state-update", { gameState: newState });
    } catch (error) {
      console.error("Error keeping card:", error);
      socket.emit("game:invalid-action", { message: "Failed to keep card" });
    }
  });

  socket.on("game:play-duo", ({ cardIds }) => {
    try {
      const room = stateManager.getRoomByPlayer(socket.userId);
      if (!room) return;

      const state = stateManager.getGameState(room.code);
      if (!state) return;

      if (state.players[state.currentPlayerIndex].userId !== socket.userId) {
        socket.emit("game:invalid-action", { message: "Not your turn" });
        return;
      }

      const currentPlayer = state.players[state.currentPlayerIndex];
      const card1 = currentPlayer.hand.find((c) => c.id === cardIds[0]);
      const card2 = currentPlayer.hand.find((c) => c.id === cardIds[1]);

      if (!card1 || !card2 || !engine.canPlayDuo(state, card1, card2)) {
        socket.emit("game:invalid-action", { message: "Invalid duo" });
        return;
      }

      // Play the duo (move cards to playedCards)
      let newState = engine.playDuo(state, cardIds[0], cardIds[1]);

      // Detect effect type
      const effectType = getDuoEffectType(card1, card2);

      if (!effectType) {
        // No effect - pass turn normally
        const finalState = engine.passTurn(newState);
        stateManager.updateGameState(room.code, () => finalState);
        io.to(room.code).emit("game:state-update", { gameState: finalState });
        return;
      }

      // Handle effects based on type
      switch (effectType) {
        case "fish": {
          const result = applyFishEffect(newState);
          if (result.success) {
            const finalState = engine.passTurn(result.state);
            stateManager.updateGameState(room.code, () => finalState);
            io.to(room.code).emit("game:state-update", {
              gameState: finalState,
            });
            io.to(socket.id).emit("effect:executed", {
              effectType: "fish",
              metadata: result.metadata,
            });
          } else {
            const finalState = engine.passTurn(newState);
            stateManager.updateGameState(room.code, () => finalState);
            io.to(room.code).emit("game:state-update", {
              gameState: finalState,
            });
            io.to(socket.id).emit("effect:failed", {
              effectType: "fish",
              reason: "Pioche vide",
            });
          }
          break;
        }

        case "boat": {
          // Replay - don't pass turn
          stateManager.updateGameState(room.code, () => newState);
          io.to(room.code).emit("game:state-update", { gameState: newState });
          io.to(socket.id).emit("effect:executed", {
            effectType: "boat",
            metadata: {},
          });
          break;
        }

        case "crab": {
          // Check if discard piles are empty
          if (
            newState.discardPile1.length === 0 &&
            newState.discardPile2.length === 0
          ) {
            const finalState = engine.passTurn(newState);
            stateManager.updateGameState(room.code, () => finalState);
            io.to(room.code).emit("game:state-update", {
              gameState: finalState,
            });
            io.to(socket.id).emit("effect:failed", {
              effectType: "crab",
              reason: "Défausses vides",
            });
          } else {
            // Multi-step: request pile choice
            newState.pendingEffect = {
              type: "crab",
              playerId: socket.userId,
              duoCards: cardIds,
            };
            stateManager.updateGameState(room.code, () => newState);
            io.to(socket.id).emit("effect:crab-choose-pile");
          }
          break;
        }

        case "shark_swimmer": {
          const opponents = newState.players.filter(
            (p) => p.userId !== socket.userId && p.hand.length > 0,
          );

          if (opponents.length === 0) {
            const finalState = engine.passTurn(newState);
            stateManager.updateGameState(room.code, () => finalState);
            io.to(room.code).emit("game:state-update", {
              gameState: finalState,
            });
            io.to(socket.id).emit("effect:failed", {
              effectType: "shark_swimmer",
              reason: "Aucun adversaire n'a de cartes",
            });
          } else {
            newState.pendingEffect = {
              type: "shark_swimmer",
              playerId: socket.userId,
              duoCards: cardIds,
            };
            stateManager.updateGameState(room.code, () => newState);
            io.to(socket.id).emit("effect:shark-swimmer-choose-target", {
              possibleTargets: opponents.map((p) => ({
                userId: p.userId,
                name: p.name,
                handCount: p.hand.length,
              })),
            });
          }
          break;
        }
      }
    } catch (error) {
      console.error("Error playing duo:", error);
      socket.emit("game:invalid-action", { message: "Failed to play duo" });
    }
  });

  socket.on("game:pass-turn", () => {
    try {
      const room = stateManager.getRoomByPlayer(socket.userId);
      if (!room) return;

      const state = stateManager.getGameState(room.code);
      if (!state) return;

      if (state.players[state.currentPlayerIndex].userId !== socket.userId) {
        socket.emit("game:invalid-action", { message: "Not your turn" });
        return;
      }

      const newState = engine.passTurn(state);
      stateManager.updateGameState(room.code, () => newState);

      io.to(room.code).emit("game:state-update", { gameState: newState });
    } catch (error) {
      console.error("Error passing turn:", error);
    }
  });

  // Duo effect handlers
  socket.on("effect:crab-select-pile", ({ pileIndex }) => {
    try {
      const room = stateManager.getRoomByPlayer(socket.userId);
      if (!room) return;

      const state = stateManager.getGameState(room.code);
      if (!state || !state.pendingEffect) return;

      if (
        state.pendingEffect.playerId !== socket.userId ||
        state.pendingEffect.type !== "crab"
      ) {
        socket.emit("game:invalid-action", { message: "Invalid effect state" });
        return;
      }

      const pile = pileIndex === 1 ? state.discardPile1 : state.discardPile2;

      if (pile.length === 0) {
        socket.emit("effect:failed", {
          effectType: "crab",
          reason: "Défausse vide",
        });
        return;
      }

      // Send the cards from the pile
      io.to(socket.id).emit("effect:crab-show-cards", {
        pileIndex,
        cards: pile,
      });
    } catch (error) {
      console.error("Error in crab pile selection:", error);
    }
  });

  socket.on("effect:crab-select-card", ({ cardId, pileIndex }) => {
    try {
      const room = stateManager.getRoomByPlayer(socket.userId);
      if (!room) return;

      const state = stateManager.getGameState(room.code);
      if (!state || !state.pendingEffect) return;

      if (
        state.pendingEffect.playerId !== socket.userId ||
        state.pendingEffect.type !== "crab"
      ) {
        socket.emit("game:invalid-action", { message: "Invalid effect state" });
        return;
      }

      const result = applyCrabEffect(state, cardId, pileIndex);

      if (result.success) {
        delete result.state.pendingEffect;
        const finalState = engine.passTurn(result.state);
        stateManager.updateGameState(room.code, () => finalState);
        io.to(room.code).emit("game:state-update", { gameState: finalState });
        io.to(socket.id).emit("effect:executed", {
          effectType: "crab",
          metadata: result.metadata,
        });
      } else {
        socket.emit("effect:failed", {
          effectType: "crab",
          reason: "Carte invalide",
        });
      }
    } catch (error) {
      console.error("Error in crab card selection:", error);
    }
  });

  socket.on("effect:shark-swimmer-select-target", ({ targetPlayerId }) => {
    try {
      const room = stateManager.getRoomByPlayer(socket.userId);
      if (!room) return;

      const state = stateManager.getGameState(room.code);
      if (!state || !state.pendingEffect) return;

      if (
        state.pendingEffect.playerId !== socket.userId ||
        state.pendingEffect.type !== "shark_swimmer"
      ) {
        socket.emit("game:invalid-action", { message: "Invalid effect state" });
        return;
      }

      const result = applySharkSwimmerEffect(state, targetPlayerId);

      if (result.success) {
        delete result.state.pendingEffect;
        const finalState = engine.passTurn(result.state);
        stateManager.updateGameState(room.code, () => finalState);
        io.to(room.code).emit("game:state-update", { gameState: finalState });
        io.to(socket.id).emit("effect:executed", {
          effectType: "shark_swimmer",
          metadata: result.metadata,
        });
      } else {
        socket.emit("effect:failed", {
          effectType: "shark_swimmer",
          reason: "Cible invalide ou sans cartes",
        });
      }
    } catch (error) {
      console.error("Error in shark/swimmer effect:", error);
    }
  });

  socket.on("game:end-round", async ({ choice }) => {
    try {
      const room = stateManager.getRoomByPlayer(socket.userId);
      if (!room) return;

      const state = stateManager.getGameState(room.code);
      if (!state) return;

      const currentPlayer = state.players[state.currentPlayerIndex];
      if (!currentPlayer || currentPlayer.userId !== socket.userId) {
        socket.emit("game:invalid-action", { message: "Not your turn" });
        return;
      }

      // Check for immediate win condition (4 sirens)
      if (hasWinningCondition(currentPlayer)) {
        await handleGameEnd(io, room.code, socket.userId, "immediate_win");
        return;
      }

      // Check minimum 7 points to end round
      if (!engine.canEndRound(state, socket.userId)) {
        socket.emit("game:invalid-action", {
          message: "Cannot end round - need at least 7 points",
        });
        return;
      }

      const newState = engine.endRound(state, socket.userId, choice);
      stateManager.updateGameState(room.code, () => newState);

      io.to(room.code).emit("game:state-update", { gameState: newState });

      // Calculate round scores
      const roundResult = calculateRoundScores(newState);

      if (roundResult) {
        // Update player scores
        const updatedState = {
          ...newState,
          players: newState.players.map((player) => {
            const scoreInfo = roundResult.playerScores.find(
              (s) => s.userId === player.userId,
            );
            return scoreInfo
              ? { ...player, score: player.score + scoreInfo.totalPoints }
              : player;
          }),
        };

        stateManager.updateGameState(room.code, () => updatedState);

        // Check if someone won by reaching target score
        const winner = updatedState.players.find(
          (p) => p.score >= updatedState.targetScore,
        );

        if (winner) {
          // Game won by score - save to DB and emit game:ended
          await handleGameEnd(io, room.code, winner.userId, "score_reached");
        } else {
          // Round ended but game continues - emit round:ended
          io.to(room.code).emit("round:ended", {
            scores: roundResult.playerScores.reduce(
              (acc, s) => {
                acc[s.userId] = s.totalPoints;
                return acc;
              },
              {} as Record<string, number>,
            ),
            gameState: updatedState,
            roundResult,
          });
        }
      }
    } catch (error) {
      console.error("Error ending round:", error);
      socket.emit("game:invalid-action", {
        message: "Failed to end round",
      });
    }
  });
}

/**
 * Helper function to handle game end (victory)
 * Saves game result to database and emits game:ended event
 */
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
          reason,
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
