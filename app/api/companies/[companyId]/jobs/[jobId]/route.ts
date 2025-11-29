import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB, CompanyUser, Job } from '@/lib/db'
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

// PATCH /api/companies/[companyId]/jobs/[jobId] - Update a job
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; jobId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { companyId, jobId } = await params

    // Check access
    const access = await checkCompanyAccess(session.user.id, companyId)
    if (!access || access.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const job = await Job.findOne({ _id: jobId, companyId })
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.description !== undefined) updateData.description = body.description
    if (body.workPolicy !== undefined) updateData.workPolicy = body.workPolicy
    if (body.location !== undefined) updateData.location = body.location
    if (body.department !== undefined) updateData.department = body.department
    if (body.employmentType !== undefined) updateData.employmentType = body.employmentType
    if (body.experienceLevel !== undefined) updateData.experienceLevel = body.experienceLevel
    if (body.jobType !== undefined) updateData.jobType = body.jobType
    if (body.salaryRange !== undefined) updateData.salaryRange = body.salaryRange
    if (body.postedAt !== undefined) updateData.postedAt = new Date(body.postedAt)
    if (body.expiresAt !== undefined) updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    if (body.published !== undefined) updateData.published = body.published

    const updatedJob = await Job.findByIdAndUpdate(jobId, updateData, { new: true })

    return NextResponse.json({
      data: {
        ...updatedJob!.toObject(),
        id: updatedJob!._id.toString(),
        companyId: updatedJob!.companyId.toString(),
      },
    })
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

// DELETE /api/companies/[companyId]/jobs/[jobId] - Delete a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; jobId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { companyId, jobId } = await params

    // Check access
    const access = await checkCompanyAccess(session.user.id, companyId)
    if (!access || access.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const job = await Job.findOne({ _id: jobId, companyId })
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    await Job.findByIdAndDelete(jobId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}

