import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB, CompanyUser, CareersPage, Section } from '@/lib/db'
import { createSectionSchema } from '@/lib/validations/career'
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

// POST /api/careers/[companyId]/sections - Create new section
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

    // Get careers page ID
    const careersPage = await CareersPage.findOne({ companyId })

    if (!careersPage) {
      return NextResponse.json(
        { error: 'Careers page not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = createSectionSchema.parse(body)

    const section = await Section.create({
      careersPageId: careersPage._id,
      type: validatedData.type,
      order: validatedData.order,
      enabled: validatedData.enabled,
      data: validatedData.data as any,
    })

    return NextResponse.json({
      data: {
        ...section.toObject(),
        id: section._id.toString(),
        careersPageId: section.careersPageId.toString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating section:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create section' },
      { status: 500 }
    )
  }
}
