import { auth } from "@/lib/auth";
import { connectDB, CompanyUser, Company, Job, Application } from "@/lib/db";
import mongoose from "mongoose";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PiPlusCircle,
  PiBuildings,
  PiBriefcase,
  PiFileText,
} from "react-icons/pi";
import Link from "next/link";
import { CreateCompanyDialog } from "@/components/dashboard/CreateCompanyDialog";
import { Suspense } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  await connectDB();
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Fetch user's companies
  const userId = new mongoose.Types.ObjectId(session.user.id);
  const userCompanies = await CompanyUser.find({
    userId: userId,
  }).populate("companyId");

  const companies = await Promise.all(
    userCompanies.map(async (uc) => {
      const company = uc.companyId as any;
      const jobCount = await Job.countDocuments({ companyId: company._id });
      return {
        ...company.toObject(),
        id: company._id.toString(),
        _count: {
          jobs: jobCount,
        },
      };
    })
  );

  // Fetch total stats across all companies
  const totalJobs = companies.reduce((sum, c) => sum + c._count.jobs, 0);

  const companyIds = companies.map((c) => c.id);
  const jobIds = await Job.find({ companyId: { $in: companyIds } }).distinct(
    "_id"
  );
  const totalApplications = await Application.countDocuments({
    jobId: { $in: jobIds },
  });

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Header user={session.user} />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-8">
          <Suspense fallback={null}>
            <CreateCompanyDialog />
          </Suspense>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {session.user.name}
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard?new=true">
                <PiPlusCircle className="mr-1 h-4 w-4" />
                New Company
              </Link>
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Companies</CardTitle>
                <PiBuildings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{companies.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total companies managed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Jobs
                </CardTitle>
                <PiBriefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalJobs}</div>
                <p className="text-xs text-muted-foreground">
                  Across all companies
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Applications
                </CardTitle>
                <PiFileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalApplications}</div>
                <p className="text-xs text-muted-foreground">
                  Total applications received
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Companies List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Companies</h2>

            {companies.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <PiBuildings className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">
                    No companies yet
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Create your first company to get started
                  </p>
                  <Button asChild>
                    <Link href="/dashboard?new=true">
                      <PiPlusCircle className="mr-1 h-4 w-4" />
                      Create Company
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {companies.map((company) => (
                  <Card
                    key={company.id}
                    className="transition-shadow hover:shadow-lg"
                  >
                    <CardHeader>
                      <CardTitle>{company.name}</CardTitle>
                      <CardDescription>/{company.slug}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Jobs:</span>
                          <span className="font-medium">
                            {company._count.jobs}
                          </span>
                        </div>
                        {company.website && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Website:
                            </span>
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Visit
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button asChild className="flex-1">
                          <Link href={`/${company.slug}/builder`}>Manage</Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                          <Link href={`/${company.slug}`} target="_blank">
                            View Site
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
