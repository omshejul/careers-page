"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
import { PiBriefcase, PiMapPin, PiClock, PiTable, PiGridFour } from "react-icons/pi";
import Link from "next/link";
import { getPostedTimeAgo } from "@/lib/utils";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
import { ArrowUpDown } from "lucide-react";

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
            <Link href={`/${companySlug}/jobs/${job.slug}`}>
              View Details
            </Link>
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
    onSortingChange: setSorting,
    getRowId: (row) => row.id || row._id?.toString() || String(row),
    state: {
      sorting,
    },
  });

  return (
    <section id="jobs-section" className="bg-muted/50 py-16">
      <div className="container px-4">
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
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
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
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="flex h-full flex-col hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          {job.jobType && (
                            <Badge variant="secondary">{job.jobType}</Badge>
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
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-md border">
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
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
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
                      <TableRow>
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
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
