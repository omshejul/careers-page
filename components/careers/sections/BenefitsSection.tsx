"use client";

import { motion } from "framer-motion";
import { BenefitsSection as BenefitsSectionType } from "@/types/section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BenefitsSectionProps {
  section: BenefitsSectionType;
}

export function BenefitsSection({ section }: BenefitsSectionProps) {
  const { title, benefits } = section.data;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center text-3xl font-bold md:text-4xl"
        >
          {title}
        </motion.h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full text-center">
                <CardHeader>
                  {benefit.icon && (
                    <div className="mb-2 text-3xl">{benefit.icon}</div>
                  )}
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
