import mongoose, { Schema, Document, Model } from "mongoose";
import { IOwner } from "@/types";

export interface IOwnerDocument extends Omit<IOwner, "_id">, Document {}

const OwnerSchema = new Schema<IOwnerDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const Owner: Model<IOwnerDocument> =
  mongoose.models.Owner || mongoose.model<IOwnerDocument>("Owner", OwnerSchema);
