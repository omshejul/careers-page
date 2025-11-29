import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  connectDB,
  Company,
  CompanyUser,
  Job,
  Application,
  CareersPage,
} from "@/lib/db";
import mongoose from "mongoose";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PiBuildings, PiBriefcase, PiFileText, PiGlobe } from "react-icons/pi";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CompanyOverviewPage({
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

  // Get stats
  const jobCount = await Job.countDocuments({ companyId: company._id });
  const applicationCount = await Application.countDocuments({
    jobId: { $in: await Job.find({ companyId: company._id }).distinct("_id") },
  });
  const careersPage = await CareersPage.findOne({ companyId: company._id });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {company.logo && (
            <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-md">
              <img
                src={company.logo}
                alt={company.name}
                className="h-12 w-12 object-cover"
              />
            </span>
          )}
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">{company.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/${companySlug}`} target="_blank">
              <PiGlobe className="mr-1 h-4 w-4" />
              View Public Site
            </a>
          </Button>
          <Button asChild>
            <Link href={`/${companySlug}/builder`}>
              <PiBuildings className="mr-1 h-4 w-4" />
              Manage Page
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <PiBriefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobCount}</div>
            <p className="text-xs text-muted-foreground">Active job postings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <PiFileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationCount}</div>
            <p className="text-xs text-muted-foreground">
              Total applications received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Status</CardTitle>
            <PiGlobe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {careersPage?.published ? "Published" : "Draft"}
            </div>
            <p className="text-xs text-muted-foreground">Careers page status</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks for managing your careers page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" asChild className="h-auto flex-col py-4">
              <Link href={`/${companySlug}/builder`}>
                <PiBuildings className="mb-2 h-6 w-6" />
                <span>Page Builder</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto flex-col py-4">
              <Link href={`/${companySlug}/jobs`}>
                <PiBriefcase className="mb-2 h-6 w-6" />
                <span>Manage Jobs</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto flex-col py-4">
              <Link href={`/${companySlug}/applications`}>
                <PiFileText className="mb-2 h-6 w-6" />
                <span>Applications</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto flex-col py-4">
              <Link href={`/${companySlug}/settings`}>
                <PiGlobe className="mb-2 h-6 w-6" />
                <span>Settings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <p className="text-sm text-muted-foreground">{company.name}</p>
          </div>
          {company.description && (
            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="text-sm text-muted-foreground">
                {company.description}
              </p>
            </div>
          )}
          {company.website && (
            <div>
              <label className="text-sm font-medium">Website</label>
              <p className="text-sm text-muted-foreground">
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {company.website}
                </a>
              </p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium">Public URL</label>
            <p className="text-sm text-muted-foreground">
              <a
                href={`/${companySlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                /{companySlug}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
