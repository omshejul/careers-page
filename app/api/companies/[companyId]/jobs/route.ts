import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB, CompanyUser, Company, Job } from '@/lib/db'
import mongoose from 'mongoose'

// Helper to check company access
async function checkCompanyAccess(userId: string, companyId: string) {
  await connectDB()
  const companyUser = await CompanyUser.findOne({
    companyId: new mongoose.Types.ObjectId(companyId),
    userId: new mongoose.Types.ObjectId(userId),
  })
  return companyUser
}

// GET /api/companies/[companyId]/jobs - List all jobs for a company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { companyId } = await params

    // Check access
    const access = await checkCompanyAccess(session.user.id, companyId)
    if (!access) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const jobs = await Job.find({ companyId })
      .sort({ postedAt: -1 })
      .lean()

    return NextResponse.json({
      data: jobs.map((job: any) => ({
        ...job,
        id: job._id.toString(),
        companyId: job.companyId.toString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// POST /api/companies/[companyId]/jobs - Create a new job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { companyId } = await params

    // Check access
    const access = await checkCompanyAccess(session.user.id, companyId)
    if (!access || access.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { generateSlug } = await import('@/lib/utils')
    
    // Generate slug from title if not provided
    const slug = body.slug || generateSlug(body.title)

    // Check if slug already exists for this company
    const existingJob = await Job.findOne({ companyId, slug })
    if (existingJob) {
      return NextResponse.json(
        { error: 'Job slug already exists for this company' },
        { status: 400 }
      )
    }

    const job = await Job.create({
      companyId,
      title: body.title,
      slug,
      description: body.description,
      workPolicy: body.workPolicy,
      location: body.location,
      department: body.department,
      employmentType: body.employmentType,
      experienceLevel: body.experienceLevel,
      jobType: body.jobType,
      salaryRange: body.salaryRange,
      postedAt: body.postedAt ? new Date(body.postedAt) : new Date(),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      published: body.published !== undefined ? body.published : true,
    })

    return NextResponse.json({
      data: {
        ...job.toObject(),
        id: job._id.toString(),
        companyId: job.companyId.toString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}

