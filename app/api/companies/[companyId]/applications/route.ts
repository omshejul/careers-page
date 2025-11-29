import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB, CompanyUser, Company, Job, Application } from '@/lib/db'
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

// GET /api/companies/[companyId]/applications - List all applications for a company
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

    // Get all job IDs for this company
    const jobIds = await Job.find({ companyId }).distinct('_id')

    // Get all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      data: applications.map((app: any) => ({
        ...app,
        id: app._id.toString(),
        jobId: app.jobId._id.toString(),
        job: {
          id: app.jobId._id.toString(),
          title: app.jobId.title,
          slug: app.jobId.slug,
        },
      })),
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST /api/companies/[companyId]/applications - Create a new application
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    await connectDB()
    const { companyId } = await params
    const body = await request.json()

    // Validate input
    const { createApplicationSchema } = await import('@/lib/validations/application')
    const validatedData = createApplicationSchema.parse(body)

    // Verify the job exists and belongs to this company
    const job = await Job.findOne({
      _id: validatedData.jobId,
      companyId: new mongoose.Types.ObjectId(companyId),
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found or does not belong to this company' },
        { status: 404 }
      )
    }

    // Check if job is published
    if (!job.published) {
      return NextResponse.json(
        { error: 'This job is not accepting applications' },
        { status: 400 }
      )
    }

    // Check if job has expired
    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This job posting has expired' },
        { status: 400 }
      )
    }

    // Create application
    const application = await Application.create({
      jobId: validatedData.jobId,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      resumeUrl: validatedData.resumeUrl,
      coverLetter: validatedData.coverLetter,
      linkedinUrl: validatedData.linkedinUrl || undefined,
      portfolioUrl: validatedData.portfolioUrl || undefined,
      status: 'PENDING',
    })

    return NextResponse.json({
      data: {
        ...application.toObject(),
        id: application._id.toString(),
        jobId: application.jobId.toString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}

