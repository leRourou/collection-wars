import { Calendar, Clock, Minus, Skull, Trophy, User } from "lucide-react";
import {
  formatDuration,
  formatRelativeDate,
  translateEndReason,
} from "@/lib/utils";
import type { GameHistoryItem as GameHistoryItemType } from "@/types/game-history";

interface GameHistoryItemProps {
  game: GameHistoryItemType;
}

export function GameHistoryItem({ game }: GameHistoryItemProps) {
  const resultConfig = {
    win: {
      styles:
        "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 hover:border-green-500/50",
      badgeStyles: "bg-green-500 text-white",
      label: "Victoire",
      icon: Trophy,
      scoreColor: "text-green-600",
    },
    loss: {
      styles:
        "bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-500/30 hover:border-red-500/50",
      badgeStyles: "bg-red-500 text-white",
      label: "Défaite",
      icon: Skull,
      scoreColor: "text-red-600",
    },
    draw: {
      styles:
        "bg-gradient-to-r from-gray-500/10 to-slate-500/10 border-gray-500/30 hover:border-gray-500/50",
      badgeStyles: "bg-gray-500 text-white",
      label: "Égalité",
      icon: Minus,
      scoreColor: "text-gray-600",
    },
  };

  const config = resultConfig[game.result];
  const Icon = config.icon;

  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-200 ${config.styles}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-700/80 flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-base text-gray-900 dark:text-gray-100">
              {game.opponentName}
            </p>
            <div
              className={`flex items-center gap-2 text-sm font-medium mt-0.5 ${config.scoreColor}`}
            >
              <span className="font-bold text-lg">{game.currentUserScore}</span>
              <span className="text-gray-400 dark:text-gray-500">-</span>
              <span className="font-bold text-lg opacity-60">
                {game.opponentScore}
              </span>
            </div>
          </div>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${config.badgeStyles} shadow-sm`}
        >
          <Icon className="w-3.5 h-3.5" />
          {config.label}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDuration(game.durationSeconds)}</span>
        </div>
        <span className="text-gray-300 dark:text-gray-600">•</span>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatRelativeDate(new Date(game.endedAt))}</span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          {translateEndReason(game.reason)}
        </p>
      </div>
    </div>
  );
}
