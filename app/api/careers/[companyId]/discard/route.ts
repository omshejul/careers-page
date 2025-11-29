import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB, CompanyUser, CareersPage, Section } from '@/lib/db'
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

// POST /api/careers/[companyId]/discard - Discard draft changes and revert to published version
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

        const careersPage = await CareersPage.findOne({ companyId })

        if (!careersPage) {
            return NextResponse.json(
                { error: 'Careers page not found' },
                { status: 404 }
            )
        }

        // Can only discard if the page has been published (there's something to revert to)
        if (!careersPage.published) {
            return NextResponse.json(
                { error: 'Cannot discard changes on an unpublished page' },
                { status: 400 }
            )
        }

        // Revert all sections: copy publishedData back to data
        // Only update sections that have publishedData
        // Also restore any soft-deleted sections that have publishedData
        await Section.updateMany(
            {
                careersPageId: careersPage._id,
                publishedData: { $exists: true, $ne: null }
            },
            [
                {
                    $set: {
                        data: '$publishedData',
                        order: { $ifNull: ['$publishedOrder', '$order'] },
                        enabled: { $ifNull: ['$publishedEnabled', '$enabled'] },
                    },
                    $unset: { deletedAt: 1 }
                }
            ]
        )

        // Delete any sections that don't have publishedData (they were added after last publish)
        await Section.deleteMany({
            careersPageId: careersPage._id,
            $or: [
                { publishedData: { $exists: false } },
                { publishedData: null }
            ]
        })

        // Clear the unpublished changes flag
        await CareersPage.findByIdAndUpdate(careersPage._id, {
            hasUnpublishedChanges: false
        })

        return NextResponse.json({
            message: 'Draft changes discarded successfully'
        })
    } catch (error) {
        console.error('Error discarding changes:', error)
        return NextResponse.json(
            { error: 'Failed to discard changes' },
            { status: 500 }
        )
    }
}

