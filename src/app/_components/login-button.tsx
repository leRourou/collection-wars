"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useCurrentUser } from "@/hooks";
import { signOut } from "next-auth/react";
import Link from "next/link";

const LoginButton = () => {
    const user = useCurrentUser();

    const onSignOut = () => {
        signOut({ callbackUrl: "/" });
    };

    if (user) {
        return (
            <Popover>
                <PopoverTrigger>
                    <Avatar>
                        <AvatarFallback>AR</AvatarFallback>
                    </Avatar>
                </PopoverTrigger>
                <PopoverContent>
                    <p className="mb-2">
                        Connecté en tant que {user.email}
                    </p>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={onSignOut}
                    >
                        Se déconnecter
                    </Button>
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Link href="/login" className="mr-4">
            <Button size="sm">Se connecter</Button>
        </Link>
    );
};

export default LoginButton;
