import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AnimatedHomePage from "@/components/AnimatedHomePage";
import type { Metadata } from "next";
import { getAbsoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Carrot - Careers Page Builder",
  description:
    "Build beautiful careers pages and manage job applications. Create custom sections, publish job listings, and streamline your hiring process.",
  alternates: {
    canonical: getAbsoluteUrl("/"),
  },
  openGraph: {
    title: "Carrot - Careers Page Builder",
    description: "Build beautiful careers pages and manage job applications",
    type: "website",
    url: getAbsoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Carrot - Careers Page Builder",
    description: "Build beautiful careers pages and manage job applications",
  },
};

export default async function HomePage() {
  const session = await auth();

  // If authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return <AnimatedHomePage />;
}
