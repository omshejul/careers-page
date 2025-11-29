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
import { PiPlus, PiPencil, PiTrash, PiEye } from "react-icons/pi";
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
}

export function JobsClient({
  companyId,
  companySlug,
  initialJobs,
  userRole,
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
                          <Link href={`/${companySlug}/jobs/${job.id}/edit`}>
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
