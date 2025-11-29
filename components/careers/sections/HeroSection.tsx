"use client";

import { motion } from "framer-motion";
import { HeroSection as HeroSectionType } from "@/types/section";
import { Button } from "@/components/ui/button";
import { PiArrowDown, PiBriefcase } from "react-icons/pi";

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

      <div className="container mx-auto relative z-10 px-4 text-center text-white max-w-7xl">
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
            initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
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
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center gap-4 rounded-2xl px-6 py-4"
              style={{
                background: primaryColor
                  ? `linear-gradient(145deg, ${primaryColor}dd, ${primaryColor}aa)`
                  : "linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
                boxShadow: `
                  inset 0 2px 4px rgba(255,255,255,0.2),
                  inset 0 -2px 4px rgba(0,0,0,0.1),
                  0 8px 16px rgba(0,0,0,0.2),
                  0 2px 4px rgba(0,0,0,0.1)
                `,
                border: primaryColor
                  ? `1px solid ${primaryColor}80`
                  : "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))",
                  boxShadow: `
                    inset 0 2px 4px rgba(255,255,255,0.3),
                    inset 0 -2px 4px rgba(0,0,0,0.1),
                    0 4px 8px rgba(0,0,0,0.15)
                  `,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <PiBriefcase className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
              <div className="flex-1">
                <h3
                  className="text-xl font-semibold md:text-2xl mb-1"
                  style={{
                    textShadow:
                      "0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
                    color: "white",
                  }}
                >
                  No open positions available at the moment.
                </h3>
                <p
                  className="text-sm md:text-base"
                  style={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    color: "rgba(255,255,255,0.95)",
                  }}
                >
                  We're not currently hiring, but check back soon for new
                  opportunities!
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
