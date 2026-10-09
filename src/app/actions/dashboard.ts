"use server"

import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, eachDayOfInterval, format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { requireAdmin } from "@/lib/server-auth"

// Totais de clientes/pets mudam pouco: cache de 60s evita 2 COUNTs a cada abertura/refresh do dashboard.
const getCachedTotals = unstable_cache(
  async () => {
    const [totalClients, totalPets] = await Promise.all([
      prisma.client.count({ where: { isActive: true } }),
      prisma.pet.count({ where: { isActive: true } }),
    ])
    return { totalClients, totalPets }
  },
  ["dashboard-totals"],
  { revalidate: 60 }
)

// Só os campos necessários para somar preços (nada de linhas completas / joins largos).
const priceSelect = {
  service: { select: { price: true } },
  services: { select: { price: true } },
} as const

type WithPrices = {
  service?: { price: number } | null
  services?: { price: number }[]
}

function sumPrices(app: WithPrices) {
  const svcs = app.services?.length ? app.services : (app.service ? [app.service] : [])
  return svcs.reduce((acc, curr) => acc + curr.price, 0)
}

export async function getDashboardKPIs(dateStr: string) {
  await requireAdmin();
  const targetDate = new Date(dateStr) // Assume this is the start of the local day or mid-day
  const sDay = startOfDay(targetDate)
  const eDay = endOfDay(targetDate)

  const [appointmentsToday, totals] = await Promise.all([
    prisma.appointment.findMany({
      where: { startTime: { gte: sDay, lte: eDay } },
      select: { status: true, ...priceSelect },
    }),
    getCachedTotals(),
  ])

  const confirmedCount = appointmentsToday.filter(a => a.status === 'CONFIRMADO').length
  const pendingCount = appointmentsToday.filter(a => a.status === 'AGENDADO').length

  // Total Revenue Today (Only count non-canceled)
  const active = appointmentsToday.filter(a => a.status !== 'CANCELADO')
  const todayRevenue = active.reduce((acc, curr) => acc + sumPrices(curr), 0)

  // Has any revenue-generating appointment today?
  const hasFinalized = active.length > 0

  return {
    todayRevenue,
    hasFinalized,
    totalAppointments: active.length,
    confirmedCount,
    pendingCount,
    totalClients: totals.totalClients,
    totalPets: totals.totalPets
  }
}

export async function getDashboardUpcomingAppointments(dateStr: string) {
  await requireAdmin();
  const targetDate = new Date(dateStr)
  const sDay = startOfDay(targetDate)
  const eDay = endOfDay(targetDate)

  const appointments = await prisma.appointment.findMany({
    where: { 
      startTime: { gte: sDay, lte: eDay },
      status: { not: 'CANCELADO' }
    },
    select: { 
      id: true,
      startTime: true,
      status: true,
      pet: { select: { name: true, species: true, breed: true, client: { select: { user: { select: { name: true } } } } } },
      services: { select: { name: true } },
      service: { select: { name: true } },
      employee: { select: { user: { select: { name: true } } } }
    },
    orderBy: { startTime: 'asc' }
  })

  // Format to send to client
  return appointments.map(app => {
    const svcs = app.services?.length ? app.services : (app.service ? [app.service] : [])
    return {
      id: app.id,
      time: format(new Date(app.startTime), "HH:mm"),
      petName: app.pet.name,
      petSpecies: app.pet.species,
      petBreed: app.pet.breed,
      clientName: app.pet.client.user.name,
      employeeName: app.employee.user.name,
      servicesText: svcs.map(s => s.name).join(" + "),
      status: app.status
    }
  })
}

export async function getDashboardRevenueChart(period: 'hoje' | '7dias' | 'esteMes' | 'ultimoMes', clientDateStr: string) {
  await requireAdmin();
  const clientDate = new Date(clientDateStr)
  let start: Date
  let end: Date
  let formatStr = "dd/MM"

  if (period === 'hoje') {
    start = startOfDay(clientDate)
    end = endOfDay(clientDate)
    formatStr = "HH:mm"
  } else if (period === '7dias') {
    start = startOfDay(subDays(clientDate, 6))
    end = endOfDay(clientDate)
  } else if (period === 'esteMes') {
    start = startOfMonth(clientDate)
    end = endOfMonth(clientDate)
  } else if (period === 'ultimoMes') {
    start = startOfMonth(subDays(startOfMonth(clientDate), 1))
    end = endOfMonth(start)
  } else {
    start = startOfDay(subDays(clientDate, 6))
    end = endOfDay(clientDate)
  }

  const appointments = await prisma.appointment.findMany({
    where: { 
      startTime: { gte: start, lte: end },
      status: { not: 'CANCELADO' }
    },
    select: { startTime: true, ...priceSelect },
    orderBy: { startTime: 'asc' }
  })

  // Group by format string
  const dataMap = new Map<string, number>()

  // Initialize all points to 0 if not 'hoje'
  if (period !== 'hoje') {
    const interval = eachDayOfInterval({ start, end })
    interval.forEach(day => {
      dataMap.set(format(day, formatStr, { locale: ptBR }), 0)
    })
  }

  appointments.forEach(app => {
    const key = format(new Date(app.startTime), formatStr, { locale: ptBR })
    dataMap.set(key, (dataMap.get(key) || 0) + sumPrices(app))
  })

  const chartData = Array.from(dataMap.entries()).map(([name, value]) => ({ name, value }))

  // Check if all are zero
  const hasData = chartData.some(d => d.value > 0)

  return { chartData, hasData }
}
