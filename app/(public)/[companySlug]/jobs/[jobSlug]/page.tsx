import { notFound } from "next/navigation";
import { connectDB, Company, Job } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PiMapPin, PiClock, PiArrowLeft, PiBuilding } from "react-icons/pi";
import Link from "next/link";
import {
  getPostedTimeAgo,
  getAbsoluteUrl,
  getBaseUrl,
  truncate,
  safeJsonLdStringify,
} from "@/lib/utils";
import type { Metadata } from "next";
import { JobApplicationForm } from "@/components/jobs/JobApplicationForm";
import { MarkdownContent } from "@/components/jobs/MarkdownContent";
import type { ICompany } from "@/models/Company";
import type { IJob } from "@/models/Job";

type SerializedCompany = Omit<ICompany, "_id"> & {
  id: string;
  _id?: never;
};

type SerializedJob = Omit<IJob, "_id" | "companyId"> & {
  id: string;
  companyId: string;
  _id?: never;
};

type SchemaObject = Record<string, unknown>;

// Helper to map employment type to schema.org values
function getSchemaEmploymentType(employmentType?: string): string[] {
  if (!employmentType) return ["FULL_TIME"];

  const typeMap: Record<string, string> = {
    "Full-time": "FULL_TIME",
    "Part-time": "PART_TIME",
    Contract: "CONTRACTOR",
    Temporary: "TEMPORARY",
    Intern: "INTERN",
    Internship: "INTERN",
    Freelance: "CONTRACTOR",
    "Per Diem": "PER_DIEM",
    Volunteer: "VOLUNTEER",
  };

  return [typeMap[employmentType] || "FULL_TIME"];
}

