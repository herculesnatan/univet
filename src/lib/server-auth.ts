import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    throw new Error("Não autenticado")
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if ((session.user as any).role !== "ADMIN") {
    throw new Error("Acesso negado. Apenas administradores.")
  }
  return session
}

export async function requireEmployeeOrAdmin() {
  const session = await requireAuth()
  const role = (session.user as any).role
  
  if (role === "ADMIN") {
    return { session, isAdmin: true, employeeId: null }
  }
  
  if (role === "FUNCIONARIO") {
    const employee = await prisma.employee.findUnique({
      where: { userId: (session.user as any).id }
    })
    
    if (!employee || !employee.isActive) {
      throw new Error("Acesso de colaborador desativado ou inválido.")
    }
    
    return { session, isAdmin: false, employeeId: employee.id }
  }
  
  throw new Error("Acesso negado.")
}
