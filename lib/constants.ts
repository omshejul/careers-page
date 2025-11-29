export const SECTION_TYPES = {
  HERO: 'HERO',
  ABOUT: 'ABOUT',
  VALUES: 'VALUES',
  BENEFITS: 'BENEFITS',
  CULTURE_VIDEO: 'CULTURE_VIDEO',
  TEAM_LOCATIONS: 'TEAM_LOCATIONS',
  JOBS_LIST: 'JOBS_LIST',
} as const

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_RESUME_SIZE = 10 * 1024 * 1024 // 10MB

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
} as const

export const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  SHORTLISTED: 'SHORTLISTED',
  REJECTED: 'REJECTED',
  HIRED: 'HIRED',
} as const

export const DEFAULT_SECTIONS = [
  {
    type: 'HERO' as const,
    order: 0,
    enabled: true,
    data: {
      title: 'Join Our Team',
      tagline: 'Build the future with us',
      bannerUrl: '',
    },
  },
  {
    type: 'ABOUT' as const,
    order: 1,
    enabled: true,
    data: {
      title: 'About Us',
      content: 'We are building something amazing.',
    },
  },
  {
    type: 'VALUES' as const,
    order: 2,
    enabled: true,
    data: {
      title: 'Our Values',
      values: [],
    },
  },
  {
    type: 'BENEFITS' as const,
    order: 3,
    enabled: true,
    data: {
      title: 'Benefits',
      benefits: [],
    },
  },
  {
    type: 'JOBS_LIST' as const,
    order: 4,
    enabled: true,
    data: {
      title: 'Open Positions',
      subtitle: 'Find your next opportunity',
    },
  },
]
