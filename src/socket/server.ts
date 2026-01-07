import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/game";
import { registerGameHandlers } from "./handlers/game";
import { registerMatchHandlers } from "./handlers/match";
import { registerRoomHandlers } from "./handlers/room";

export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents> & {
  userId: string;
  userName: string;
};

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function setupSocketHandlers(io: TypedServer) {
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth.userId;
      const userName = socket.handshake.auth.userName;

      if (!userId) {
        return next(new Error("Authentication required"));
      }

      (socket as TypedSocket).userId = userId;
      (socket as TypedSocket).userName = userName || "Anonyme";

      next();
    } catch (error) {
      console.error("Socket auth error:", error);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const typedSocket = socket as TypedSocket;
    console.log(
      `User connected: ${typedSocket.userName} (${typedSocket.userId})`,
    );

    registerRoomHandlers(io, typedSocket);
    registerGameHandlers(io, typedSocket);
    registerMatchHandlers(io, typedSocket);

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${typedSocket.userName} (${reason})`);
    });
  });
}
