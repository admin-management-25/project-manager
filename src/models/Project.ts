import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IProject } from "@/types";

// Credential subdocument
const CredentialSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true }, // AES-encrypted
    type: {
      type: String,
      enum: ["mongo_url", "api_key", "api_secret", "password", "token", "custom"],
      default: "custom",
    },
    label: { type: String, trim: true },
    description: { type: String },
    expiresAt: { type: Date, default: null },
    lastRotatedAt: { type: Date, default: Date.now },
    needsRotation: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ProjectUser subdocument
const ProjectUserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    role: { type: String, trim: true },
    description: { type: String },
    credentials: { type: [CredentialSchema], default: [] },
  },
  { timestamps: true }
);

// Project document
export interface IProjectDocument extends Omit<IProject, "_id" | "users">, Document {
  users: Types.DocumentArray<any>;
}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    name: { type: String, required: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "archived"],
      default: "active",
    },
    color: { type: String, default: "#6e6456" },
    tags: [{ type: String, trim: true }],
    users: { type: [ProjectUserSchema], default: [] },
    ownerId: { type: String, required: true },
  },
  { timestamps: true }
);

ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ status: 1 });

export const Project: Model<IProjectDocument> =
  mongoose.models.Project || mongoose.model<IProjectDocument>("Project", ProjectSchema);
