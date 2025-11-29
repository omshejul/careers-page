import { notFound } from "next/navigation";
import {
  connectDB,
  Company,
  CareersPage,
  Section,
  Job,
  CompanyUser,
} from "@/lib/db";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";
import { TypedSection } from "@/types/section";
import {
  HeroSection,
  AboutSection,
  ValuesSection,
  BenefitsSection,
  CultureVideoSection,
  TeamLocationsSection,
  JobsListSection,
} from "@/components/careers/sections";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}): Promise<Metadata> {
  await connectDB();
  const { companySlug } = await params;
  const company = await Company.findOne({ slug: companySlug });

  if (!company) {
    return {
      title: "Careers Page Not Found",
    };
  }

  const careersPage = await CareersPage.findOne({ companyId: company._id });

  if (!careersPage) {
    return {
      title: "Careers Page Not Found",
    };
  }

  return {
    title: careersPage.seoTitle || `Careers at ${company.name}`,
    description:
      careersPage.seoDescription ||
      company.description ||
      `Join the team at ${company.name}`,
  };
}

export default async function PublicCareersPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  await connectDB();
  const { companySlug } = await params;
  const { preview } = await searchParams;

  // Check for preview mode via searchParams
  const isPreviewMode = preview === "true";

  // Get company - use lean() to get plain object
  const company = (await Company.findOne({ slug: companySlug }).lean()) as any;

  if (!company) {
    notFound();
  }

  // Get careers page
  const careersPage = (await CareersPage.findOne({
    companyId: company._id,
  }).lean()) as any;

  if (!careersPage) {
    notFound();
  }

  // Only show published pages or allow preview for authorized users
  if (!careersPage.published && !isPreviewMode) {
    notFound();
  }

  // If preview mode, verify user owns this company (for both published and unpublished)
  if (isPreviewMode) {
    const session = await auth();
    if (!session?.user) {
      notFound();
    }
    // Verify user has access to this company
    const hasAccess = await CompanyUser.findOne({
      companyId: company._id,
      userId: new mongoose.Types.ObjectId(session.user.id),
    });
    if (!hasAccess) {
      notFound();
    }
  }

  // Get enabled sections - use lean() to get plain objects
  // Note: We fetch ALL sections (not just enabled: true) because we need to check publishedEnabled for live view
  // and sorting logic is handled in code.
  const sections = await Section.find({
    careersPageId: careersPage._id,
  }).lean();

  // Get published jobs - use lean() to get plain objects
  const jobs = await Job.find({
    companyId: company._id,
    published: true,
  })
    .sort({ postedAt: "desc" })
    .lean();

  // Serialize to plain objects (convert ObjectIds to strings)
  const serializedCompany = {
    ...company,
    id: company._id.toString(),
    _id: undefined, // Remove _id to avoid issues
  } as any;

  // For preview mode: use draft data (show all sections)
  // For published page: only show sections with publishedData
  const serializedSections = sections
    .filter((section: any) => {
      if (isPreviewMode) {
        return !section.deletedAt && section.enabled;
      }
      // In Public mode:
      // 1. If section has publishedData, show it (even if deleted in draft)
      if (
        section.publishedData !== undefined &&
        section.publishedData !== null &&
        Object.keys(section.publishedData).length > 0
      ) {
        // Use publishedEnabled if available, otherwise assume enabled (legacy sections were enabled when published)
        // Important: Do NOT fall back to section.enabled as that's the draft state
        return section.publishedEnabled ?? true;
      }
      // Fallback for legacy published data before publishedData existed
      // Show draft data only if there are no unpublished changes recorded
      // AND if the section is not deleted and is enabled
      return (
        !careersPage.hasUnpublishedChanges &&
        !section.deletedAt &&
        section.enabled
      );
    })
    .map((section: any) => {
      const sectionData = isPreviewMode
        ? section.data
        : section.publishedData && Object.keys(section.publishedData).length > 0
        ? section.publishedData
        : section.data;

      return {
        ...section,
        data: sectionData,
        // Use publishedOrder for sorting if in public mode and available
        sortOrder: isPreviewMode
          ? section.order
          : section.publishedOrder ?? section.order,
        id: section._id.toString(),
        careersPageId: section.careersPageId.toString(),
        _id: undefined,
      };
    })
    .sort((a: any, b: any) => a.sortOrder - b.sortOrder);

  const serializedJobs = jobs.map((job: any) => ({
    ...job,
    id: job._id.toString(),
    companyId: job.companyId.toString(),
    _id: undefined, // Remove _id
    company: serializedCompany,
  }));

  // Filter out HERO section for alternating background calculation
  // HERO always has its own background (image), so we start alternating from the next section
  const nonHeroSections = serializedSections.filter(
    (s: any) => s.type !== "HERO"
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="sticky top-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950">
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {!careersPage.published
              ? "Preview Mode — This page is not published yet"
              : careersPage.hasUnpublishedChanges
              ? "Preview Mode — Viewing draft with unpublished changes"
              : "Preview Mode — No unpublished changes"}
          </span>
        </div>
      )}

      <div className="flex-1">
        {serializedSections.map((section) => {
          const typedSection = section as unknown as TypedSection;
          // Calculate index among non-hero sections for alternating backgrounds
          const nonHeroIndex = nonHeroSections.findIndex(
            (s: any) => s.id === section.id
          );
          const isAltBackground = nonHeroIndex % 2 === 1;

          switch (typedSection.type) {
            case "HERO":
              return (
                <HeroSection
                  key={section.id}
                  section={typedSection}
                  hasJobs={serializedJobs.length > 0}
                  primaryColor={serializedCompany.primaryColor}
                  brandBannerUrl={serializedCompany.brandBannerUrl}
                  companyLogo={serializedCompany.logo}
                />
              );
            case "ABOUT":
              return (
                <AboutSection
                  key={section.id}
                  section={typedSection}
                  isAltBackground={isAltBackground}
                />
              );
            case "VALUES":
              return (
                <ValuesSection
                  key={section.id}
                  section={typedSection}
                  isAltBackground={isAltBackground}
                />
              );
            case "BENEFITS":
              return (
                <BenefitsSection
                  key={section.id}
                  section={typedSection}
                  isAltBackground={isAltBackground}
                />
              );
            case "CULTURE_VIDEO":
              return (
                <CultureVideoSection
                  key={section.id}
                  section={typedSection}
                  isAltBackground={isAltBackground}
                />
              );
            case "TEAM_LOCATIONS":
              return (
                <TeamLocationsSection
                  key={section.id}
                  section={typedSection}
                  isAltBackground={isAltBackground}
                />
              );
            case "JOBS_LIST":
              return (
                <JobsListSection
                  key={section.id}
                  section={typedSection}
                  jobs={serializedJobs}
                  companySlug={companySlug}
                  isAltBackground={isAltBackground}
                />
              );
            default:
              return null;
          }
        })}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t bg-muted/30 py-8">
        <div className="container px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {serializedCompany.name || "Company"}.
            All rights reserved.
          </p>
          {serializedCompany.website && (
            <a
              href={serializedCompany.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              Visit our website
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
