import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  connectDB,
  Company,
  CompanyUser,
  CareersPage,
  Section,
} from "@/lib/db";
import mongoose from "mongoose";
import { BuilderClient } from "@/components/builder/BuilderClient";

export default async function BuilderPage({
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

  // Get careers page with sections
  const careersPage = await CareersPage.findOne({ companyId: company._id });

  if (!careersPage) {
    notFound();
  }

  const sections = await Section.find({ careersPageId: careersPage._id })
    .sort({ order: "asc" })
    .lean();

  // Serialize data for client component
  const serializedSections = sections.map((section: any) => ({
    id: section._id.toString(),
    type: section.type,
    order: section.order,
    enabled: section.enabled,
    data: section.data,
    createdAt: section.createdAt,
    updatedAt: section.updatedAt,
  }));

  return (
    <BuilderClient
      companyId={company._id.toString()}
      companySlug={companySlug}
      careersPage={{
        id: careersPage._id.toString(),
        published: careersPage.published,
        hasUnpublishedChanges: careersPage.hasUnpublishedChanges ?? true,
        seoTitle: careersPage.seoTitle,
        seoDescription: careersPage.seoDescription,
      }}
      sections={serializedSections as any}
    />
  );
}
