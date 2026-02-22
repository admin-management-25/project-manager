import { projectRepository } from "@/repositories/project.repository";
import {
  IProject,
  CreateProjectDTO,
  UpdateProjectDTO,
  CreateProjectUserDTO,
  CreateCredentialDTO,
} from "@/types";

export class ProjectService {
  async getProjects(ownerId: string): Promise<IProject[]> {
    return projectRepository.findByOwner(ownerId);
  }

  async getProject(ownerId: string, projectId: string): Promise<IProject | null> {
    return projectRepository.findByOwnerAndId(ownerId, projectId);
  }

  async createProject(ownerId: string, data: CreateProjectDTO): Promise<IProject> {
    return projectRepository.create({ ...data, ownerId } as any);
  }

  async updateProject(ownerId: string, projectId: string, data: UpdateProjectDTO): Promise<IProject | null> {
    const project = await projectRepository.findByOwnerAndId(ownerId, projectId);
    if (!project) throw new Error("Project not found");
    return projectRepository.update(projectId, data);
  }

  async deleteProject(ownerId: string, projectId: string): Promise<boolean> {
    const project = await projectRepository.findByOwnerAndId(ownerId, projectId);
    if (!project) throw new Error("Project not found");
    return projectRepository.delete(projectId);
  }

  async addUser(ownerId: string, projectId: string, user: CreateProjectUserDTO): Promise<IProject | null> {
    const project = await projectRepository.findByOwnerAndId(ownerId, projectId);
    if (!project) throw new Error("Project not found");
    return projectRepository.addUser(projectId, user);
  }

  async updateUser(ownerId: string, projectId: string, userId: string, data: Partial<CreateProjectUserDTO>): Promise<IProject | null> {
    const project = await projectRepository.findByOwnerAndId(ownerId, projectId);
    if (!project) throw new Error("Project not found");
    return projectRepository.updateUser(projectId, userId, data);
  }

  async deleteUser(ownerId: string, projectId: string, userId: string): Promise<IProject | null> {
    const project = await projectRepository.findByOwnerAndId(ownerId, projectId);
    if (!project) throw new Error("Project not found");
    return projectRepository.deleteUser(projectId, userId);
  }

  async addCredential(ownerId: string, projectId: string, userId: string, cred: CreateCredentialDTO): Promise<IProject | null> {
    const project = await projectRepository.findByOwnerAndId(ownerId, projectId);
    if (!project) throw new Error("Project not found");
    return projectRepository.addCredential(projectId, userId, cred);
  }

  async updateCredential(ownerId: string, projectId: string, userId: string, credId: string, data: Partial<CreateCredentialDTO>): Promise<IProject | null> {
    const project = await projectRepository.findByOwnerAndId(ownerId, projectId);
    if (!project) throw new Error("Project not found");
    return projectRepository.updateCredential(projectId, userId, credId, data);
  }

  async deleteCredential(ownerId: string, projectId: string, userId: string, credId: string): Promise<IProject | null> {
    const project = await projectRepository.findByOwnerAndId(ownerId, projectId);
    if (!project) throw new Error("Project not found");
    return projectRepository.deleteCredential(projectId, userId, credId);
  }

  async rotateCredential(ownerId: string, projectId: string, userId: string, credId: string, newValue: string): Promise<IProject | null> {
    const project = await projectRepository.findByOwnerAndId(ownerId, projectId);
    if (!project) throw new Error("Project not found");
    return projectRepository.rotateCredential(projectId, userId, credId, newValue);
  }

  async revealCredential(ownerId: string, projectId: string, userId: string, credId: string): Promise<string | null> {
    const project = await projectRepository.findByOwnerAndId(ownerId, projectId);
    if (!project) throw new Error("Project not found");
    return projectRepository.getDecryptedCredential(projectId, userId, credId);
  }
}

export const projectService = new ProjectService();
