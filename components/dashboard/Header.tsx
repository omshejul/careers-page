"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer when pathname changes (page loads)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        {companySlug && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
              onClick={() => setIsOpen(true)}
            >
              <PiSquaresFour className="h-5 w-5" />
            </Button>

            {/* Slide-in drawer */}
            <AnimatePresence>
              {isOpen && (
                <>
                  {/* Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 bg-black/50 md:hidden"
                    onClick={() => setIsOpen(false)}
                  />
                  {/* Drawer */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{
                      type: "tween",
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                    className="fixed left-0 top-0 z-50 h-full w-[280px] bg-background shadow-lg md:hidden"
                  >
                    <Sidebar
                      companySlug={companySlug}
                      companyName={companyName}
                      companyLogo={companyLogo}
                      onClose={() => setIsOpen(false)}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

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
              <Link href="/profile" className="w-full cursor-pointer">
                <PiUser className="mr-1 h-4 w-4" />
                <span>Profile</span>
              </Link>
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
