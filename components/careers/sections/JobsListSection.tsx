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
import { PiBriefcase, PiMapPin, PiClock } from "react-icons/pi";
import Link from "next/link";
import { getPostedTimeAgo } from "@/lib/utils";

interface JobsListSectionProps {
  section: JobsListSectionType;
  jobs?: JobWithCompany[];
  companySlug?: string;
}

export function JobsListSection({
  section,
  jobs = [],
  companySlug,
}: JobsListSectionProps) {
  const { title, subtitle } = section.data;
  const [visibleCount, setVisibleCount] = useState(12);

  const visibleJobs = jobs.slice(0, visibleCount);
  const hasMore = visibleCount < jobs.length;

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleJobs.map((job, index) => (
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

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((count) => count + 12)}
                >
                  Load more roles
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
