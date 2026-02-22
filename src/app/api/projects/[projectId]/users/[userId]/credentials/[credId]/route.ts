import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/api-helpers";
import { projectService } from "@/services/project.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string; userId: string; credId: string } }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();

    // Handle rotation as a special update
    if (body.action === "rotate") {
      const project = await projectService.rotateCredential(
        user.id,
        params.projectId,
        params.userId,
        params.credId,
        body.newValue
      );
      return NextResponse.json({ success: true, data: project });
    }

    // Handle reveal
    if (body.action === "reveal") {
      const value = await projectService.revealCredential(
        user.id,
        params.projectId,
        params.userId,
        params.credId
      );
      return NextResponse.json({ success: true, data: { value } });
    }

    const project = await projectService.updateCredential(
      user.id,
      params.projectId,
      params.userId,
      params.credId,
      body
    );
    return NextResponse.json({ success: true, data: project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { projectId: string; userId: string; credId: string } }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const project = await projectService.deleteCredential(
      user.id,
      params.projectId,
      params.userId,
      params.credId
    );
    return NextResponse.json({ success: true, data: project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
