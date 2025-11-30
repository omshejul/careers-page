import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB, CompanyUser, Application } from '@/lib/db'
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

// PATCH /api/companies/[companyId]/applications/[applicationId] - Update application status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; applicationId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { companyId, applicationId } = await params

    // Check access
    const access = await checkCompanyAccess(session.user.id, companyId)
    if (!access || access.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const application = await Application.findById(applicationId).populate('jobId')
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Verify the job belongs to this company
    const job = application.jobId as any
    if (job.companyId.toString() !== companyId) {
      return NextResponse.json(
        { error: 'Application does not belong to this company' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validStatuses = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED']

    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (body.status !== undefined) updateData.status = body.status

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    ).populate('jobId')

    return NextResponse.json({
      data: {
        ...updatedApplication!.toObject(),
        id: updatedApplication!._id.toString(),
        jobId: (updatedApplication!.jobId as any)._id.toString(),
        job: {
          id: (updatedApplication!.jobId as any)._id.toString(),
          title: (updatedApplication!.jobId as any).title,
        },
      },
    })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

