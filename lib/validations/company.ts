import { z } from 'zod'

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  primaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid primary color')
    .optional()
    .or(z.literal('')),
  secondaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid secondary color')
    .optional()
    .or(z.literal('')),
  brandBannerUrl: z
    .string()
    .url('Invalid banner URL')
    .optional()
    .or(z.literal('')),
})

export const updateCompanySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string().max(1000).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  logo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  primaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid primary color')
    .optional()
    .or(z.literal('')),
  secondaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid secondary color')
    .optional()
    .or(z.literal('')),
  brandBannerUrl: z
    .string()
    .url('Invalid banner URL')
    .optional()
    .or(z.literal('')),
})

export const addCompanyMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
})

export const updateCompanyMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']),
})

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
export type AddCompanyMemberInput = z.infer<typeof addCompanyMemberSchema>
export type UpdateCompanyMemberRoleInput = z.infer<typeof updateCompanyMemberRoleSchema>
