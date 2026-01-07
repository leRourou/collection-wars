"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UsernameModal } from "@/components/username-modal";
import { useCurrentUser } from "@/hooks";
import { getUserInitials } from "@/lib/utils";

const LoginButton = () => {
  const user = useCurrentUser();
  const { update } = useSession();
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);

  const onSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleUsernameSuccess = async (newUsername: string) => {
    // Mettre à jour la session avec le nouveau username
    await update({ username: newUsername });
  };

  if (user) {
    return (
      <>
        <Popover>
          <PopoverTrigger>
            <Avatar>
              <AvatarFallback>{getUserInitials(user.username)}</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {user.username || "Aucun pseudonyme"}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsUsernameModalOpen(true)}
                >
                  Modifier le pseudonyme
                </Button>
                <Button size="sm" variant="destructive" onClick={onSignOut}>
                  Se déconnecter
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <UsernameModal
          open={isUsernameModalOpen}
          onOpenChange={setIsUsernameModalOpen}
          currentUsername={user.username}
          onSuccess={handleUsernameSuccess}
        />
      </>
    );
  }

  return (
    <Link href="/login" className="mr-4">
      <Button size="sm">Se connecter</Button>
    </Link>
  );
};

export default LoginButton;
