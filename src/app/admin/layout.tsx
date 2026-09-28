import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Proteção da rota
  if (!session) {
    redirect("/login")
  }

  // Verifica se é admin (no futuro, pode aceitar FUNCIONARIO também, a depender da regra)
  if ((session.user as any)?.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
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
