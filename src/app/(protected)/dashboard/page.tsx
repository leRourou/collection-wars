"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { GameHistoryList } from "@/components/game-history/game-history-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FloatingCardsBackground } from "@/components/ui/floating-cards-background";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { UsernameModal } from "@/components/username-modal";
import { useSocket } from "@/hooks/use-socket";
import { useSession } from "@/lib/auth/auth-client";
import { useGameStore } from "@/store/game-store";

export default function DashboardPage() {
  const { data: session, status, update } = useSession();
  const { socket, isConnected } = useSocket();
  const { setCurrentRoom } = useGameStore();
  const router = useRouter();

  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);

  const isLoading = status === "loading";
  const hasUsername = !!session?.user?.username;

  // Afficher le modal de configuration du username si nécessaire
  useEffect(() => {
    if (!isLoading && session && !hasUsername) {
      setIsUsernameModalOpen(true);
    }
  }, [isLoading, session, hasUsername]);

  const handleUsernameSuccess = async (newUsername: string) => {
    // Mettre à jour la session avec le nouveau username
    await update({ username: newUsername });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("room:created", ({ roomCode }) => {
      console.log("Room created:", roomCode);
      setIsCreating(false);
    });

    socket.on("room:joined", ({ room }) => {
      console.log("Room joined:", room);
      setCurrentRoom(room);
      setIsJoining(false);
      router.push(`/lobby/${room.code}`);
    });

    socket.on("room:error", ({ message }) => {
      setError(message);
      setIsCreating(false);
      setIsJoining(false);
    });

    return () => {
      socket.off("room:created");
      socket.off("room:joined");
      socket.off("room:error");
    };
  }, [socket, router, setCurrentRoom]);

  const handleCreateRoom = () => {
    if (!socket || !hasUsername) return;
    setIsCreating(true);
    setError(null);
    socket.emit("room:create", { maxPlayers: 2 });
  };

  const handleJoinRoom = () => {
    if (!socket || roomCode.length !== 5 || !hasUsername) return;
    setIsJoining(true);
    setError(null);
    socket.emit("room:join", { roomCode });
  };

  if (isLoading || !isConnected) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <FloatingCardsBackground />
      <UsernameModal
        open={isUsernameModalOpen}
        onOpenChange={setIsUsernameModalOpen}
        currentUsername={session.user?.username}
        onSuccess={handleUsernameSuccess}
        required={!hasUsername}
      />

      <div className="flex flex-col items-center w-6xl mx-auto mt-8 gap-6 relative z-10">
        <DashboardHeader />

        {!hasUsername && (
          <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-600 px-4 py-2 rounded">
            Veuillez configurer votre pseudonyme pour accéder aux
            fonctionnalités du jeu.
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Lancer une partie</CardTitle>
            <CardDescription>
              Rejoignez une partie existante en spécifiant le code de la salle:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InputOTP
              maxLength={5}
              value={roomCode}
              onChange={setRoomCode}
              disabled={!hasUsername}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
              </InputOTPGroup>
            </InputOTP>
          </CardContent>
          <CardFooter className="gap-2">
            <Button
              onClick={handleJoinRoom}
              disabled={roomCode.length !== 5 || isJoining || !hasUsername}
            >
              {isJoining ? "Connexion..." : "Rejoindre la partie"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCreateRoom}
              disabled={isCreating || !hasUsername}
            >
              {isCreating ? "Création..." : "Créer une nouvelle partie"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Historique de parties</CardTitle>
          </CardHeader>
          <CardContent>
            <GameHistoryList />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
