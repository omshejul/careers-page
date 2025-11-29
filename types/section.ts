export type SectionType = 'HERO' | 'ABOUT' | 'VALUES' | 'BENEFITS' | 'CULTURE_VIDEO' | 'TEAM_LOCATIONS' | 'JOBS_LIST'

export interface BaseSection {
  id: string
  type: SectionType
  order: number
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export interface HeroSection extends BaseSection {
  type: 'HERO'
  data: {
    title: string
    tagline?: string
    bannerUrl?: string
  }
}

export interface AboutSection extends BaseSection {
  type: 'ABOUT'
  data: {
    title: string
    content: string
  }
}

export interface ValuesSection extends BaseSection {
  type: 'VALUES'
  data: {
    title: string
    values: {
      title: string
      description: string
      icon?: string
    }[]
  }
}

export interface BenefitsSection extends BaseSection {
  type: 'BENEFITS'
  data: {
    title: string
    benefits: {
      title: string
      description: string
      icon?: string
    }[]
  }
}

export interface CultureVideoSection extends BaseSection {
  type: 'CULTURE_VIDEO'
  data: {
    title: string
    videoUrl: string
    description?: string
  }
}

export interface TeamLocationsSection extends BaseSection {
  type: 'TEAM_LOCATIONS'
  data: {
    title: string
    locations: {
      city: string
      country: string
      address?: string
      imageUrl?: string
    }[]
  }
}

export interface JobsListSection extends BaseSection {
  type: 'JOBS_LIST'
  data: {
    title: string
    subtitle?: string
  }
}

export type TypedSection =
  | HeroSection
  | AboutSection
  | ValuesSection
  | BenefitsSection
  | CultureVideoSection
  | TeamLocationsSection
  | JobsListSection

export type SectionData = TypedSection['data']
