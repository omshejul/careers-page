import mongoose, { Schema, Document } from 'mongoose'

export type ApplicationStatus = 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId
  firstName: string
  lastName: string
  email: string
  phone?: string
  resumeUrl: string
  coverLetter?: string
  linkedinUrl?: string
  portfolioUrl?: string
  status: ApplicationStatus
  createdAt: Date
  updatedAt: Date
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    resumeUrl: { type: String, required: true },
    coverLetter: String,
    linkedinUrl: String,
    portfolioUrl: String,
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
)

ApplicationSchema.index({ jobId: 1, status: 1 })
ApplicationSchema.index({ email: 1 })

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema)

