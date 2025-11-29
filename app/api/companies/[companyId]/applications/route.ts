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

