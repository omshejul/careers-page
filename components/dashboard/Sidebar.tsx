"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  PiSquaresFour,
  PiBriefcase,
  PiFileText,
  PiGear,
  PiBuildings,
  PiArrowLeft,
  PiSpinner,
  PiX,
} from "react-icons/pi";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  companySlug?: string;
  companyName?: string;
  companyLogo?: string;
  onClose?: () => void;
}

export function Sidebar({
  companySlug,
  companyName,
  companyLogo,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingHref, setLoadingHref] = useState<string | null>(null);

  const handleNavClick = (
    href: string,
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    if (pathname === href) {
      return;
    }
    setLoadingHref(href);
    router.push(href);
  };

  // Clear loading state when pathname changes (navigation completes)
  useEffect(() => {
    setLoadingHref(null);
  }, [pathname]);

  const mainNavItems = companySlug
    ? [] // Hide main nav when in company context
    : [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: PiSquaresFour,
        },
      ];

  const companyNavItems = companySlug
    ? [
        {
          title: "Back to Dashboard",
          href: "/dashboard",
          icon: PiArrowLeft,
        },
        {
          title: "Overview",
          href: `/${companySlug}/overview`,
          icon: PiBuildings,
        },
        {
          title: "Builder",
          href: `/${companySlug}/builder`,
          icon: PiSquaresFour,
        },
        {
          title: "Jobs",
          href: `/${companySlug}/jobs`,
          icon: PiBriefcase,
        },
        {
          title: "Applications",
          href: `/${companySlug}/applications`,
          icon: PiFileText,
        },
        {
          title: "Settings",
          href: `/${companySlug}/settings`,
          icon: PiGear,
        },
      ]
    : [];

  return (
    <div className="flex h-full flex-col border-r bg-muted/40">
      <div className="flex h-16 items-center justify-between border-b px-6">
        {companySlug && companyName ? (
          <Link
            href={`/${companySlug}/overview`}
            onClick={(e) => handleNavClick(`/${companySlug}/overview`, e)}
            className={cn(
              "flex items-center gap-2 font-semibold",
              loadingHref === `/${companySlug}/overview` &&
                "pointer-events-none opacity-70"
            )}
          >
            {loadingHref === `/${companySlug}/overview` ? (
              <PiSpinner className="h-6 w-6 animate-spin" />
            ) : companyLogo ? (
              <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-md">
                <img
                  src={companyLogo}
                  alt={companyName}
                  className="h-8 w-8 object-cover"
                />
              </span>
            ) : (
              <PiBuildings className="h-6 w-6" />
            )}
            <span className="max-w-[140px] truncate text-sm font-semibold">
              {companyName}
            </span>
          </Link>
        ) : (
          <Link
            href="/dashboard"
            onClick={(e) => handleNavClick("/dashboard", e)}
            className={cn(
              "flex items-center gap-2 font-semibold",
              loadingHref === "/dashboard" && "pointer-events-none opacity-70"
            )}
          >
            {loadingHref === "/dashboard" ? (
              <PiSpinner className="h-6 w-6 animate-spin" />
            ) : (
              <PiBuildings className="h-6 w-6" />
            )}
            <span>Careers Builder</span>
          </Link>
        )}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
            aria-label="Close navigation"
          >
            <PiX className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-1 px-4">
          {mainNavItems.length > 1 && (
            <div className="mb-4">
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                MAIN
              </h3>
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isLoading = loadingHref === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(item.href, e)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-linear-to-br from-primary to-primary/80 text-primary-foreground border border-primary/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),inset_0_-1px_2px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)]"
                        : "text-muted-foreground hover:bg-linear-to-br hover:from-muted hover:to-muted/80 hover:text-foreground hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.08)] active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] active:translate-y-[0.5px]",
                      isLoading && "pointer-events-none opacity-70"
                    )}
                  >
                    {isLoading ? (
                      <PiSpinner className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    {item.title}
                  </Link>
                );
              })}
            </div>
          )}

          {companyNavItems.length > 0 && (
            <div>
              <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                COMPANY
              </h3>
              {companyNavItems.map((item) => {
                const Icon = item.icon;
                // For overview, also check if we're at the root company path (legacy)
                const isActive =
                  pathname === item.href ||
                  (item.title === "Overview" && pathname === `/${companySlug}`);
                const isLoading = loadingHref === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(item.href, e)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-linear-to-br from-primary to-primary/80 text-primary-foreground border border-primary/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),inset_0_-1px_2px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)]"
                        : "text-muted-foreground hover:bg-linear-to-br hover:from-muted hover:to-muted/80 hover:text-foreground hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.08)] active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] active:translate-y-[0.5px]",
                      isLoading && "pointer-events-none opacity-70"
                    )}
                  >
                    {isLoading ? (
                      <PiSpinner className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    {item.title}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}
