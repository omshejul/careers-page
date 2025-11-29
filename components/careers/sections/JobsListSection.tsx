"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JobsListSection as JobsListSectionType } from "@/types/section";
import { JobWithCompany } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PiBriefcase,
  PiMapPin,
  PiClock,
  PiTable,
  PiGridFour,
} from "react-icons/pi";
import Link from "next/link";
import { getPostedTimeAgo } from "@/lib/utils";
import {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Settings2, Search, X } from "lucide-react";

interface JobsListSectionProps {
  section: JobsListSectionType;
  jobs?: JobWithCompany[];
  companySlug?: string;
}

type ViewMode = "grid" | "table";

export function JobsListSection({
  section,
  jobs = [],
  companySlug,
}: JobsListSectionProps) {
  const { title, subtitle } = section.data;
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Get unique values for filters
  const uniqueDepartments = Array.from(
    new Set(
      jobs
        .map((job) => job.department)
        .filter((dept): dept is string => Boolean(dept))
    )
  ).sort();
  const uniqueJobTypes = Array.from(
    new Set(
      jobs
        .map((job) => job.jobType)
        .filter((type): type is string => Boolean(type))
    )
  ).sort();
  const uniqueLocations = Array.from(
    new Set(
      jobs
        .map((job) => job.location)
        .filter((loc): loc is string => Boolean(loc))
    )
  ).sort();

  // Filter jobs for grid view
  const filteredJobsForGrid = jobs.filter((job) => {
    // Global search filter
    if (globalFilter) {
      const searchLower = globalFilter.toLowerCase();
      const matchesSearch =
        job.title?.toLowerCase().includes(searchLower) ||
        job.location?.toLowerCase().includes(searchLower) ||
        job.department?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Column filters
    const departmentFilter = columnFilters.find((f) => f.id === "department");
    if (departmentFilter && job.department !== departmentFilter.value) {
      return false;
    }

    const jobTypeFilter = columnFilters.find((f) => f.id === "jobType");
    if (jobTypeFilter && job.jobType !== jobTypeFilter.value) {
      return false;
    }

    const locationFilter = columnFilters.find((f) => f.id === "location");
    if (locationFilter && job.location !== locationFilter.value) {
      return false;
    }

    return true;
  });

  const columns: ColumnDef<JobWithCompany>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "location",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Location
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const location = row.getValue("location") as string | undefined;
        return (
          <div className="flex items-center gap-1">
            {location ? (
              <>
                <PiMapPin className="h-3 w-3" />
                <span>{location}</span>
              </>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "department",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Department
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const department = row.getValue("department") as string | undefined;
        return (
          <div className="flex items-center gap-1">
            {department ? (
              <>
                <PiBriefcase className="h-3 w-3" />
                <span>{department}</span>
              </>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "jobType",
      header: "Type",
      cell: ({ row }) => {
        const jobType = row.getValue("jobType") as string | undefined;
        return jobType ? (
          <Badge variant="secondary">{jobType}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "postedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Posted
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const postedAt = row.getValue("postedAt") as Date;
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <PiClock className="h-3 w-3" />
            <span>{getPostedTimeAgo(postedAt)}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <Button asChild variant="outline" size="sm">
            <Link href={`/${companySlug}/jobs/${job.slug}`}>View Details</Link>
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: (row) => row.id || row._id?.toString() || String(row),
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const job = row.original;
      return (
        job.title?.toLowerCase().includes(search) ||
        job.location?.toLowerCase().includes(search) ||
        job.department?.toLowerCase().includes(search) ||
        job.description?.toLowerCase().includes(search) ||
        false
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <section id="jobs-section" className="bg-muted/50 py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{title}</h2>
          {subtitle && (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          )}
        </motion.div>

        {jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <div className="mx-auto max-w-md">
              <p className="text-xl font-semibold text-foreground mb-3">
                No open positions available at the moment.
              </p>
              <p className="text-base text-muted-foreground">
                We're not currently hiring, but check back soon for new
                opportunities!
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="pl-9 pr-9"
                    />
                    <AnimatePresence>
                      {globalFilter && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setGlobalFilter("")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="gap-2"
                  >
                    <PiGridFour className="h-4 w-4" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="gap-2"
                  >
                    <PiTable className="h-4 w-4" />
                    Table
                  </Button>
                  {viewMode === "table" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Settings2 className="h-4 w-4" />
                          View
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[150px]">
                        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {table
                          .getAllColumns()
                          .filter(
                            (column) =>
                              typeof column.accessorFn !== "undefined" &&
                              column.getCanHide()
                          )
                          .map((column) => {
                            return (
                              <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) =>
                                  column.toggleVisibility(!!value)
                                }
                                onSelect={(e) => {
                                  e.preventDefault();
                                }}
                              >
                                {column.id === "jobType"
                                  ? "Type"
                                  : column.id === "postedAt"
                                  ? "Posted"
                                  : column.id}
                              </DropdownMenuCheckboxItem>
                            );
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Column Filters */}
              <motion.div layout className="flex flex-wrap items-center gap-2">
                {uniqueDepartments.length > 0 && (
                  <Select
                    value={
                      (columnFilters.find((f) => f.id === "department")
                        ?.value as string) || "all"
                    }
                    onValueChange={(value) => {
                      if (value === "all") {
                        setColumnFilters(
                          columnFilters.filter((f) => f.id !== "department")
                        );
                      } else {
                        setColumnFilters([
                          ...columnFilters.filter((f) => f.id !== "department"),
                          { id: "department", value },
                        ]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {uniqueDepartments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {uniqueJobTypes.length > 0 && (
                  <Select
                    value={
                      (columnFilters.find((f) => f.id === "jobType")
                        ?.value as string) || "all"
                    }
                    onValueChange={(value) => {
                      if (value === "all") {
                        setColumnFilters(
                          columnFilters.filter((f) => f.id !== "jobType")
                        );
                      } else {
                        setColumnFilters([
                          ...columnFilters.filter((f) => f.id !== "jobType"),
                          { id: "jobType", value },
                        ]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueJobTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {uniqueLocations.length > 0 && (
                  <Select
                    value={
                      (columnFilters.find((f) => f.id === "location")
                        ?.value as string) || "all"
                    }
                    onValueChange={(value) => {
                      if (value === "all") {
                        setColumnFilters(
                          columnFilters.filter((f) => f.id !== "location")
                        );
                      } else {
                        setColumnFilters([
                          ...columnFilters.filter((f) => f.id !== "location"),
                          { id: "location", value },
                        ]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {uniqueLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <AnimatePresence>
                  {(columnFilters.length > 0 || globalFilter) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setColumnFilters([]);
                          setGlobalFilter("");
                        }}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Clear filters
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Results count */}
              <motion.div
                key={`count-${
                  viewMode === "table"
                    ? table.getFilteredRowModel().rows.length
                    : filteredJobsForGrid.length
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-muted-foreground"
              >
                Showing{" "}
                {viewMode === "table"
                  ? table.getFilteredRowModel().rows.length
                  : filteredJobsForGrid.length}{" "}
                of {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  <AnimatePresence>
                    {filteredJobsForGrid.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="col-span-full py-12 text-center"
                      >
                        <p className="text-muted-foreground">
                          No jobs found matching your filters.
                        </p>
                      </motion.div>
                    ) : (
                      filteredJobsForGrid.map((job, index) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{
                            duration: 0.2,
                            delay: Math.min(index * 0.02, 0.1),
                          }}
                          layout
                        >
                          <Card className="flex h-full flex-col hover:shadow-lg transition-shadow duration-200">
                            <CardHeader>
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-xl">
                                  {job.title}
                                </CardTitle>
                                {job.jobType && (
                                  <Badge variant="secondary">
                                    {job.jobType}
                                  </Badge>
                                )}
                              </div>
                              <CardDescription className="flex flex-col gap-1">
                                {job.location && (
                                  <span className="flex items-center gap-1">
                                    <PiMapPin className="h-3 w-3" />
                                    {job.location}
                                  </span>
                                )}
                                {job.department && (
                                  <span className="flex items-center gap-1">
                                    <PiBriefcase className="h-3 w-3" />
                                    {job.department}
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-xs">
                                  <PiClock className="h-3 w-3" />
                                  {getPostedTimeAgo(job.postedAt)}
                                </span>
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                              <Button asChild className="w-full">
                                <Link href={`/${companySlug}/jobs/${job.slug}`}>
                                  View Details
                                </Link>
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden rounded-md border"
                >
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => {
                            return (
                              <TableHead key={header.id}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row, index) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            className="transition-all duration-200 ease-out"
                            style={{
                              animation: `fadeInSlide 0.2s ease-out ${Math.min(
                                index * 0.01,
                                0.05
                              )}s both`,
                            }}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow className="animate-in fade-in duration-200">
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}
