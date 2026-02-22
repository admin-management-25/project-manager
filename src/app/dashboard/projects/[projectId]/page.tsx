import { getServerSession } from "next-auth";
import { projectService } from "@/services/project.service";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";
import { authOptions } from "@/lib/auth";

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;
  const project = await projectService.getProject(userId, params.projectId);
  if (!project) notFound();

  return <ProjectDetailClient project={project} />;
}
