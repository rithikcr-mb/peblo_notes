import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NotesWorkspace } from "@/components/workspace/notes-workspace";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <NotesWorkspace />;
}
