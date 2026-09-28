import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any)?.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if ((session.user as any)?.role === "CLIENTE") {
    redirect("/client/dashboard");
  } else if ((session.user as any)?.role === "FUNCIONARIO") {
    redirect("/colaborador/agenda");
  }

  // Fallback
  redirect("/login");
}
