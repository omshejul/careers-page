import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  _id: string
  email: string
  name?: string
  image?: string
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: String,
    image: String,
    emailVerified: Date,
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

