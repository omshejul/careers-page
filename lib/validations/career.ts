import { z } from 'zod'

// Hero Section
export const heroSectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  tagline: z.string().max(200).optional(),
  bannerUrl: z.string().url('Invalid banner URL').optional().or(z.literal('')),
})

// About Section
export const aboutSectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().min(1, 'Content is required').max(5000),
})

// Values Section
export const valueSectionSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  icon: z.string().optional(),
})

export const valuesSectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  values: z.array(valueSectionSchema).min(1, 'At least one value is required').max(10),
})

// Benefits Section
export const benefitSectionSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  icon: z.string().optional(),
})

export const benefitsSectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  benefits: z.array(benefitSectionSchema).min(1, 'At least one benefit is required').max(12),
})

// Culture Video Section
export const cultureVideoSectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  videoUrl: z.string().url('Invalid video URL').min(1, 'Video URL is required'),
  description: z.string().max(500).optional(),
})

// Team Locations Section
export const locationSchema = z.object({
  city: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  address: z.string().max(200).optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
})

export const teamLocationsSectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  locations: z.array(locationSchema).min(1, 'At least one location is required').max(20),
})

// Jobs List Section
export const jobsListSectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  subtitle: z.string().max(200).optional(),
})

// Combined Section Data Schema
export const sectionDataSchema = z.union([
  heroSectionSchema,
  aboutSectionSchema,
  valuesSectionSchema,
  benefitsSectionSchema,
  cultureVideoSectionSchema,
  teamLocationsSectionSchema,
  jobsListSectionSchema,
])

// Create/Update Section
export const createSectionSchema = z.object({
  type: z.enum(['HERO', 'ABOUT', 'VALUES', 'BENEFITS', 'CULTURE_VIDEO', 'TEAM_LOCATIONS', 'JOBS_LIST']),
  order: z.number().int().min(0),
  enabled: z.boolean().default(true),
  data: z.record(z.string(), z.unknown()), // Will be validated based on type
})

export const updateSectionSchema = z.object({
  order: z.number().int().min(0).optional(),
  enabled: z.boolean().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

// Careers Page
export const updateCareersPageSchema = z.object({
  published: z.boolean().optional(),
  hasUnpublishedChanges: z.boolean().optional(),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(300).optional(),
})

export type HeroSectionData = z.infer<typeof heroSectionSchema>
export type AboutSectionData = z.infer<typeof aboutSectionSchema>
export type ValuesSectionData = z.infer<typeof valuesSectionSchema>
export type BenefitsSectionData = z.infer<typeof benefitsSectionSchema>
export type CultureVideoSectionData = z.infer<typeof cultureVideoSectionSchema>
export type TeamLocationsSectionData = z.infer<typeof teamLocationsSectionSchema>
export type JobsListSectionData = z.infer<typeof jobsListSectionSchema>

export type SectionData =
  | HeroSectionData
  | AboutSectionData
  | ValuesSectionData
  | BenefitsSectionData
  | CultureVideoSectionData
  | TeamLocationsSectionData
  | JobsListSectionData

export type CreateSectionInput = z.infer<typeof createSectionSchema>
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>
export type UpdateCareersPageInput = z.infer<typeof updateCareersPageSchema>
