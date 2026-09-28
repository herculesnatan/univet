"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/server-auth"

export async function getPets() {
  await requireAdmin();
  return await prisma.pet.findMany({
    include: {
      client: {
        include: {
          user: true
        }
      },
      _count: {
        select: { appointments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getClientOptions() {
  await requireAdmin();
  return await prisma.client.findMany({
    where: { isActive: true },
    include: { user: true },
    orderBy: { user: { name: 'asc' } }
  })
}

export async function createPet(data: {
  clientId: string
  name: string
  species: string
  breed?: string
  sex: string
  birthDate?: string // ISO format YYYY-MM-DD
  weight?: string
  size: string
  color?: string
  notes?: string
}) {
  try {
    const pet = await prisma.pet.create({
      data: {
        clientId: data.clientId,
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        sex: data.sex,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        size: data.size,
        color: data.color || null,
        notes: data.notes || null,
      }
    })

    revalidatePath("/admin/pets")
    revalidatePath(`/admin/clientes/${data.clientId}`)
    return { success: true, pet }

  } catch (error) {
    console.error("Erro ao criar pet:", error)
    return { success: false, error: "Falha ao cadastrar o pet." }
  }
}

export async function updatePet(id: string, data: {
  name: string
  species: string
  breed?: string
  sex: string
  birthDate?: string
  weight?: string
  size: string
  color?: string
  notes?: string
}) {
  try {
    const pet = await prisma.pet.update({
      where: { id },
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        sex: data.sex,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        size: data.size,
        color: data.color || null,
        notes: data.notes || null,
      }
    })

    revalidatePath("/admin/pets")
    revalidatePath(`/admin/clientes/${pet.clientId}`)
    return { success: true, pet }
  } catch (error) {
    console.error("Erro ao atualizar pet:", error)
    return { success: false, error: "Falha ao atualizar o pet." }
  }
}

export async function getPetById(id: string) {
  await requireAdmin();
  return await prisma.pet.findUnique({
    where: { id },
    include: { client: { include: { user: true } } }
  })
}

