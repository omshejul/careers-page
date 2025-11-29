import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB, Company, CompanyUser } from "@/lib/db";
import mongoose from "mongoose";
import { JobForm } from "@/components/jobs/JobForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewJobPage({
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

  // Check if user can edit
  if (companyUser.role === "VIEWER") {
    redirect(`/${companySlug}/jobs`);
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Job</h1>
        <p className="text-muted-foreground">
          Add a new job posting for your company
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Fill in the information below to create a new job posting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobForm
            companyId={company._id.toString()}
            companySlug={companySlug}
          />
        </CardContent>
      </Card>
    </div>
  );
}
