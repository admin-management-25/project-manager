import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/api-helpers";
import { projectService } from "@/services/project.service";

export async function PATCH(req: NextRequest, { params }: { params: { projectId: string; userId: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const project = await projectService.updateUser(user.id, params.projectId, params.userId, body);
    return NextResponse.json({ success: true, data: project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { projectId: string; userId: string } }) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const project = await projectService.deleteUser(user.id, params.projectId, params.userId);
    return NextResponse.json({ success: true, data: project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
