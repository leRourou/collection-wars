"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useSession } from "@/lib/auth/auth-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/game";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

export function useSocket() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      if (socket) {
        socket.disconnect();
        socket = null;
        setIsConnected(false);
      }
      return;
    }

    if (!socket) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
        (typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3001");

      socket = io(socketUrl, {
        auth: {
          userId: session.user.id,
          userName: session.user.username || session.user.email,
        },
      });

      socket.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
      });
    } else if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      // Keep connection alive on component unmount
    };
  }, [session]);

  return { socket, isConnected };
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
