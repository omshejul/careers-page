"use client";

import { useRouter } from "next/navigation";
import { PiCheck, PiCaretUpDown, PiPlusCircle } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Company {
  id: string;
  name: string;
  slug: string;
}

interface CompanySelectorProps {
  companies: Company[];
  currentCompanySlug?: string;
}

export function CompanySelector({
  companies,
  currentCompanySlug,
}: CompanySelectorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const currentCompany = companies.find((c) => c.slug === currentCompanySlug);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {currentCompany ? currentCompany.name : "Select company..."}
          <PiCaretUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search company..." />
          <CommandList>
            <CommandEmpty>No company found.</CommandEmpty>
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.slug}
                  onSelect={() => {
                    router.push(`/${company.slug}`);
                    setOpen(false);
                  }}
                >
                  <PiCheck
                    className={cn(
                      "mr-1 h-4 w-4",
                      currentCompanySlug === company.slug
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {company.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  router.push("/dashboard?new=true");
                  setOpen(false);
                }}
              >
                <PiPlusCircle className="mr-1 h-4 w-4" />
                Create Company
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
