import mongoose, { Schema, Document } from 'mongoose'

export type SectionType = 'HERO' | 'ABOUT' | 'VALUES' | 'BENEFITS' | 'CULTURE_VIDEO' | 'TEAM_LOCATIONS' | 'JOBS_LIST'

export interface ISection extends Document {
  _id: string
  careersPageId: mongoose.Types.ObjectId
  type: SectionType
  order: number
  enabled: boolean
  data: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const SectionSchema = new Schema<ISection>(
  {
    careersPageId: { type: Schema.Types.ObjectId, ref: 'CareersPage', required: true },
    type: {
      type: String,
      enum: ['HERO', 'ABOUT', 'VALUES', 'BENEFITS', 'CULTURE_VIDEO', 'TEAM_LOCATIONS', 'JOBS_LIST'],
      required: true,
    },
    order: { type: Number, required: true },
    enabled: { type: Boolean, default: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Section || mongoose.model<ISection>('Section', SectionSchema)

