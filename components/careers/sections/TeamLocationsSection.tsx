'use client'

import { motion } from 'framer-motion'
import { TeamLocationsSection as TeamLocationsSectionType } from '@/types/section'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PiMapPin } from 'react-icons/pi'
import Image from 'next/image'

interface TeamLocationsSectionProps {
  section: TeamLocationsSectionType
}

export function TeamLocationsSection({ section }: TeamLocationsSectionProps) {
  const { title, locations } = section.data

  return (
    <section className="py-16">
      <div className="container px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center text-3xl font-bold md:text-4xl"
        >
          {title}
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full overflow-hidden">
                {location.imageUrl && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={location.imageUrl}
                      alt={`${location.city}, ${location.country}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiMapPin className="h-5 w-5 text-primary" />
                    {location.city}
                  </CardTitle>
                  <CardDescription>{location.country}</CardDescription>
                </CardHeader>
                {location.address && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {location.address}
                    </p>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
