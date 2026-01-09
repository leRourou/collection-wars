"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FloatingCardsBackground } from "@/components/ui/floating-cards-background";
import { Spinner } from "@/components/ui/spinner";
import { useSocket } from "@/hooks/use-socket";
import { useSession } from "@/lib/auth/auth-client";
import { useGameStore } from "@/store/game-store";
import type { GameState } from "@/types/game";

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  const { currentRoom, setCurrentRoom, setGameState } = useGameStore();

  const roomCode = params.code as string;

  useEffect(() => {
    if (!socket || !isConnected) return;

    if (!currentRoom) {
      console.log("Requesting room info for:", roomCode);
      socket.emit("room:get-info", { roomCode });
    }
  }, [socket, isConnected, roomCode, currentRoom]);

  useEffect(() => {
    if (!socket) return;

    const handleRoomInfo = ({ room }: { room: typeof currentRoom }) => {
      console.log("Received room info:", room);
      setCurrentRoom(room);
    };

    const handlePlayerJoined = ({
      playerName,
      room,
    }: {
      playerId: string;
      playerName: string;
      room: typeof currentRoom;
    }) => {
      console.log(`${playerName} joined`);
      if (room) {
        setCurrentRoom(room);
      }
    };

    const handleGameStarted = ({ gameState }: { gameState: GameState }) => {
      console.log("Game started, navigating to game page");
      setGameState(gameState);
      router.push(`/game/${roomCode}`);
    };

    const handleRoomError = ({ message }: { message: string }) => {
      console.error("Room error:", message);
      router.push("/dashboard");
    };

    socket.on("room:info", handleRoomInfo);
    socket.on("room:player-joined", handlePlayerJoined);
    socket.on("game:started", handleGameStarted);
    socket.on("room:error", handleRoomError);

    return () => {
      socket.off("room:info", handleRoomInfo);
      socket.off("room:player-joined", handlePlayerJoined);
      socket.off("game:started", handleGameStarted);
      socket.off("room:error", handleRoomError);
    };
  }, [socket, router, roomCode, setGameState, setCurrentRoom]);

  const handleStartGame = () => {
    if (!socket) return;
    socket.emit("room:start-game");
  };

  if (!isConnected || !currentRoom) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const isHost = currentRoom.hostId === session?.user?.id;

  return (
    <>
      <FloatingCardsBackground />
      <div className="flex flex-col items-center justify-center min-h-screen p-8 relative z-10">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Salle: {roomCode}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  Joueurs ({currentRoom.players.length}/{currentRoom.maxPlayers}
                  )
                </h3>
                <ul className="space-y-2">
                  {currentRoom.players.map((playerId) => {
                    const playerName =
                      currentRoom.playerNames?.[playerId] || "Joueur";
                    const initials = playerName.slice(0, 2).toUpperCase();

                    return (
                      <li key={playerId} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          {initials}
                        </div>
                        <span>
                          {playerName}
                          {playerId === currentRoom.hostId && (
                            <span className="text-xs text-gray-500 ml-2">
                              (Hôte)
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {isHost && (
                <Button
                  onClick={handleStartGame}
                  disabled={currentRoom.players.length < 2}
                  className="w-full"
                >
                  Démarrer la partie
                </Button>
              )}

              {!isHost && (
                <p className="text-center text-gray-500">
                  En attente de l'hôte...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
