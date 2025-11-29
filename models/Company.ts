import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ICompany extends Document {
  _id: Types.ObjectId
  slug: string
  name: string
  description?: string
  website?: string
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  brandBannerUrl?: string
  createdAt: Date
  updatedAt: Date
}

const CompanySchema = new Schema<ICompany>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    website: String,
    logo: String,
    primaryColor: String,
    secondaryColor: String,
    brandBannerUrl: String,
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema)

