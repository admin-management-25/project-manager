import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, unauthorized, notFound } from "@/lib/api-helpers";
import { projectService } from "@/services/project.service";

export async function GET(_: NextRequest, { params }: { params: { projectId: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const project = await projectService.getProject(user.id, params.projectId);
  if (!project) return notFound("Project not found");

  return NextResponse.json({ success: true, data: project });
}

export async function PATCH(req: NextRequest, { params }: { params: { projectId: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const project = await projectService.updateProject(user.id, params.projectId, body);
    return NextResponse.json({ success: true, data: project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { projectId: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    await projectService.deleteProject(user.id, params.projectId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
