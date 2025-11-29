import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB, Company, CompanyUser } from "@/lib/db";
import mongoose from "mongoose";
import { SettingsClient } from "@/components/settings/SettingsClient";

export default async function SettingsPage({
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

  // Only admins can access settings
  if (companyUser.role !== "ADMIN") {
    redirect(`/${companySlug}/overview`);
  }

  const serializedCompany = {
    id: company._id.toString(),
    name: company.name,
    slug: company.slug,
    description: company.description || "",
    website: company.website || "",
    logo: company.logo || "",
    primaryColor: company.primaryColor || "",
    secondaryColor: company.secondaryColor || "",
    brandBannerUrl: company.brandBannerUrl || "",
  };

  return (
    <SettingsClient
      companyId={company._id.toString()}
      companySlug={companySlug}
      initialCompany={serializedCompany}
    />
  );
}
