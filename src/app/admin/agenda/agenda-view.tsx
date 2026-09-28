"use client"

import { useEffect, useState, useMemo } from "react"
import { NewAppointmentDialog } from "./new-appointment-dialog"
import { getAgendaData } from "@/app/actions/agenda"
import { 
  format, startOfDay, endOfDay, startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, addDays, subDays, addWeeks, 
  subWeeks, addMonths, subMonths, isSameDay, isToday, eachDayOfInterval
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { EditAppointmentDialog } from "./edit-appointment-dialog"
import { AgendaQuickStatus, STATUS_UI } from "./status-components"
import { cn } from "@/lib/utils"

type ViewMode = 'day' | 'week' | 'month'

export function AgendaView() {
  const [date, setDate] = useState<Date>(new Date())
  const [view, setView] = useState<ViewMode>('day')
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null)

  // Fetch appointments bounded by the current view
  useEffect(() => {
    let start: Date, end: Date;
    
    if (view === 'day') {
      start = startOfDay(date)
      end = endOfDay(date)
    } else if (view === 'week') {
      start = startOfWeek(date, { weekStartsOn: 1 })
      end = endOfWeek(date, { weekStartsOn: 1 })
    } else {
      start = startOfMonth(date)
      end = endOfMonth(date)
    }

    setLoading(true)
    getAgendaData(start.toISOString(), end.toISOString())
      .then(data => {
        setAppointments(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [date, view])

  // Handlers for Navigation
  const handlePrev = () => {
    if (view === 'day') setDate(subDays(date, 1))
    if (view === 'week') setDate(subWeeks(date, 1))
    if (view === 'month') setDate(subMonths(date, 1))
  }

  const handleNext = () => {
    if (view === 'day') setDate(addDays(date, 1))
    if (view === 'week') setDate(addWeeks(date, 1))
    if (view === 'month') setDate(addMonths(date, 1))
  }

  const handleToday = () => setDate(new Date())

  // Dynamic Title
  const title = useMemo(() => {
    if (view === 'day') return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    if (view === 'week') {
      const start = startOfWeek(date, { weekStartsOn: 1 })
      const end = endOfWeek(date, { weekStartsOn: 1 })
      return `${format(start, "d", { locale: ptBR })} - ${format(end, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`
    }
    return format(date, "MMMM 'de' yyyy", { locale: ptBR })
  }, [date, view])

  // Summaries
  const activeAppointments = appointments.filter(a => a.status !== 'CANCELADO')
  
  // Total of rendered appointments vs Total of executed services
  const totalServicesExecuted = activeAppointments.reduce((acc, curr) => acc + (curr.services?.length || (curr.service ? 1 : 0)), 0)

  const summaryByService = activeAppointments.reduce((acc, curr) => {
    // Handling multiple services OR legacy service
    const svcs = curr.services?.length ? curr.services : (curr.service ? [curr.service] : [])
    svcs.forEach((s: any) => {
      acc[s.name] = (acc[s.name] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const summaryBySize = activeAppointments.reduce((acc, curr) => {
    const size = curr.pet.size || 'Outro'
    acc[size] = (acc[size] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const formatServicesText = (app: any) => {
    const svcs = app.services?.length > 0 ? app.services : (app.service ? [app.service] : [])
    return svcs.map((s: any) => s.name).join(" + ")
  }

  const calculateTotalDurationAndPrice = (app: any) => {
    const svcs = app.services?.length > 0 ? app.services : (app.service ? [app.service] : [])
    const duration = svcs.reduce((acc: number, curr: any) => acc + curr.durationMin, 0)
    const price = svcs.reduce((acc: number, curr: any) => acc + curr.price, 0)
    
    // format duration
    const h = Math.floor(duration / 60)
    const m = duration % 60
    const durationStr = h > 0 ? `${h}h${m > 0 ? m + 'm' : ''}` : `${m}m`

    // format price
    const priceStr = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)

    return { durationStr, priceStr }
  }

  const renderDailyView = () => {
    if (appointments.length === 0) {
      return (
        <div className="text-center p-12 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 bg-slate-50">
          Nenhum agendamento para este dia.
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {appointments.map((app) => {
          const isCancelled = app.status === 'CANCELADO'
          const servicesText = formatServicesText(app)
          const { durationStr, priceStr } = calculateTotalDurationAndPrice(app)

          return (
            <Card key={app.id} onClick={() => setEditingAppointment(app)} className={`border-slate-200 shadow-sm cursor-pointer transition-colors ${isCancelled ? 'opacity-50' : 'hover:border-blue-400 hover:shadow-md'}`}>
              <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold w-20 text-center flex flex-col ${isCancelled ? 'text-slate-400' : 'text-blue-600'}`}>
                    <span>{format(new Date(app.startTime), "HH:mm")}</span>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-slate-800">
                      {app.pet.name} <span className="text-sm font-normal text-slate-500">({app.pet.species})</span>
                    </div>
                    <div className={`text-sm font-medium mt-1 ${isCancelled ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {servicesText}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Tutor: <span className="font-medium">{app.pet.client.user.name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:items-end gap-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <AgendaQuickStatus id={app.id} currentStatus={app.status} petName={app.pet.name} />
                  </div>
                  <div className="text-xs text-slate-500 flex items-center justify-end gap-2">
                     <span className="font-medium text-slate-700">{app.employee.user.name}</span>
                     <span>•</span>
                     <span>{durationStr}</span>
                     <span>•</span>
                     <span className="font-semibold text-emerald-600">{priceStr}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderWeeklyView = () => {
    const days = eachDayOfInterval({
      start: startOfWeek(date, { weekStartsOn: 1 }),
      end: endOfWeek(date, { weekStartsOn: 1 })
    })

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map(day => {
          const dayApps = appointments.filter(a => isSameDay(new Date(a.startTime), day))
          return (
            <Card key={day.toISOString()} className={`border-slate-200 ${isToday(day) ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="bg-slate-50 border-b border-slate-200 p-3 text-center">
                <div className="text-xs text-slate-500 uppercase font-semibold">{format(day, 'EEEE', { locale: ptBR })}</div>
                <div className={`text-xl font-bold ${isToday(day) ? 'text-blue-600' : 'text-slate-800'}`}>
                  {format(day, 'd')}
                </div>
              </CardHeader>
              <CardContent className="p-2 space-y-2 min-h-[150px]">
                {dayApps.length === 0 ? (
                  <div className="text-xs text-center text-slate-400 py-4">Livre</div>
                ) : (
                  dayApps.map(app => {
                    const conf = STATUS_UI[app.status as keyof typeof STATUS_UI] || STATUS_UI.AGENDADO
                    return (
                      <div key={app.id} onClick={() => setEditingAppointment(app)} className={cn("p-2 rounded border text-xs cursor-pointer hover:shadow-sm flex flex-col gap-1.5", conf.badgeClass, app.status === 'CANCELADO' && 'opacity-60')}>
                        <div className="flex justify-between items-start">
                          <div className="font-bold">{format(new Date(app.startTime), 'HH:mm')}</div>
                          <div className="opacity-80"><AgendaQuickStatus id={app.id} currentStatus={app.status} petName={app.pet.name} /></div>
                        </div>
                        <div>
                          <div className="truncate font-semibold">{app.pet.name}</div>
                          <div className="truncate opacity-80" title={formatServicesText(app)}>{formatServicesText(app)}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderMonthlyView = () => {
    const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start, end })

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
          <div key={d} className="text-center font-semibold text-slate-500 text-sm py-2">{d}</div>
        ))}
        {days.map(day => {
          const dayApps = appointments.filter(a => isSameDay(new Date(a.startTime), day))
          const isCurrentMonth = day.getMonth() === date.getMonth()
          
          return (
            <div 
              key={day.toISOString()} 
              onClick={() => {
                setDate(day)
                setView('day')
              }}
              className={`min-h-[100px] border p-2 cursor-pointer transition-colors hover:bg-blue-50
                ${isCurrentMonth ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 text-slate-400'}
                ${isToday(day) ? 'ring-2 ring-inset ring-blue-500' : ''}
              `}
            >
              <div className={`text-right text-sm font-medium ${isToday(day) ? 'text-blue-600' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="mt-1 space-y-1">
                {dayApps.slice(0, 3).map(app => {
                  const conf = STATUS_UI[app.status as keyof typeof STATUS_UI] || STATUS_UI.AGENDADO
                  return (
                    <div key={app.id} onClick={(e) => { e.stopPropagation(); setEditingAppointment(app); }} className={cn("text-[10px] p-1 rounded truncate cursor-pointer hover:brightness-95 flex items-center gap-1", conf.badgeClass, app.status === 'CANCELADO' && 'opacity-60 line-through')}>
                      <span>{conf.indicator}</span>
                      <span>{format(new Date(app.startTime), 'HH:mm')} - {app.pet.name}</span>
                    </div>
                  )
                })}
                {dayApps.length > 3 && (
                  <div className="text-[10px] text-center text-slate-500 font-semibold">
                    +{dayApps.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleToday} className="font-semibold text-slate-700">Hoje</Button>
          <div className="flex items-center rounded-md border border-slate-200 overflow-hidden">
            <Button variant="ghost" className="rounded-none px-3 py-2 hover:bg-slate-100" onClick={handlePrev}><ChevronLeft className="w-5 h-5 text-slate-600" /></Button>
            <Button variant="ghost" className="rounded-none px-3 py-2 hover:bg-slate-100" onClick={handleNext}><ChevronRight className="w-5 h-5 text-slate-600" /></Button>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 capitalize w-64 text-center">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex rounded-md border border-slate-200 bg-slate-50 p-1">
            <button onClick={() => setView('day')} className={`px-4 py-1.5 text-sm font-semibold rounded-sm transition-colors ${view === 'day' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}>Dia</button>
            <button onClick={() => setView('week')} className={`px-4 py-1.5 text-sm font-semibold rounded-sm transition-colors ${view === 'week' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}>Semana</button>
            <button onClick={() => setView('month')} className={`px-4 py-1.5 text-sm font-semibold rounded-sm transition-colors ${view === 'month' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}>Mês</button>
          </div>
          <NewAppointmentDialog selectedDate={date} onSuccess={() => {
            setDate(new Date(date.getTime()))
          }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        
        {/* MAIN CALENDAR AREA */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm min-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 font-medium">Carregando agendamentos...</div>
          ) : (
            <>
              {view === 'day' && renderDailyView()}
              {view === 'week' && renderWeeklyView()}
              {view === 'month' && renderMonthlyView()}
            </>
          )}
        </div>

        {/* DAILY SUMMARY */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-200 py-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <CalendarIcon className="w-5 h-5 text-blue-600" /> Resumo
                {view === 'day' ? ' do Dia' : ' do Período'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center divide-x divide-slate-200">
                <div>
                  <div className="text-3xl font-black text-slate-800">{activeAppointments.length}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Agendamentos</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-blue-600">{totalServicesExecuted}</div>
                  <div className="text-xs font-bold text-blue-600/70 uppercase tracking-wider mt-1">Serviços</div>
                </div>
              </div>

              {activeAppointments.length > 0 && (
                <>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-700 uppercase border-b pb-1">Por Serviço</h4>
                    <ul className="space-y-1">
                      {Object.entries(summaryByService).map(([name, count]) => (
                        <li key={name} className="flex justify-between text-sm text-slate-600">
                          <span>{name}</span>
                          <span className="font-bold text-slate-800">{count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-700 uppercase border-b pb-1">Agendamentos por Porte</h4>
                    <ul className="space-y-1">
                      {Object.entries(summaryBySize).map(([size, count]) => (
                        <li key={size} className="flex justify-between text-sm text-slate-600 capitalize">
                          <span>{size.toLowerCase()}</span>
                          <span className="font-bold text-slate-800">{count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {editingAppointment && (
        <EditAppointmentDialog 
          appointment={editingAppointment}
          open={!!editingAppointment}
          setOpen={(val) => {
            if (!val) setEditingAppointment(null)
          }}
          onSuccess={() => {
            setDate(new Date(date.getTime()))
          }}
        />
      )}
    </div>
  )
}
