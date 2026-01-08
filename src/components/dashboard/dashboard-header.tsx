import { PlayerStats } from "./player-stats";
import { RulesDownloadButton } from "./rules-download-button";

export function DashboardHeader() {
  return (
    <div className="flex gap-4 w-full">
      <PlayerStats />
      <RulesDownloadButton />
    </div>
  );
}
