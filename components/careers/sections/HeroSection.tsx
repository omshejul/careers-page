"use client";

import { motion } from "framer-motion";
import { HeroSection as HeroSectionType } from "@/types/section";
import { Button } from "@/components/ui/button";
import { PiArrowDown } from "react-icons/pi";

interface HeroSectionProps {
  section: HeroSectionType;
  hasJobs?: boolean;
  primaryColor?: string;
  brandBannerUrl?: string;
}

export function HeroSection({
  section,
  hasJobs = false,
  primaryColor,
  brandBannerUrl,
}: HeroSectionProps) {
  const { title, tagline, bannerUrl } = section.data;

  const scrollToJobs = () => {
    const jobsSection = document.getElementById("jobs-section");
    if (jobsSection) {
      jobsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative flex min-h-[500px] items-center justify-center overflow-hidden"
      style={{
        backgroundImage:
          brandBannerUrl || bannerUrl
            ? `url(${brandBannerUrl || bannerUrl})`
            : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-linear-to-b from-black/50 to-black/30" />

      <div className="container relative z-10 px-4 text-center text-white">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
        >
          {title}
        </motion.h1>

        {tagline && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8 text-lg sm:text-xl md:text-2xl"
          >
            {tagline}
          </motion.p>
        )}

        {hasJobs ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button
              size="lg"
              onClick={scrollToJobs}
              className="gap-2"
              style={
                primaryColor
                  ? {
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    }
                  : undefined
              }
            >
              View Open Positions
              <PiArrowDown className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="inline-block rounded-lg bg-yellow-500/10 backdrop-blur-md px-8 py-8 border-2 border-dashed border-yellow-400/50 shadow-xl"
          >
            <p className="text-xl font-bold mb-2 text-white">
              No open positions available at the moment.
            </p>
            <p className="text-base text-white/95">
              We're not currently hiring, but check back soon for new
              opportunities!
            </p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
