import mongoose, { Schema, Document } from 'mongoose'

export interface IJob extends Document {
  _id: string
  companyId: mongoose.Types.ObjectId
  title: string
  slug: string
  description?: string
  workPolicy?: string
  location?: string
  department?: string
  employmentType?: string
  experienceLevel?: string
  jobType?: string
  salaryRange?: string
  postedAt: Date
  expiresAt?: Date
  published: boolean
  createdAt: Date
  updatedAt: Date
}

const JobSchema = new Schema<IJob>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: String,
    workPolicy: String,
    location: String,
    department: String,
    employmentType: String,
    experienceLevel: String,
    jobType: String,
    salaryRange: String,
    postedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    published: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
)

JobSchema.index({ companyId: 1, slug: 1 }, { unique: true })
JobSchema.index({ companyId: 1, published: 1 })

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema)

