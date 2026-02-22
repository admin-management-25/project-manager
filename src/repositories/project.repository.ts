import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { IProject, IProjectUser, ICredential, CreateProjectDTO, UpdateProjectDTO, CreateProjectUserDTO, CreateCredentialDTO } from "@/types";
import { encrypt, decrypt } from "@/lib/encryption";
import { IBaseRepository } from "./base.repository";

export interface IProjectRepository extends IBaseRepository<IProject, CreateProjectDTO, UpdateProjectDTO> {
  findByOwner(ownerId: string): Promise<IProject[]>;
  findByOwnerAndId(ownerId: string, projectId: string): Promise<IProject | null>;
  
  // User operations
  addUser(projectId: string, user: CreateProjectUserDTO): Promise<IProject | null>;
  updateUser(projectId: string, userId: string, data: Partial<CreateProjectUserDTO>): Promise<IProject | null>;
  deleteUser(projectId: string, userId: string): Promise<IProject | null>;
  
  // Credential operations
  addCredential(projectId: string, userId: string, credential: CreateCredentialDTO): Promise<IProject | null>;
  updateCredential(projectId: string, userId: string, credId: string, data: Partial<CreateCredentialDTO>): Promise<IProject | null>;
  deleteCredential(projectId: string, userId: string, credId: string): Promise<IProject | null>;
  rotateCredential(projectId: string, userId: string, credId: string, newValue: string): Promise<IProject | null>;
  getDecryptedCredential(projectId: string, userId: string, credId: string): Promise<string | null>;
}

function encryptCred(value: string): string {
  return encrypt(value);
}

function decryptCred(value: string): string {
  return decrypt(value);
}

function docToProject(doc: any): IProject {
  if (!doc) return doc;
  const obj = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    ...obj,
    _id: obj._id?.toString(),
    users: (obj.users || []).map((u: any) => ({
      ...u,
      _id: u._id?.toString(),
      credentials: (u.credentials || []).map((c: any) => ({
        ...c,
        _id: c._id?.toString(),
        value: "[encrypted]", // Never expose raw encrypted blob
      })),
    })),
  };
}

export class ProjectRepository implements IProjectRepository {
  async findById(id: string): Promise<IProject | null> {
    await connectDB();
    const doc = await Project.findById(id).lean();
    return doc ? docToProject(doc) : null;
  }

  async findAll(filter?: Partial<IProject>): Promise<IProject[]> {
    await connectDB();
    const docs = await Project.find(filter || {}).sort({ updatedAt: -1 }).lean();
    return docs.map(docToProject);
  }

  async findByOwner(ownerId: string): Promise<IProject[]> {
    await connectDB();
    const docs = await Project.find({ ownerId }).sort({ updatedAt: -1 }).lean();
    return docs.map(docToProject);
  }

  async findByOwnerAndId(ownerId: string, projectId: string): Promise<IProject | null> {
    await connectDB();
    const doc = await Project.findOne({ _id: projectId, ownerId }).lean();
    return doc ? docToProject(doc) : null;
  }

  async create(data: CreateProjectDTO & { ownerId: string }): Promise<IProject> {
    await connectDB();
    const usersWithEncryptedCreds = (data.users || []).map((u) => ({
      ...u,
      credentials: (u.credentials || []).map((c) => ({
        ...c,
        value: encryptCred(c.value),
        lastRotatedAt: new Date(),
      })),
    }));
    const doc = await Project.create({ ...data, users: usersWithEncryptedCreds });
    return docToProject(doc.toObject());
  }

