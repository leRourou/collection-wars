import { stateManager } from "@/lib/game/state-manager";
import type { TypedServer, TypedSocket } from "../server";

export function registerRoomHandlers(io: TypedServer, socket: TypedSocket) {
  socket.on("room:create", ({ maxPlayers }) => {
    try {
      stateManager.setPlayerName(socket.userId, socket.userName);
      const roomCode = stateManager.createRoom(socket.userId, maxPlayers);
      const room = stateManager.getRoom(roomCode);

      if (!room) {
        socket.emit("room:error", { message: "Room creation failed" });
        return;
      }

      socket.join(roomCode);
      socket.emit("room:created", { roomCode });
      socket.emit("room:joined", { room });

      console.log(`Room created: ${roomCode} by ${socket.userName}`);
    } catch (error) {
      console.error("Error creating room:", error);
      socket.emit("room:error", { message: "Failed to create room" });
    }
  });

  socket.on("room:join", ({ roomCode }) => {
    try {
      stateManager.setPlayerName(socket.userId, socket.userName);
      const success = stateManager.joinRoom(roomCode, socket.userId);

      if (!success) {
        socket.emit("room:error", { message: "Cannot join room" });
        return;
      }

      const room = stateManager.getRoom(roomCode);

      if (!room) {
        socket.emit("room:error", { message: "Room not found" });
        return;
      }

      socket.join(roomCode);
      socket.emit("room:joined", { room });

      io.to(roomCode).emit("room:player-joined", {
        playerId: socket.userId,
        playerName: socket.userName,
        room,
      });

      console.log(`${socket.userName} joined room ${roomCode}`);
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("room:error", { message: "Failed to join room" });
    }
  });

  socket.on("room:leave", () => {
    try {
      const roomCode = stateManager.leaveRoom(socket.userId);

      if (!roomCode) return;

      socket.leave(roomCode);
      socket.to(roomCode).emit("room:player-left", { playerId: socket.userId });

      console.log(`${socket.userName} left room ${roomCode}`);
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  });

  socket.on("room:get-info", ({ roomCode }) => {
    try {
      const room = stateManager.getRoom(roomCode);

      if (!room) {
        socket.emit("room:error", { message: "Room not found" });
        return;
      }

      socket.emit("room:info", { room });
    } catch (error) {
      console.error("Error getting room info:", error);
      socket.emit("room:error", { message: "Failed to get room info" });
    }
  });

  socket.on("room:start-game", async () => {
    try {
      const room = stateManager.getRoomByPlayer(socket.userId);

      if (!room || room.hostId !== socket.userId) {
        socket.emit("room:error", { message: "Only host can start game" });
        return;
      }

      if (room.players.length < 2) {
        socket.emit("room:error", { message: "Need at least 2 players" });
        return;
      }

      room.status = "playing";
      const gameState = await stateManager.createGameState(room);

      io.to(room.code).emit("game:started", { gameState });

      console.log(`Game started in room ${room.code}`);
    } catch (error) {
      console.error("Error starting game:", error);
      socket.emit("room:error", { message: "Failed to start game" });
    }
  });
}
