"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PiPlus, PiPencil, PiTrash, PiEye, PiWarning } from "react-icons/pi";
import { toast } from "sonner";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  slug: string;
  description?: string;
  location?: string;
  department?: string;
  employmentType?: string;
  jobType?: string;
  published: boolean;
  postedAt: Date;
}

interface JobsClientProps {
  companyId: string;
  companySlug: string;
  initialJobs: Job[];
  userRole: string;
  hasJobsListSection: boolean;
}

export function JobsClient({
  companyId,
  companySlug,
  initialJobs,
  userRole,
  hasJobsListSection,
}: JobsClientProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const canEdit = userRole === "ADMIN" || userRole === "EDITOR";

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) {
      return;
    }

    setIsDeleting(jobId);
    try {
      const response = await fetch(
        `/api/companies/${companyId}/jobs/${jobId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete job");
      }

      toast.success("Job deleted successfully");
      setJobs(jobs.filter((j) => j.id !== jobId));
      router.refresh();
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete job"
      );
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">
            Manage job postings for your company
          </p>
        </div>
        {canEdit && (
          <Button asChild>
            <Link href={`/${companySlug}/jobs/new`}>
              <PiPlus className="mr-1 h-4 w-4" />
              New Job
            </Link>
          </Button>
        )}
      </div>

      {jobs.length > 0 && !hasJobsListSection && (
        <Alert
          variant="default"
          className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20"
        >
          <PiWarning className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">
            Jobs List Section Missing
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300 flex flex-col gap-2">
            <span>
              You have {jobs.length} job{jobs.length !== 1 ? "s" : ""} posted, but
              the Jobs List section hasn't been added to your careers page builder
              yet. Add it to display your jobs on the public careers page.
            </span>
            <Button asChild size="sm" className="w-fit bg-yellow-600 hover:bg-yellow-700 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700">
              <Link href={`/${companySlug}/builder`}>
                Go to Builder
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No jobs posted yet</p>
            {canEdit && (
              <Button asChild>
                <Link href={`/${companySlug}/jobs/new`}>
                  <PiPlus className="mr-1 h-4 w-4" />
                  Create Your First Job
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{job.title}</CardTitle>
                      <Badge variant={job.published ? "default" : "secondary"}>
                        {job.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <CardDescription className="flex flex-col gap-1">
                      {job.location && <span>📍 {job.location}</span>}
                      {job.department && <span>🏢 {job.department}</span>}
                      {job.employmentType && (
                        <span>💼 {job.employmentType}</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`/${companySlug}/jobs/${job.slug}`}
                        target="_blank"
                      >
                        <PiEye className="h-4 w-4" />
                      </a>
                    </Button>
                    {canEdit && (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/${companySlug}/jobs/${job.slug}/edit`}>
                            <PiPencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(job.id)}
                          disabled={isDeleting === job.id}
                        >
                          <PiTrash className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
