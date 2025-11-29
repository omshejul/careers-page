// MongoDB model types
import type { ICompany } from '@/models/Company'
import type { IUser } from '@/models/User'
import type { IJob } from '@/models/Job'
import type { IApplication } from '@/models/Application'
import type { ICareersPage } from '@/models/CareersPage'
import type { ISection } from '@/models/Section'

// Extended types with relations
export type CompanyWithUsers = ICompany & {
  users: {
    id: string
    role: string
    user: IUser
  }[]
}

export type JobWithCompany = IJob & {
  company: ICompany
  _count?: {
    applications: number
  }
}

export type ApplicationWithJob = IApplication & {
  job: IJob & {
    company: ICompany
  }
}

export type CareersPageWithSections = ICareersPage & {
  sections: ISection[]
  company: ICompany
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Session type extension
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    }
  }
}
