"use server"

import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, eachDayOfInterval, format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { requireAdmin } from "@/lib/server-auth"

export async function getDashboardKPIs(dateStr: string) {
  await requireAdmin();
  const targetDate = new Date(dateStr) // Assume this is the start of the local day or mid-day
  const sDay = startOfDay(targetDate)
  const eDay = endOfDay(targetDate)
  
  const appointmentsToday = await prisma.appointment.findMany({
    where: { startTime: { gte: sDay, lte: eDay } },
    include: { services: true, service: true } // support multiple services
  })

  const totalClients = await prisma.client.count({ where: { isActive: true } })
  const totalPets = await prisma.pet.count({ where: { isActive: true } })

  const confirmedCount = appointmentsToday.filter(a => a.status === 'CONFIRMADO').length
  const pendingCount = appointmentsToday.filter(a => a.status === 'AGENDADO').length
  
  // Total Revenue Today (Only count non-canceled)
  const todayRevenue = appointmentsToday.reduce((acc, curr) => {
    if (curr.status === 'CANCELADO') return acc
    const svcs = curr.services?.length ? curr.services : (curr.service ? [curr.service] : [])
    const servicesPrice = svcs.reduce((sAcc, sCurr) => sAcc + sCurr.price, 0)
    return acc + servicesPrice
  }, 0)

  // Has any revenue-generating appointment today?
  const hasFinalized = appointmentsToday.some(a => a.status !== 'CANCELADO')

  return {
    todayRevenue,
    hasFinalized,
    totalAppointments: appointmentsToday.filter(a => a.status !== 'CANCELADO').length,
    confirmedCount,
    pendingCount,
    totalClients,
    totalPets
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
    include: { 
      pet: { include: { client: { include: { user: true } } } },
      services: true,
      service: true,
      employee: { include: { user: true } }
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
    include: { services: true, service: true },
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
    const svcs = app.services?.length ? app.services : (app.service ? [app.service] : [])
    const price = svcs.reduce((acc, curr) => acc + curr.price, 0)
    
    dataMap.set(key, (dataMap.get(key) || 0) + price)
  })

  const chartData = Array.from(dataMap.entries()).map(([name, value]) => ({ name, value }))

  // Check if all are zero
  const hasData = chartData.some(d => d.value > 0)

  return { chartData, hasData }
}
