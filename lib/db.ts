import connectDB from './mongodb'
import User from '@/models/User'
import Account from '@/models/Account'
import Session from '@/models/Session'
import VerificationToken from '@/models/VerificationToken'
import Company from '@/models/Company'
import CompanyUser from '@/models/CompanyUser'
import CareersPage from '@/models/CareersPage'
import Section from '@/models/Section'
import Job from '@/models/Job'
import Application from '@/models/Application'

// Ensure database connection
export async function getDb() {
  await connectDB()
  return {
    User,
    Account,
    Session,
    VerificationToken,
    Company,
    CompanyUser,
    CareersPage,
    Section,
    Job,
    Application,
  }
}

// Export models for direct use
export {
  User,
  Account,
  Session,
  VerificationToken,
  Company,
  CompanyUser,
  CareersPage,
  Section,
  Job,
  Application,
}

// Export connection function
export { default as connectDB } from './mongodb'

