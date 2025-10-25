"use client";

import { GameBoard } from "@/components/game/game-board";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";

  useEffect(() => {
    console.log("Session status:", session);
    // Rediriger vers /login si non authentifié
    if (!isLoading && !session) {
      router.push("/login");
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return (
      <div className="font-sans flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="font-sans flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <GameBoard />
      </div>
    );
  }

  // Afficher un état de chargement pendant la redirection
  return (
    <div className="font-sans flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="text-white">Redirection...</div>
    </div>
  );
}