// Helper to build JSON-LD JobPosting schema
function buildJobPostingSchema(
  job: SerializedJob,
  company: SerializedCompany,
  companySlug: string,
  jobSlug: string
) {
  const baseUrl = getBaseUrl();

  const schema: SchemaObject = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description || `${job.title} position at ${company.name}`,
    datePosted: job.postedAt
      ? new Date(job.postedAt).toISOString()
      : new Date().toISOString(),
    hiringOrganization: {
      "@type": "Organization",
      name: company.name,
      sameAs: company.website || undefined,
      logo: company.logo || undefined,
    },
    employmentType: getSchemaEmploymentType(job.employmentType),
    directApply: true,
    url: `${baseUrl}/${companySlug}/jobs/${jobSlug}`,
  };

  // Add job location
  if (job.location) {
    // Check if it's remote
    const isRemote = job.location.toLowerCase().includes("remote");

    if (isRemote) {
      schema.jobLocationType = "TELECOMMUTE";
      schema.applicantLocationRequirements = {
        "@type": "Country",
        name: "Worldwide",
      };
    }

    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
      },
    };
  }

  // Add valid through date if expires
  if (job.expiresAt) {
    schema.validThrough = new Date(job.expiresAt).toISOString();
  }

  // Add industry/category if department exists
  if (job.department) {
    schema.industry = job.department;
    schema.occupationalCategory = job.department;
  }

  // Add experience level if exists
  if (job.experienceLevel) {
    schema.experienceRequirements = job.experienceLevel;
  }

  // Add salary if exists and try to parse it
  if (job.salaryRange) {
    // Try to extract currency and values from salary range
    // Common formats: "$50,000 - $70,000", "50k-70k USD", "$100,000/year"
    const salaryMatch = job.salaryRange.match(
      /[\$€£]?\s*(\d+[,\d]*)\s*[kK]?\s*[-–to]+\s*[\$€£]?\s*(\d+[,\d]*)\s*[kK]?/
    );

    if (salaryMatch) {
      let minValue = parseFloat(salaryMatch[1].replace(/,/g, ""));
      let maxValue = parseFloat(salaryMatch[2].replace(/,/g, ""));

      // Handle "k" notation
      if (job.salaryRange.toLowerCase().includes("k")) {
        if (minValue < 1000) minValue *= 1000;
        if (maxValue < 1000) maxValue *= 1000;
      }

      // Detect currency
      let currency = "USD";
      if (job.salaryRange.includes("€")) currency = "EUR";
      else if (job.salaryRange.includes("£")) currency = "GBP";
      else if (job.salaryRange.includes("₹")) currency = "INR";

      schema.baseSalary = {
        "@type": "MonetaryAmount",
        currency,
        value: {
          "@type": "QuantitativeValue",
          minValue,
          maxValue,
          unitText: "YEAR",
        },
      };
    }
  }

  return schema;
}

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

  const jobDoc = await Job.findOne({
    companyId: company._id,
    slug: jobSlug,
    published: true,
  }).lean();

  if (!jobDoc) {
    return {
      title: "Job Not Found",
    };
  }

  const job = jobDoc as unknown as SerializedJob;
  const title = `${job.title} at ${company.name}`;
  const baseDescription = job.description
    ? truncate(
        job.description.replace(/[#*`]/g, "").replace(/\n/g, " ").trim(),
        160
      )
    : `Apply for ${job.title} at ${company.name}`;

  // Build job details for enhanced description
  const jobDetails = [
    job.location && `Location: ${job.location}`,
    job.department && `Department: ${job.department}`,
    job.jobType && `Type: ${job.jobType}`,
    job.employmentType && `Employment: ${job.employmentType}`,
  ]
    .filter(Boolean)
    .join(" • ");

  const description = jobDetails
    ? `${baseDescription} ${jobDetails}`
    : baseDescription;

  const url = getAbsoluteUrl(`/${companySlug}/jobs/${jobSlug}`);
  const ogImage = company.brandBannerUrl || company.logo || undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: company.name,
      type: "article",
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: `${job.title} at ${company.name}`,
            },
          ]
        : undefined,
      publishedTime: job.postedAt
        ? new Date(job.postedAt).toISOString()
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
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

  const jobObj = jobDoc.toObject();
  const serializedJob: SerializedJob = {
    ...jobObj,
    id: jobObj._id.toString(),
    companyId: jobObj.companyId.toString(),
  } as SerializedJob;

  const serializedCompany: SerializedCompany = {
    ...company.toObject(),
    id: company._id.toString(),
  } as SerializedCompany;

  // Build JSON-LD structured data for SEO
  const jobPostingSchema = buildJobPostingSchema(
    serializedJob,
    serializedCompany,
    companySlug,
    jobSlug
  );

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(jobPostingSchema),
        }}
      />

      <div className="min-h-svh bg-background">
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
                <Badge variant="secondary">
                  {serializedJob.department || "General"}
                </Badge>
                {serializedJob.jobType && (
                  <Badge variant="outline">{serializedJob.jobType}</Badge>
                )}
                {serializedJob.employmentType && (
                  <Badge variant="outline">
                    {serializedJob.employmentType}
                  </Badge>
                )}
              </div>

              <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
                {serializedJob.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                {serializedJob.location && (
                  <div className="flex items-center gap-2">
                    <PiMapPin className="h-5 w-5" />
                    <span>{serializedJob.location}</span>
                  </div>
                )}
                {serializedJob.department && (
                  <div className="flex items-center gap-2">
                    <PiBuilding className="h-5 w-5" />
                    <span>{serializedJob.department}</span>
                  </div>
                )}
                {serializedJob.postedAt && (
                  <div className="flex items-center gap-2">
                    <PiClock className="h-5 w-5" />
                    <span>{getPostedTimeAgo(serializedJob.postedAt)}</span>
                  </div>
                )}
              </div>

              {serializedJob.salaryRange && (
                <div className="mt-4">
                  <p className="text-base font-semibold text-foreground sm:text-lg">
                    {serializedJob.salaryRange}
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
                    {serializedJob.description ? (
                      <MarkdownContent content={serializedJob.description} />
                    ) : (
                      <p className="text-muted-foreground">
                        No description available.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {serializedJob.workPolicy && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold sm:text-xl">
                        Work Policy
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-relaxed">
                        {serializedJob.workPolicy}
                      </p>
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
                      jobId={serializedJob.id}
                      companyId={serializedCompany.id}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
