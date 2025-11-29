import { z } from 'zod'

export const createJobSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(1, 'Job description is required').max(10000),
  workPolicy: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  department: z.string().max(100).optional(),
  employmentType: z.string().max(50).optional(),
  experienceLevel: z.string().max(50).optional(),
  jobType: z.string().max(50).optional(),
  salaryRange: z.string().max(100).optional(),
  published: z.boolean().default(true),
  expiresAt: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val || val === '') return true;
        // Accept both ISO datetime and datetime-local format (YYYY-MM-DDTHH:mm)
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
        const localRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
        return isoRegex.test(val) || localRegex.test(val);
      },
      { message: 'Invalid datetime format' }
    ),
})

export const updateJobSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string().min(1).max(10000).optional(),
  workPolicy: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  department: z.string().max(100).optional(),
  employmentType: z.string().max(50).optional(),
  experienceLevel: z.string().max(50).optional(),
  jobType: z.string().max(50).optional(),
  salaryRange: z.string().max(100).optional(),
  published: z.boolean().optional(),
  expiresAt: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val || val === '') return true;
        // Accept both ISO datetime and datetime-local format (YYYY-MM-DDTHH:mm)
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?(Z|[+-]\d{2}:\d{2})?$/;
        const localRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
        return isoRegex.test(val) || localRegex.test(val);
      },
      { message: 'Invalid datetime format' }
    ),
})

export const jobFiltersSchema = z.object({
  location: z.string().optional(),
  department: z.string().optional(),
  jobType: z.string().optional(),
  workPolicy: z.string().optional(),
  experienceLevel: z.string().optional(),
  search: z.string().optional(),
})

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
export type JobFilters = z.infer<typeof jobFiltersSchema>
