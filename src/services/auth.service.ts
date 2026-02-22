import bcrypt from "bcryptjs";
import { ownerRepository } from "@/repositories/owner.repository";
import { IOwner } from "@/types";

export class AuthService {
  async register(name: string, email: string, password: string): Promise<Omit<IOwner, "passwordHash">> {
    const existing = await ownerRepository.findByEmail(email);
    if (existing) throw new Error("Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    const owner = await ownerRepository.create({ name, email, passwordHash });
    const { passwordHash: _, ...safeOwner } = owner;
    return safeOwner;
  }

  async validateCredentials(email: string, password: string): Promise<Omit<IOwner, "passwordHash"> | null> {
    const owner = await ownerRepository.findByEmail(email);
    if (!owner) return null;

    const valid = await bcrypt.compare(password, owner.passwordHash);
    if (!valid) return null;

    const { passwordHash: _, ...safeOwner } = owner;
    return safeOwner;
  }
}

export const authService = new AuthService();
