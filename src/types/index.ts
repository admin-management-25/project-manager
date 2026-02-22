export interface ICredential {
  _id?: string;
  key: string;
  value: string; // encrypted
  type: "mongo_url" | "api_key" | "api_secret" | "password" | "token" | "custom";
  label?: string;
  description?: string;
  expiresAt?: Date | null;
  lastRotatedAt?: Date;
  needsRotation?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProjectUser {
  _id?: string;
  name: string;
  email?: string;
  role?: string;
  description?: string;
  credentials: ICredential[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProject {
  _id?: string;
  name: string;
  clientName: string;
  description?: string;
  status: "active" | "paused" | "completed" | "archived";
  color?: string;
  tags?: string[];
  users: IProjectUser[];
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOwner {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt?: Date;
}

// DTOs for API
export type CreateProjectDTO = Omit<IProject, "_id" | "ownerId" | "users" | "createdAt" | "updatedAt"> & {
  users?: CreateProjectUserDTO[];
};

export type UpdateProjectDTO = Partial<CreateProjectDTO>;

export type CreateProjectUserDTO = Omit<IProjectUser, "_id" | "credentials" | "createdAt" | "updatedAt"> & {
  credentials?: CreateCredentialDTO[];
};

export type CreateCredentialDTO = Omit<ICredential, "_id" | "createdAt" | "updatedAt" | "lastRotatedAt"> & {
  value: string;
};

export type UpdateCredentialDTO = Partial<CreateCredentialDTO>;
