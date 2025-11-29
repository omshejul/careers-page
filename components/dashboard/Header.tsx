"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PiSignOut, PiUser, PiSquaresFour } from "react-icons/pi";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  companySlug?: string;
  companyName?: string;
  companyLogo?: string;
}

export function Header({
  user,
  companySlug,
  companyName,
  companyLogo,
}: HeaderProps) {
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "??";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        {companySlug && (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation"
                >
                  <PiSquaresFour className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xs p-0">
                <Sidebar
                  companySlug={companySlug}
                  companyName={companyName}
                  companyLogo={companyLogo}
                />
              </DialogContent>
            </Dialog>

            {companyName && (
              <div className="flex items-center gap-2 md:hidden">
                {companyLogo ? (
                  <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-md">
                    <img
                      src={companyLogo}
                      alt={companyName}
                      className="h-8 w-8 object-cover"
                    />
                  </span>
                ) : null}
                <span className="max-w-[200px] truncate text-sm font-medium">
                  {companyName}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button className="w-full cursor-pointer">
                <PiUser className="mr-1 h-4 w-4" />
                <span>Profile</span>
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <PiSignOut className="mr-1 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
