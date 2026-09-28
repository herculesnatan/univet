"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/server-auth"
import { addMinutes, parseISO } from "date-fns"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function getColaboradorAgendaData(startIso: string, endIso: string) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== "FUNCIONARIO") {
    throw new Error("Não autorizado")
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: (session.user as any).id }
  })
  
  if (!employee) throw new Error("Colaborador não encontrado")

  const start = new Date(startIso)
  const end = new Date(endIso)

  const appointments = await prisma.appointment.findMany({
    where: {
      employeeId: employee.id,
      startTime: {
        gte: start,
        lte: end,
      },
    },
    include: {
      pet: { include: { client: { include: { user: true } } } },
      services: true,
      service: true,
      employee: { include: { user: true } },
    },
    orderBy: {
      startTime: 'asc'
    }
  })

  return appointments
}

export async function getAgendaData(startIso: string, endIso: string) {
  await requireAdmin();
  const start = new Date(startIso)
  const end = new Date(endIso)

  const appointments = await prisma.appointment.findMany({
    where: {
      startTime: {
        gte: start,
        lte: end,
      },
    },
    include: {
      pet: { include: { client: { include: { user: true } } } },
      services: true,
      service: true, // Legacy (optional)
      employee: { include: { user: true } },
    },
    orderBy: { startTime: 'asc' }
  })

  return appointments
}

export async function getAgendaOptions() {
  await requireAdmin();
  const pets = await prisma.pet.findMany({
    where: { isActive: true },
    include: { client: { include: { user: true } } },
    orderBy: { name: 'asc' }
  })

  const services = await prisma.service.findMany({
    where: { isActive: true },
    include: { employees: true },
    orderBy: { name: 'asc' }
  })

  // Garantir que existe pelo menos um funcionário para o protótipo
  let employees = await prisma.employee.findMany({
    where: { isActive: true },
    include: { user: true },
    orderBy: { user: { name: 'asc' } }
  })

  if (employees.length === 0) {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (admin) {
      const newEmp = await prisma.employee.create({
        data: { userId: admin.id },
        include: { user: true }
      })
      employees = [newEmp]
    }
  }

  return { pets, services, employees }
}

export async function createAppointment(data: {
  petId: string
  serviceIds: string[]
  employeeId: string
  startTimeStr: string // formato ISO
}) {
  try {
    if (!data.serviceIds || data.serviceIds.length === 0) {
      return { success: false, error: "Pelo menos um serviço é obrigatório." }
    }

    const services = await prisma.service.findMany({
      where: { id: { in: data.serviceIds } }
    })

    if (services.length !== data.serviceIds.length) {
      return { success: false, error: "Um ou mais serviços não foram encontrados." }
    }

    const totalDuration = services.reduce((acc, curr) => acc + curr.durationMin, 0)
    const startTime = parseISO(data.startTimeStr)
    const endTime = addMinutes(startTime, totalDuration)

    // Regra de Negócio: Checar Conflito de Horário
    const conflict = await prisma.appointment.findFirst({
      where: {
        employeeId: data.employeeId,
        status: { not: 'CANCELADO' },
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime }
          }
        ]
      }
    })

    if (conflict) {
      return { success: false, error: "Conflito de horário! O funcionário já possui um atendimento neste período." }
    }

    const appointment = await prisma.appointment.create({
      data: {
        petId: data.petId,
        employeeId: data.employeeId,
        startTime: startTime,
        endTime: endTime,
        status: "AGENDADO",
        services: {
          connect: data.serviceIds.map(id => ({ id }))
        }
      }
    })

    revalidatePath("/admin/agenda")
    revalidatePath("/admin/dashboard")
    return { success: true, appointment }

  } catch (error) {
    console.error("Erro ao criar agendamento:", error)
    return { success: false, error: "Falha ao criar o agendamento." }
  }
}

export async function updateAppointment(id: string, data: {
  petId: string
  serviceIds: string[]
  employeeId: string
  status: string
  startTimeStr: string
}) {
  try {
    if (!data.serviceIds || data.serviceIds.length === 0) {
      return { success: false, error: "Pelo menos um serviço é obrigatório." }
    }

    const services = await prisma.service.findMany({
      where: { id: { in: data.serviceIds } }
    })

    if (services.length !== data.serviceIds.length) {
      return { success: false, error: "Um ou mais serviços não foram encontrados." }
    }

    const totalDuration = services.reduce((acc, curr) => acc + curr.durationMin, 0)
    const startTime = parseISO(data.startTimeStr)
    const endTime = addMinutes(startTime, totalDuration)

    // Check conflict excluding THIS appointment
    if (data.status !== 'CANCELADO') {
      const conflict = await prisma.appointment.findFirst({
        where: {
          id: { not: id },
          employeeId: data.employeeId,
          status: { not: 'CANCELADO' },
          OR: [
            {
              startTime: { lt: endTime },
              endTime: { gt: startTime }
            }
          ]
        }
      })

      if (conflict) {
        return { success: false, error: "Conflito de horário! O funcionário já possui um atendimento neste período." }
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        petId: data.petId,
        employeeId: data.employeeId,
        status: data.status,
        startTime: startTime,
        endTime: endTime,
        services: {
          set: data.serviceIds.map(sid => ({ id: sid }))
        }
      }
    })

    revalidatePath("/admin/agenda")
    return { success: true, appointment }

  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error)
    return { success: false, error: "Falha ao atualizar o agendamento." }
  }
}

export async function cancelAppointment(id: string) {
  await requireAdmin();
  try {
    await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELADO' }
    })
    revalidatePath("/admin/agenda")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Falha ao cancelar o agendamento." }
  }
}
import { requireEmployeeOrAdmin } from "@/lib/server-auth"
export async function updateAppointmentStatus(id: string, status: string) {
  try {
    const { isAdmin, employeeId } = await requireEmployeeOrAdmin()
    
    // Se for funcionário, garantir que ele é o dono do agendamento
    if (!isAdmin) {
      const app = await prisma.appointment.findUnique({
        where: { id },
        select: { employeeId: true }
      })
      if (!app) return { success: false, error: 'Agendamento não encontrado.' }
      if (app.employeeId !== employeeId) {
        return { success: false, error: 'Sem permissão para alterar este agendamento.' }
      }
    }

    await prisma.appointment.update({ where: { id }, data: { status } })
    revalidatePath('/admin/agenda')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao atualizar status.' }
  }
}

