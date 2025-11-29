import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB, CompanyUser, CareersPage, Section } from '@/lib/db'
import { updateSectionSchema } from '@/lib/validations/career'
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

// PATCH /api/careers/[companyId]/sections/[sectionId] - Update section
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; sectionId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { companyId, sectionId } = await params

    // Check access
    const access = await checkCompanyAccess(session.user.id, companyId)
    if (!access || access.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Verify section belongs to company
    const careersPage = await CareersPage.findOne({ companyId })

    if (!careersPage) {
      return NextResponse.json(
        { error: 'Careers page not found' },
        { status: 404 }
      )
    }

    const section = await Section.findOne({
      _id: sectionId,
      careersPageId: careersPage._id,
    })

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateSectionSchema.parse(body)

    Object.assign(section, validatedData)
    await section.save()

    return NextResponse.json({
      data: {
        ...section.toObject(),
        id: section._id.toString(),
        careersPageId: section.careersPageId.toString(),
      },
    })
  } catch (error) {
    console.error('Error updating section:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    )
  }
}

// DELETE /api/careers/[companyId]/sections/[sectionId] - Delete section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; sectionId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { companyId, sectionId } = await params

    // Check access
    const access = await checkCompanyAccess(session.user.id, companyId)
    if (!access || access.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Verify section belongs to company
    const careersPage = await CareersPage.findOne({ companyId })

    if (!careersPage) {
      return NextResponse.json(
        { error: 'Careers page not found' },
        { status: 404 }
      )
    }

    const section = await Section.findOneAndDelete({
      _id: sectionId,
      careersPageId: careersPage._id,
    })

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Section deleted successfully' })
  } catch (error) {
    console.error('Error deleting section:', error)
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    )
  }
}
