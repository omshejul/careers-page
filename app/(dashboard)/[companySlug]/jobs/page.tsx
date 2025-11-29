import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB, Company, CompanyUser, Job } from "@/lib/db";
import mongoose from "mongoose";
import { JobsClient } from "@/components/jobs/JobsClient";

export default async function JobsPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  await connectDB();
  const { companySlug } = await params;
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

  // Get all jobs for this company
  const jobs = await Job.find({ companyId: company._id })
    .sort({ postedAt: -1 })
    .lean();

  const serializedJobs = jobs.map((job: any) => ({
    id: job._id.toString(),
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
    postedAt: job.postedAt,
    expiresAt: job.expiresAt,
    published: job.published,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }));

  return (
    <JobsClient
      companyId={company._id.toString()}
      companySlug={companySlug}
      initialJobs={serializedJobs}
      userRole={companyUser.role}
    />
  );
}

