"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/server-auth"
import bcrypt from "bcryptjs"

export async function getClients(q?: string) {
  await requireAdmin();
  return await prisma.client.findMany({
    where: q ? {
      OR: [
        { user: { name: { contains: q } } },
        { whatsapp: { contains: q } },
        { pets: { some: { name: { contains: q } } } }
      ]
    } : undefined,
    include: {
      user: true,
      pets: {
        include: {
          appointments: {
            orderBy: { startTime: 'desc' },
            take: 1
          }
        }
      },
      _count: {
        select: { pets: true }
      }
    },
    orderBy: { user: { name: 'asc' } }
  })
}

export async function getClientById(id: string) {
  await requireAdmin();
  return await prisma.client.findUnique({
    where: { id },
    include: {
      user: true,
      pets: true
    }
  })
}

export async function createClientWithPet(data: {
  // Client Data
  name: string
  email: string
  whatsapp?: string
  address?: string
  clientNotes?: string
  // Pet Data
  petName: string
  species: string
  breed?: string
  sex: string
  birthDate?: string // ISO format YYYY-MM-DD
  weight?: string
  size: string
  color?: string
  petNotes?: string
}) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return { success: false, error: "E-mail já está em uso no sistema." }
    }

    const hashedPassword = await bcrypt.hash("mudar123", 10)

    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar User
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: "CLIENTE",
        }
      })

      // 2. Criar Client
      const client = await tx.client.create({
        data: {
          userId: user.id,
          whatsapp: data.whatsapp || null,
          address: data.address || null,
          notes: data.clientNotes || null,
        }
      })

      // 3. Criar Pet
      const pet = await tx.pet.create({
        data: {
          clientId: client.id,
          name: data.petName,
          species: data.species,
          breed: data.breed || null,
          sex: data.sex,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          weight: data.weight ? parseFloat(data.weight) : null,
          size: data.size,
          color: data.color || null,
          notes: data.petNotes || null,
        }
      })

      return { user, client, pet }
    })

    revalidatePath("/admin/clientes")
    revalidatePath("/admin/pets")
    return { success: true, client: result.client, pet: result.pet }

  } catch (error) {
    console.error("Erro ao criar cliente e pet:", error)
    return { success: false, error: "Falha ao cadastrar o cliente e o pet." }
  }
}

export async function updateClient(id: string, data: {
  name: string
  email: string
  whatsapp?: string
  address?: string
  notes?: string
}) {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!client) return { success: false, error: "Cliente não encontrado." }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: client.userId },
        data: {
          name: data.name,
          email: data.email,
        }
      })

      await tx.client.update({
        where: { id },
        data: {
          whatsapp: data.whatsapp || null,
          address: data.address || null,
          notes: data.notes || null,
        }
      })
    })

    revalidatePath("/admin/clientes")
    revalidatePath(`/admin/clientes/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    return { success: false, error: "Falha ao atualizar o cliente." }
  }
}
