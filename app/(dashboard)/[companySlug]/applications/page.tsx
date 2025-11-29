import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB, Company, CompanyUser, Application, Job } from "@/lib/db";
import mongoose from "mongoose";
import { ApplicationsClient } from "@/components/applications/ApplicationsClient";

export default async function ApplicationsPage({
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

  // Get all job IDs for this company
  const jobIds = await Job.find({ companyId: company._id }).distinct("_id");

  // Get all applications for these jobs
  const applications = await Application.find({ jobId: { $in: jobIds } })
    .populate("jobId")
    .sort({ createdAt: -1 })
    .lean();

  const serializedApplications = applications.map((app: any) => ({
    id: app._id.toString(),
    jobId: (app.jobId as any)._id.toString(),
    jobTitle: (app.jobId as any).title,
    firstName: app.firstName,
    lastName: app.lastName,
    email: app.email,
    phone: app.phone,
    resumeUrl: app.resumeUrl,
    coverLetter: app.coverLetter,
    linkedinUrl: app.linkedinUrl,
    portfolioUrl: app.portfolioUrl,
    status: app.status,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  }));

  return (
    <ApplicationsClient
      companyId={company._id.toString()}
      companySlug={companySlug}
      initialApplications={serializedApplications}
      userRole={companyUser.role}
    />
  );
}

