import mongoose, { Schema, Document } from 'mongoose'

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER'

export interface ICompanyUser extends Document {
  _id: string
  companyId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

const CompanyUserSchema = new Schema<ICompanyUser>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['ADMIN', 'EDITOR', 'VIEWER'], default: 'ADMIN' },
  },
  {
    timestamps: true,
  }
)

CompanyUserSchema.index({ companyId: 1, userId: 1 }, { unique: true })

export default mongoose.models.CompanyUser || mongoose.model<ICompanyUser>('CompanyUser', CompanyUserSchema)

