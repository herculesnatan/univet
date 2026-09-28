"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/server-auth"
import { hash } from "bcryptjs"

export async function getEmployees() {
  await requireAdmin();
  return await prisma.employee.findMany({
    include: {
      user: true,
      services: true
    },
    orderBy: { user: { name: 'asc' } }
  })
}

export async function getActiveEmployees() {
  await requireAdmin();
  return await prisma.employee.findMany({
    where: { isActive: true },
    include: { user: true },
    orderBy: { user: { name: 'asc' } }
  })
}

export async function createEmployee(data: {
  name: string
  email: string
  phone: string
  serviceIds: string[]
}) {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existing) {
      return { success: false, error: "Este email já está em uso." }
    }

    // Gerar uma senha padrão temporária para o colaborador (ele pode mudar depois)
    const hashedPassword = await hash("senha123", 10)

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "FUNCIONARIO",
        employee: {
          create: {
            phone: data.phone,
            services: {
              connect: data.serviceIds.map(id => ({ id }))
            }
          }
        }
      }
    })

    revalidatePath("/admin/servicos")
    return { success: true }
  } catch (error: any) {
    console.error("Error creating employee:", error)
    return { success: false, error: "Erro ao criar colaborador." }
  }
}

export async function toggleEmployee(id: string, isActive: boolean) {
  await requireAdmin();
  try {
    await prisma.employee.update({
      where: { id },
      data: { isActive: !isActive }
    })
    revalidatePath("/admin/servicos")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Erro ao alterar status." }
  }
}
