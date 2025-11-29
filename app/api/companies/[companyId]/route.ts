import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB, CompanyUser, Company, Job } from '@/lib/db'
import { updateCompanySchema } from '@/lib/validations/company'
import mongoose from 'mongoose'

// Helper to check if user has access to company
async function checkCompanyAccess(userId: string, companyId: string) {
  await connectDB()
  const companyUser = await CompanyUser.findOne({
    companyId: new mongoose.Types.ObjectId(companyId),
    userId: new mongoose.Types.ObjectId(userId),
  })
  return companyUser
}

// GET /api/companies/[companyId] - Get company details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    await connectDB()
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

    const company = await Company.findById(companyId)

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    const jobCount = await Job.countDocuments({ companyId })
    const userCount = await CompanyUser.countDocuments({ companyId })

    return NextResponse.json({
      data: {
        ...company.toObject(),
        id: company._id.toString(),
        _count: {
          jobs: jobCount,
          users: userCount,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

// PATCH /api/companies/[companyId] - Update company
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    await connectDB()
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { companyId } = await params

    // Check access and role
    const access = await checkCompanyAccess(session.user.id, companyId)
    if (!access || access.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateCompanySchema.parse(body)

    const company = await Company.findByIdAndUpdate(
      companyId,
      validatedData,
      { new: true }
    )

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        ...company.toObject(),
        id: company._id.toString(),
      },
    })
  } catch (error) {
    console.error('Error updating company:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}

// DELETE /api/companies/[companyId] - Delete company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    await connectDB()
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { companyId } = await params

    // Check access and role (only ADMIN can delete)
    const access = await checkCompanyAccess(session.user.id, companyId)
    if (!access || access.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can delete companies' },
        { status: 403 }
      )
    }

    await Company.findByIdAndDelete(companyId)

    return NextResponse.json({ message: 'Company deleted successfully' })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    )
  }
}
