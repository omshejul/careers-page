import { notFound } from "next/navigation";
import { connectDB, Company, Job } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PiMapPin,
  PiBriefcase,
  PiClock,
  PiArrowLeft,
  PiBuilding,
} from "react-icons/pi";
import Link from "next/link";
import { getPostedTimeAgo } from "@/lib/utils";
import type { Metadata } from "next";
import { JobApplicationForm } from "@/components/jobs/JobApplicationForm";
import { MarkdownContent } from "@/components/jobs/MarkdownContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ companySlug: string; jobSlug: string }>;
}): Promise<Metadata> {
  await connectDB();
  const { companySlug, jobSlug } = await params;

  const company = await Company.findOne({ slug: companySlug });
  if (!company) {
    return {
      title: "Job Not Found",
    };
  }

  const job = (await Job.findOne({
    companyId: company._id,
    slug: jobSlug,
    published: true,
  }).lean()) as any;

  if (!job) {
    return {
      title: "Job Not Found",
    };
  }

  return {
    title: `${job.title} at ${company.name}`,
    description: job.description
      ? job.description.substring(0, 160)
      : `Apply for ${job.title} at ${company.name}`,
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ companySlug: string; jobSlug: string }>;
}) {
  await connectDB();
  const { companySlug, jobSlug } = await params;

  // Get company
  const company = await Company.findOne({ slug: companySlug });
  if (!company) {
    notFound();
  }

  // Get job - must be published
  const jobDoc = await Job.findOne({
    companyId: company._id,
    slug: jobSlug,
    published: true,
  });

  if (!jobDoc) {
    notFound();
  }

  // Check if job has expired
  if (jobDoc.expiresAt && new Date(jobDoc.expiresAt) < new Date()) {
    notFound();
  }

  const job = jobDoc.toObject();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href={`/${companySlug}`}>
              <PiArrowLeft className="mr-2 h-4 w-4" />
              Back to Careers
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{job.department || "General"}</Badge>
              {job.jobType && <Badge variant="outline">{job.jobType}</Badge>}
              {job.employmentType && (
                <Badge variant="outline">{job.employmentType}</Badge>
              )}
            </div>

            <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              {job.location && (
                <div className="flex items-center gap-2">
                  <PiMapPin className="h-5 w-5" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.department && (
                <div className="flex items-center gap-2">
                  <PiBuilding className="h-5 w-5" />
                  <span>{job.department}</span>
                </div>
              )}
              {job.postedAt && (
                <div className="flex items-center gap-2">
                  <PiClock className="h-5 w-5" />
                  <span>{getPostedTimeAgo(job.postedAt)}</span>
                </div>
              )}
            </div>

            {job.salaryRange && (
              <div className="mt-4">
                <p className="text-base font-semibold text-foreground sm:text-lg">
                  {job.salaryRange}
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Job Description */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold sm:text-xl">
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {job.description ? (
                    <MarkdownContent content={job.description} />
                  ) : (
                    <p className="text-muted-foreground">
                      No description available.
                    </p>
                  )}
                </CardContent>
              </Card>

              {job.workPolicy && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold sm:text-xl">
                      Work Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed">{job.workPolicy}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Application Form */}
            <div className="lg:col-span-1">
              <Card className="lg:sticky lg:top-4">
                <CardHeader>
                  <CardTitle className="text-lg font-bold sm:text-xl">
                    Apply for this Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <JobApplicationForm
                    jobId={job._id.toString()}
                    jobTitle={job.title}
                    companySlug={companySlug}
                    companyId={company._id.toString()}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
