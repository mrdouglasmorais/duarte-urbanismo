import mongoose, { Schema, Document, Model } from 'mongoose';
import { connectMongo } from '@/lib/mongoose';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CORRETOR';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'CORRETOR'],
      required: true,
      default: 'CORRETOR',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      required: true,
      default: 'PENDING',
    },
    avatarUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
UserSchema.index({ email: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ role: 1 });

let UserModel: Model<IUser>;

async function getModel() {
  if (UserModel) {
    return UserModel;
  }

  await connectMongo();
  UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
  return UserModel;
}

export async function getUserModel(): Promise<Model<IUser>> {
  return getModel();
}

export type UserDocument = IUser;

