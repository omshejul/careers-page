import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB, Company, CompanyUser, Job } from "@/lib/db";
import mongoose from "mongoose";
import { JobForm } from "@/components/jobs/JobForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { IJob } from "@/models/Job";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ companySlug: string; jobSlug: string }>;
}) {
  await connectDB();
  const { companySlug, jobSlug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get company by slug
  const company = await Company.findOne({ slug: companySlug });

  if (!company) {
    notFound();
  }

  // Check user access
  const userId = new mongoose.Types.ObjectId(session.user.id);
  const companyUser = await CompanyUser.findOne({
    companyId: company._id,
    userId: userId,
  });

  if (!companyUser) {
    redirect("/dashboard");
  }

  // Check if user can edit
  if (companyUser.role === "VIEWER") {
    redirect(`/${companySlug}/jobs`);
  }

  // Get job by slug
  const jobDoc = await Job.findOne({
    slug: jobSlug,
    companyId: company._id,
  });

  if (!jobDoc) {
    notFound();
  }

  // Convert to plain object
  const job = jobDoc.toObject();

  // Serialize job data
  const jobData = {
    title: job.title,
    slug: job.slug,
    description: job.description,
    workPolicy: job.workPolicy,
    location: job.location,
    department: job.department,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    jobType: job.jobType,
    salaryRange: job.salaryRange,
    published: job.published,
    expiresAt: job.expiresAt
      ? new Date(job.expiresAt).toISOString().slice(0, 16)
      : "",
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Job</h1>
        <p className="text-muted-foreground">
          Update the job posting information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Update the information below to modify the job posting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobForm
            companyId={company._id.toString()}
            companySlug={companySlug}
            initialData={jobData}
            isEdit={true}
            jobId={job._id.toString()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
