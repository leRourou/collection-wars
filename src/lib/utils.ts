import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Génère les initiales d'un nom d'utilisateur
 * Prend les 2 premiers caractères en majuscules
 */
export function getUserInitials(username: string | null | undefined): string {
  if (!username) return "??";
  return username.slice(0, 2).toUpperCase();
}

/**
 * Formate une durée en secondes vers un format lisible
 * Exemples: "5m 32s", "1h 15m", "42s"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

/**
 * Formate une date en format relatif ou absolu
 * Relatif pour les dates récentes (< 7 jours)
 * Absolu pour les dates plus anciennes
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60)
    return `Il y a ${diffMins} minute${diffMins > 1 ? "s" : ""}`;
  if (diffHours < 24)
    return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Traduit les raisons de fin de partie en français
 */
export function translateEndReason(reason: string): string {
  const translations: Record<string, string> = {
    score_reached: "Score atteint",
    immediate_win: "Victoire immédiate (4 sirènes)",
    host_stopped: "Partie arrêtée par l'hôte",
  };
  return translations[reason] || reason;
}
