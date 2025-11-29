import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB, Company, CompanyUser } from "@/lib/db";
import mongoose from "mongoose";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  const companyName = company.name;
  const companyLogo = company.logo || "";

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 md:block">
        <Sidebar
          companySlug={companySlug}
          companyName={companyName}
          companyLogo={companyLogo}
        />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          user={session.user}
          companySlug={companySlug}
          companyName={companyName}
          companyLogo={companyLogo}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
