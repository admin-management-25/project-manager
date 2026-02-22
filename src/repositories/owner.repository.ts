import { connectDB } from "@/lib/db";
import { Owner } from "@/models/Owner";
import { IOwner } from "@/types";
import { IBaseRepository } from "./base.repository";

export interface IOwnerRepository extends IBaseRepository<IOwner, Omit<IOwner, "_id" | "createdAt">> {
  findByEmail(email: string): Promise<IOwner | null>;
}

export class OwnerRepository implements IOwnerRepository {
  async findByEmail(email: string): Promise<IOwner | null> {
    await connectDB();
    const doc = await Owner.findOne({ email: email.toLowerCase() }).lean();
    return doc ? this.toPlain(doc) : null;
  }

  async findById(id: string): Promise<IOwner | null> {
    await connectDB();
    const doc = await Owner.findById(id).lean();
    return doc ? this.toPlain(doc) : null;
  }

  async findAll(): Promise<IOwner[]> {
    await connectDB();
    const docs = await Owner.find().lean();
    return docs.map(this.toPlain);
  }

  async create(data: Omit<IOwner, "_id" | "createdAt">): Promise<IOwner> {
    await connectDB();
    const doc = await Owner.create(data);
    return this.toPlain(doc.toObject());
  }

  async update(id: string, data: Partial<IOwner>): Promise<IOwner | null> {
    await connectDB();
    const doc = await Owner.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    return doc ? this.toPlain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await Owner.findByIdAndDelete(id);
    return !!result;
  }

  private toPlain(doc: any): IOwner {
    const { _id, __v, ...rest } = doc;
    return { _id: _id.toString(), ...rest };
  }
}

// Singleton instance
export const ownerRepository = new OwnerRepository();
