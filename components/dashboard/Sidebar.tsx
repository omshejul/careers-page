"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PiSquaresFour,
  PiBriefcase,
  PiFileText,
  PiGear,
  PiBuildings,
  PiArrowLeft,
} from "react-icons/pi";

interface SidebarProps {
  companySlug?: string;
  companyName?: string;
  companyLogo?: string;
}

export function Sidebar({
  companySlug,
  companyName,
  companyLogo,
}: SidebarProps) {
  const pathname = usePathname();

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
      <div className="flex h-16 items-center border-b px-6">
        {companySlug && companyName ? (
          <Link
            href={`/${companySlug}/overview`}
            className="flex items-center gap-2 font-semibold"
          >
            {companyLogo ? (
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
            className="flex items-center gap-2 font-semibold"
          >
            <PiBuildings className="h-6 w-6" />
            <span>Careers Builder</span>
          </Link>
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

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
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

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
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
