import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB, CompanyUser, Company, Job } from '@/lib/db'
import { createCompanySchema } from '@/lib/validations/company'
import { generateSlug } from '@/lib/utils'
import mongoose from 'mongoose'

// GET /api/companies - List user's companies
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Convert userId string to ObjectId for query
    const userId = new mongoose.Types.ObjectId(session.user.id)
    const companyUsers = await CompanyUser.find({
      userId: userId,
    }).populate('companyId')

    const companies = await Promise.all(
      companyUsers.map(async (cu) => {
        const company = cu.companyId as any
        const jobCount = await Job.countDocuments({ companyId: company._id })
        const userCount = await CompanyUser.countDocuments({ companyId: company._id })

        return {
          ...company.toObject(),
          id: company._id.toString(),
          role: cu.role,
          _count: {
            jobs: jobCount,
            users: userCount,
          },
        }
      })
    )

    return NextResponse.json({
      data: companies,
    })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

// POST /api/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = createCompanySchema.parse(body)

    // Check if slug is already taken
    const existingCompany = await Company.findOne({ slug: validatedData.slug })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company slug already exists' },
        { status: 400 }
      )
    }

    // Create company
    const company = await Company.create({
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description,
      website: validatedData.website,
      logo: validatedData.logo,
    })

    // Associate user as admin
    // Convert userId string to ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id)
    await CompanyUser.create({
      companyId: company._id,
      userId: userId,
      role: 'ADMIN',
    })

    // Create careers page
    const { CareersPage } = await import('@/lib/db')
    await CareersPage.create({
      companyId: company._id,
      published: false,
      seoTitle: `Careers at ${validatedData.name}`,
      seoDescription: validatedData.description || `Join our team at ${validatedData.name}`,
    })

    const jobCount = await Job.countDocuments({ companyId: company._id })
    const userCount = await CompanyUser.countDocuments({ companyId: company._id })

    return NextResponse.json({
      data: {
        ...company.toObject(),
        id: company._id.toString(),
        _count: {
          jobs: jobCount,
          users: userCount,
        },
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}
