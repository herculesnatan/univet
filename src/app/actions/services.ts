"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/server-auth"

export async function getServices(q?: string) {
  await requireAdmin();
  return await prisma.service.findMany({
    where: q ? {
      OR: [
        { name: { contains: q } },
        { description: { contains: q } }
      ]
    } : undefined,
    include: {
      employees: {
        include: { user: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function getServiceById(id: string) {
  await requireAdmin();
  return await prisma.service.findUnique({
    where: { id },
    include: {
      employees: true
    }
  })
}

export async function createService(data: {
  name: string
  description?: string
  price: number
  durationMin: number
  employeeIds: string[]
}) {
  try {
    if (data.price < 0) return { success: false, error: "O preço não pode ser negativo." }
    if (data.durationMin <= 0) return { success: false, error: "A duração deve ser maior que zero." }
    if (!data.name.trim()) return { success: false, error: "O nome do serviço é obrigatório." }

    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        durationMin: data.durationMin,
        employees: {
          connect: data.employeeIds.map(id => ({ id }))
        }
      },
      include: {
        employees: { include: { user: true } }
      }
    })
    
    revalidatePath("/admin/servicos")
    return { success: true, service }
  } catch (error) {
    console.error("Erro ao criar serviço:", error)
    return { success: false, error: "Falha ao criar o serviço." }
  }
}

export async function updateService(id: string, data: {
  name: string
  description?: string
  price: number
  durationMin: number
  employeeIds: string[]
  isActive: boolean
}) {
  try {
    if (data.price < 0) return { success: false, error: "O preço não pode ser negativo." }
    if (data.durationMin <= 0) return { success: false, error: "A duração deve ser maior que zero." }
    if (!data.name.trim()) return { success: false, error: "O nome do serviço é obrigatório." }

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        durationMin: data.durationMin,
        isActive: data.isActive,
        employees: {
          set: data.employeeIds.map(empId => ({ id: empId }))
        }
      },
      include: {
        employees: { include: { user: true } }
      }
    })
    
    revalidatePath("/admin/servicos")
    revalidatePath(`/admin/servicos/${id}/editar`)
    return { success: true, service }
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error)
    return { success: false, error: "Falha ao atualizar o serviço." }
  }
}

export async function toggleServiceStatus(id: string, currentStatus: boolean) {
  await requireAdmin();
  try {
    await prisma.service.update({
      where: { id },
      data: { isActive: !currentStatus }
    })
    revalidatePath("/admin/servicos")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Falha ao atualizar o status do serviço." }
  }
}
