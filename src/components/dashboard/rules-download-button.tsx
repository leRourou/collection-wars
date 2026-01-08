"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RulesDownloadButton() {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "https://cdn.1j1ju.com/medias/fb/b7/b4-sea-salt-paper-regle.pdf";
    link.download = "Regles_Sea_Salt_Paper.pdf";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      className="gap-2 h-full min-w-[140px]"
    >
      <Download className="h-4 w-4" />
      Règles
    </Button>
  );
}
