import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/api-helpers";
import { projectService } from "@/services/project.service";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1),
  clientName: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["active", "paused", "completed", "archived"]).optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const projects = await projectService.getProjects(user.id);
  return NextResponse.json({ success: true, data: projects });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const data = createProjectSchema.parse(body);
    const project = await projectService.createProject(user.id, data);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
