"use client";

import { motion } from "framer-motion";
import { CultureVideoSection as CultureVideoSectionType } from "@/types/section";

interface CultureVideoSectionProps {
  section: CultureVideoSectionType;
  isAltBackground?: boolean;
}

function getEmbedUrl(url: string): string {
  // Convert YouTube watch URLs to embed URLs
  if (url.includes("youtube.com/watch")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Convert YouTube short URLs to embed URLs
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Convert Vimeo URLs to embed URLs
  if (url.includes("vimeo.com/")) {
    const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  return url;
}

export function CultureVideoSection({
  section,
  isAltBackground,
}: CultureVideoSectionProps) {
  const { title, videoUrl, description } = section.data;
  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <section className={`py-16 ${isAltBackground ? "bg-muted/50" : ""}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-4xl"
        >
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            {title}
          </h2>

          {description && (
            <p className="mb-8 text-center text-lg text-muted-foreground">
              {description}
            </p>
          )}

          <div className="aspect-video overflow-hidden rounded-lg shadow-xl">
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
