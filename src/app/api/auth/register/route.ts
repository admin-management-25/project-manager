import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);
    const owner = await authService.register(data.name, data.email, data.password);
    return NextResponse.json({ success: true, data: owner }, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Registration failed" }, { status: 400 });
  }
}
