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

    if (!careersPage || Array.isArray(careersPage)) {
      return NextResponse.json(
        { error: 'Careers page not found' },
        { status: 404 }
      )
    }

    const careersPageObj = careersPage as any

    const sections = await Section.find({ careersPageId: careersPageObj._id })
      .sort({ order: 'asc' })
      .lean()

    return NextResponse.json({
      data: {
        ...careersPageObj,
        id: careersPageObj._id.toString(),
        companyId: careersPageObj.companyId.toString(),
        sections: sections.map((s: any) => ({
          ...s,
          id: s._id.toString(),
          careersPageId: s.careersPageId.toString(),
        })),
        company: careersPageObj.companyId,
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

    let publishCompleteTime: Date | null = null

    // If publishing, copy all sections' data to publishedData
    if (validatedData.published === true) {
      const existingCareersPage = await CareersPage.findOne({ companyId })
      if (existingCareersPage) {
        // Copy data to publishedData for all sections
        await Section.updateMany(
          { careersPageId: existingCareersPage._id },
          [{ $set: { publishedData: '$data' } }]
        )

        // Get the timestamp from MongoDB directly (from the section we just updated)
        // This avoids clock skew issues between Node.js and MongoDB servers
        const latestUpdatedSection = await Section.findOne(
          { careersPageId: existingCareersPage._id }
        ).sort({ updatedAt: -1 }).select('updatedAt').lean() as { updatedAt?: Date } | null

        publishCompleteTime = latestUpdatedSection?.updatedAt || new Date()

        // Clear the unpublished changes flag
        validatedData.hasUnpublishedChanges = false
      }
    }

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

    // Final consistency check: if any section was modified AFTER our publish completed
    // (by a concurrent request), re-set the flag to true
    if (publishCompleteTime) {
      const concurrentlyModified = await Section.countDocuments({
        careersPageId: careersPage._id,
        updatedAt: { $gt: publishCompleteTime }
      })

      if (concurrentlyModified > 0) {
        await CareersPage.findByIdAndUpdate(careersPage._id, {
          hasUnpublishedChanges: true
        })
      }
    }

    const sections = await Section.find({ careersPageId: careersPage._id })
      .sort({ order: 'asc' })
      .lean()

    // Re-fetch the careers page to get the latest hasUnpublishedChanges value
    const updatedCareersPage = await CareersPage.findById(careersPage._id)

    return NextResponse.json({
      data: {
        ...(updatedCareersPage?.toObject() || careersPage.toObject()),
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
