"use client";

import { motion } from "framer-motion";
import { AboutSection as AboutSectionType } from "@/types/section";

interface AboutSectionProps {
  section: AboutSectionType;
  isAltBackground?: boolean;
}

export function AboutSection({ section, isAltBackground }: AboutSectionProps) {
  const { title, content } = section.data;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`py-16 ${isAltBackground ? "bg-muted/50" : ""}`}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="mb-8 text-center text-3xl font-bold md:text-4xl">
          {title}
        </h2>
        <div className="prose prose-lg mx-auto max-w-3xl dark:prose-invert">
          <p className="text-lg leading-relaxed text-muted-foreground">
            {content}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
