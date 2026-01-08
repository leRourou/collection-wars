"use client";

import { BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import type { PlayerStats as PlayerStatsType } from "@/app/api/user/stats/route";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatItem } from "./stat-item";

export function PlayerStats() {
  const [stats, setStats] = useState<PlayerStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/user/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch player stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <Card className="flex-1">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Statistiques</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 gap-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              <StatItem value={stats?.totalPoints ?? 0} label="Points totaux" />
              <StatItem value={stats?.gamesPlayed ?? 0} label="Parties jouées" />
              <StatItem value={`${stats?.winRate ?? 0}%`} label="Victoires" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
