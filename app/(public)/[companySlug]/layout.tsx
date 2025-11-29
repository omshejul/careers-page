import { connectDB, Company } from "@/lib/db";
import { CompanyTheme } from "@/components/public/CompanyTheme";

export default async function PublicCareersLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ companySlug: string }>;
}) {
  await connectDB();
  const { companySlug } = await params;

  const company = await Company.findOne({ slug: companySlug }).select(
    "primaryColor secondaryColor"
  );

  return (
    <>
      <CompanyTheme
        primaryColor={company?.primaryColor}
        secondaryColor={company?.secondaryColor}
      />
      {children}
    </>
  );
}