  async update(id: string, data: UpdateProjectDTO): Promise<IProject | null> {
    await connectDB();
    const { users, ...rest } = data as any;
    const doc = await Project.findByIdAndUpdate(id, { $set: rest }, { new: true }).lean();
    return doc ? docToProject(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await Project.findByIdAndDelete(id);
    return !!result;
  }

  // ── User operations ──────────────────────────────────────────

  async addUser(projectId: string, user: CreateProjectUserDTO): Promise<IProject | null> {
    await connectDB();
    const userWithEncrypted = {
      ...user,
      credentials: (user.credentials || []).map((c) => ({
        ...c,
        value: encryptCred(c.value),
        lastRotatedAt: new Date(),
      })),
    };
    const doc = await Project.findByIdAndUpdate(
      projectId,
      { $push: { users: userWithEncrypted } },
      { new: true }
    ).lean();
    return doc ? docToProject(doc) : null;
  }

  async updateUser(projectId: string, userId: string, data: Partial<CreateProjectUserDTO>): Promise<IProject | null> {
    await connectDB();
    const { credentials, ...userFields } = data;
    const setPayload: Record<string, any> = {};
    Object.entries(userFields).forEach(([k, v]) => {
      setPayload[`users.$.${k}`] = v;
    });
    const doc = await Project.findOneAndUpdate(
      { _id: projectId, "users._id": userId },
      { $set: setPayload },
      { new: true }
    ).lean();
    return doc ? docToProject(doc) : null;
  }

  async deleteUser(projectId: string, userId: string): Promise<IProject | null> {
    await connectDB();
    const doc = await Project.findByIdAndUpdate(
      projectId,
      { $pull: { users: { _id: userId } } },
      { new: true }
    ).lean();
    return doc ? docToProject(doc) : null;
  }

  // ── Credential operations ─────────────────────────────────────

  async addCredential(projectId: string, userId: string, credential: CreateCredentialDTO): Promise<IProject | null> {
    await connectDB();
    const encryptedCred = {
      ...credential,
      value: encryptCred(credential.value),
      lastRotatedAt: new Date(),
    };
    const doc = await Project.findOneAndUpdate(
      { _id: projectId, "users._id": userId },
      { $push: { "users.$.credentials": encryptedCred } },
      { new: true }
    ).lean();
    return doc ? docToProject(doc) : null;
  }

  async updateCredential(
    projectId: string,
    userId: string,
    credId: string,
    data: Partial<CreateCredentialDTO>
  ): Promise<IProject | null> {
    await connectDB();
    const project = await Project.findOne({ _id: projectId, "users._id": userId });
    if (!project) return null;

    const user = project.users.id(userId);
    if (!user) return null;

    const cred = user.credentials.id(credId);
    if (!cred) return null;

    if (data.value !== undefined) {
      cred.value = encryptCred(data.value);
      cred.lastRotatedAt = new Date();
    }
    if (data.key !== undefined) cred.key = data.key;
    if (data.type !== undefined) cred.type = data.type;
    if (data.label !== undefined) cred.label = data.label;
    if (data.description !== undefined) cred.description = data.description;
    if (data.expiresAt !== undefined) cred.expiresAt = data.expiresAt;
    if (data.needsRotation !== undefined) cred.needsRotation = data.needsRotation;

    await project.save();
    return docToProject(project.toObject());
  }

  async deleteCredential(projectId: string, userId: string, credId: string): Promise<IProject | null> {
    await connectDB();
    const doc = await Project.findOneAndUpdate(
      { _id: projectId, "users._id": userId },
      { $pull: { "users.$.credentials": { _id: credId } } },
      { new: true }
    ).lean();
    return doc ? docToProject(doc) : null;
  }

  async rotateCredential(
    projectId: string,
    userId: string,
    credId: string,
    newValue: string
  ): Promise<IProject | null> {
    return this.updateCredential(projectId, userId, credId, {
      value: newValue,
      needsRotation: false,
    });
  }

  async getDecryptedCredential(projectId: string, userId: string, credId: string): Promise<string | null> {
    await connectDB();
    const project = await Project.findOne({ _id: projectId, "users._id": userId });
    if (!project) return null;
    const user = project.users.id(userId);
    if (!user) return null;
    const cred = user.credentials.id(credId);
    if (!cred) return null;
    return decryptCred(cred.value);
  }
}

export const projectRepository = new ProjectRepository();
