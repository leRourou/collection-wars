"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UsernameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername?: string | null;
  onSuccess: (username: string) => void;
  required?: boolean;
}

export function UsernameModal({
  open,
  onOpenChange,
  currentUsername,
  onSuccess,
  required = false,
}: UsernameModalProps) {
  const [username, setUsername] = useState(currentUsername || "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();

    // Validation côté client
    if (trimmedUsername.length < 5 || trimmedUsername.length > 20) {
      setError("Le pseudonyme doit contenir entre 5 et 20 caractères");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: trimmedUsername }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        setIsLoading(false);
        return;
      }

      onSuccess(data.username);
      onOpenChange(false);
      setUsername("");
    } catch (err) {
      console.error("Error updating username:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!required) {
      onOpenChange(false);
      setUsername(currentUsername || "");
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={required ? undefined : onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => {
          if (required) e.preventDefault();
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {currentUsername
                ? "Modifier votre pseudonyme"
                : "Choisissez votre pseudonyme"}
            </DialogTitle>
            <DialogDescription>
              {required
                ? "Vous devez choisir un pseudonyme pour continuer. Il sera affiché dans le jeu (5 à 20 caractères)."
                : "Votre pseudonyme sera affiché dans le jeu (5 à 20 caractères)."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Pseudonyme</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez votre pseudonyme"
                minLength={5}
                maxLength={20}
                required
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                {username.length}/20 caractères
              </p>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            {!required && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Enregistrement..."
                : currentUsername
                  ? "Modifier"
                  : "Continuer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
