import { MetadataRoute } from "next";
import { connectDB, Company, CareersPage, Job } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

    await connectDB();

    // Get all published careers pages with their companies
    const careersPages = await CareersPage.find({ published: true })
        .populate("companyId")
        .lean();

    // Get all published jobs
    const jobs = await Job.find({ published: true })
        .populate("companyId")
        .lean();

    const sitemap: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
    ];

    // Add careers pages
    for (const page of careersPages) {
        const company = page.companyId as any;
        if (company?.slug) {
            sitemap.push({
                url: `${baseUrl}/${company.slug}`,
                lastModified: page.updatedAt || new Date(),
                changeFrequency: "daily",
                priority: 0.9,
            });
        }
    }

    // Add job pages
    for (const job of jobs) {
        const company = job.companyId as any;
        if (company?.slug && job.slug) {
            // Skip expired jobs
            if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
                continue;
            }

            sitemap.push({
                url: `${baseUrl}/${company.slug}/jobs/${job.slug}`,
                lastModified: job.updatedAt || job.postedAt || new Date(),
                changeFrequency: "weekly",
                priority: 0.8,
            });
        }
    }

    return sitemap;
}
