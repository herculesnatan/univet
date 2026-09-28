import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { ColaboradorSidebar } from "@/components/layout/colaborador-sidebar"
import { prisma } from "@/lib/prisma"

export default async function ColaboradorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const role = (session.user as any)?.role

  // Se for ADMIN, manda pro admin
  if (role === "ADMIN") {
    redirect("/admin/dashboard")
  }

  // Se no for FUNCIONARIO, no tem acesso
  if (role !== "FUNCIONARIO") {
    redirect("/login")
  }

  // Verifica se o funcionrio est ativo
  const employee = await prisma.employee.findUnique({
    where: { userId: (session.user as any).id }
  })

  if (!employee || !employee.isActive) {
    redirect("/login?error=inactive")
  }

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <ColaboradorSidebar />
      </div>
      <main className="md:pl-72 h-full bg-slate-50 min-h-screen">
        <Header />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
