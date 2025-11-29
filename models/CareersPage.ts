import mongoose, { Schema, Document } from 'mongoose'

export interface ICareersPage extends Document {
  _id: string
  companyId: mongoose.Types.ObjectId
  published: boolean
  customDomain?: string
  seoTitle?: string
  seoDescription?: string
  createdAt: Date
  updatedAt: Date
}

const CareersPageSchema = new Schema<ICareersPage>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
    published: { type: Boolean, default: false },
    customDomain: { type: String, unique: true, sparse: true },
    seoTitle: String,
    seoDescription: String,
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.CareersPage || mongoose.model<ICareersPage>('CareersPage', CareersPageSchema)

