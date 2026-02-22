import { getServerSession } from "next-auth";
import { projectService } from "@/services/project.service";
import { ProjectsClient } from "@/components/projects/ProjectsClient";
import { authOptions } from "@/lib/auth";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;
  const projects = await projectService.getProjects(userId);

  return <ProjectsClient initialProjects={projects} />;
}
