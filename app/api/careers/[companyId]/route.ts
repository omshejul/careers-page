import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB, CompanyUser, CareersPage, Section } from '@/lib/db'
import { updateCareersPageSchema } from '@/lib/validations/career'
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

// GET /api/careers/[companyId] - Get careers page config
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

    const careersPage = await CareersPage.findOne({ companyId })
      .populate('companyId')
      .lean()

    if (!careersPage) {
      return NextResponse.json(
        { error: 'Careers page not found' },
        { status: 404 }
      )
    }

    const sections = await Section.find({ careersPageId: careersPage._id })
      .sort({ order: 'asc' })
      .lean()

    return NextResponse.json({
      data: {
        ...careersPage,
        id: careersPage._id.toString(),
        companyId: careersPage.companyId.toString(),
        sections: sections.map((s: any) => ({
          ...s,
          id: s._id.toString(),
          careersPageId: s.careersPageId.toString(),
        })),
        company: careersPage.companyId,
      },
    })
  } catch (error) {
    console.error('Error fetching careers page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch careers page' },
      { status: 500 }
    )
  }
}

// PATCH /api/careers/[companyId] - Update careers page settings
export async function PATCH(
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
    const validatedData = updateCareersPageSchema.parse(body)

    const careersPage = await CareersPage.findOneAndUpdate(
      { companyId },
      validatedData,
      { new: true }
    )

    if (!careersPage) {
      return NextResponse.json(
        { error: 'Careers page not found' },
        { status: 404 }
      )
    }

    const sections = await Section.find({ careersPageId: careersPage._id })
      .sort({ order: 'asc' })
      .lean()

    return NextResponse.json({
      data: {
        ...careersPage.toObject(),
        id: careersPage._id.toString(),
        sections: sections.map((s: any) => ({
          ...s,
          id: s._id.toString(),
          careersPageId: s.careersPageId.toString(),
        })),
      },
    })
  } catch (error) {
    console.error('Error updating careers page:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update careers page' },
      { status: 500 }
    )
  }
}
