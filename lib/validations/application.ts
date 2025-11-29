import { z } from 'zod'

export const createApplicationSchema = z.object({
  jobId: z.string().cuid('Invalid job ID'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional(),
  resumeUrl: z.string().url('Invalid resume URL').min(1, 'Resume is required'),
  coverLetter: z.string().max(5000).optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
})

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED']),
})

export const applicationFiltersSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED']).optional(),
  jobId: z.string().optional(),
  search: z.string().optional(), // Search by name or email
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>
export type ApplicationFilters = z.infer<typeof applicationFiltersSchema>
