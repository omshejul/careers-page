"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { PiSignOut } from "react-icons/pi";

export function LogoutButton() {
    return (
        <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={() => signOut({ callbackUrl: "/" })}
        >
            <PiSignOut className="mr-2 h-4 w-4" />
            Log Out
        </Button>
    );
}
