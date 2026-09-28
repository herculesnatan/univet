"use client"

import { useEffect, useState, useMemo } from "react"
import { getColaboradorAgendaData, updateAppointmentStatus } from "@/app/actions/agenda"
import { 
  format, startOfDay, endOfDay, addDays, subDays, isSameDay, isToday, isBefore
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, PawPrint, Info, CheckCircle2, PlayCircle, XCircle } from "lucide-react"
import { STATUS_UI } from "@/app/admin/agenda/status-components"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function ColaboradorAgendaView() {
  const [date, setDate] = useState(new Date())
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)

  const fetchAgenda = async () => {
    try {
      setLoading(true)
      const start = startOfDay(date).toISOString()
      const end = endOfDay(date).toISOString()
      const data = await getColaboradorAgendaData(start, end)
      setAppointments(data)
    } catch (error: any) {
      toast.error("Erro ao buscar agenda: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgenda()
  }, [date])

  const handlePrevDay = () => setDate(subDays(date, 1))
  const handleNextDay = () => setDate(addDays(date, 1))
  const handleToday = () => setDate(new Date())

  const formatServicesText = (app: any) => {
    if (app.services && app.services.length > 0) {
      return app.services.map((s: any) => s.name).join(' + ')
    }
    return app.service?.name || 'Serviço não especificado'
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (newStatus === 'CANCELADO' && !window.confirm("Cancelar este agendamento?")) return
    
    try {
      setStatusLoading(true)
      const res = await updateAppointmentStatus(id, newStatus)
      if (res.success) {
        toast.success(`Status alterado para ${STATUS_UI[newStatus as keyof typeof STATUS_UI]?.label}`)
        fetchAgenda()
        if (selectedApp?.id === id) {
          setSelectedApp({ ...selectedApp, status: newStatus })
        }
      } else {
        toast.error(res.error)
      }
    } catch(err) {
      toast.error("Erro ao alterar status")
    } finally {
      setStatusLoading(false)
    }
  }

  // Estatisticas
  const total = appointments.length
  const agendados = appointments.filter(a => a.status === 'AGENDADO' || a.status === 'CONFIRMADO').length
  const emAtendimento = appointments.filter(a => a.status === 'EM_ATENDIMENTO').length
  const finalizados = appointments.filter(a => a.status === 'FINALIZADO').length
  const cancelados = appointments.filter(a => a.status === 'CANCELADO').length

  // Próximo atendimento (primeiro do dia que não está finalizado/cancelado)
  const nextApp = useMemo(() => {
    const now = new Date()
    return appointments.find(a => 
      (a.status !== 'FINALIZADO' && a.status !== 'CANCELADO') &&
      (!isBefore(new Date(a.startTime), now) || a.status === 'EM_ATENDIMENTO')
    ) || appointments.find(a => a.status !== 'FINALIZADO' && a.status !== 'CANCELADO')
  }, [appointments])

  return (
    <div className="space-y-6">
      
      {/* Navegação de Datas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-800 capitalize">
            {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h3>
          {isToday(date) && <Badge variant="secondary" className="bg-blue-100 text-blue-700">Hoje</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevDay}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={handleToday} className="font-semibold">Hoje</Button>
          <Button variant="outline" size="sm" onClick={handleNextDay}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-800 text-white border-0 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold">{total}</span>
            <span className="text-xs uppercase font-semibold opacity-80 mt-1">Total</span>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-blue-700">{agendados}</span>
            <span className="text-xs uppercase font-semibold text-blue-600 mt-1">Agendados</span>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-100 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-orange-700">{emAtendimento}</span>
            <span className="text-xs uppercase font-semibold text-orange-600 mt-1">Em andamento</span>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-emerald-700">{finalizados}</span>
            <span className="text-xs uppercase font-semibold text-emerald-600 mt-1">Finalizados</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-100 border-slate-200 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-slate-500">{cancelados}</span>
            <span className="text-xs uppercase font-semibold text-slate-500 mt-1">Cancelados</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-slate-500" />
            Agenda do Dia
          </h3>

          {loading ? (
            <div className="flex justify-center p-8 text-slate-400">Carregando agenda...</div>
          ) : appointments.length === 0 ? (
            <div className="bg-white border border-slate-200 border-dashed rounded-lg p-12 text-center text-slate-500">
              Nenhum atendimento para esta data.
            </div>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {appointments.map((app) => {
                const conf = STATUS_UI[app.status as keyof typeof STATUS_UI] || STATUS_UI.AGENDADO
                const isCanceled = app.status === 'CANCELADO'
                
                return (
                  <div key={app.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-xl">
                      {conf.indicator}
                    </div>
                    <Card 
                      onClick={() => setSelectedApp(app)}
                      className={cn(
                        "w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md",
                        conf.badgeClass, 
                        isCanceled ? "opacity-60" : ""
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-lg">{format(new Date(app.startTime), 'HH:mm')}</div>
                          <Badge variant="outline" className={cn("bg-white/50 border-current font-bold", conf.badgeClass)}>{conf.label}</Badge>
                        </div>
                        <div className="font-bold text-slate-900 flex items-center text-base">
                          <PawPrint className="w-4 h-4 mr-2 opacity-50" />
                          {app.pet.name}
                        </div>
                        <div className="text-sm opacity-80 mt-1 line-clamp-2">
                          {formatServicesText(app)}
                        </div>
                        <div className="text-xs opacity-60 mt-2">
                          Tutor: {app.pet.client.user.name}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Destaque Próximo */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Destaque</h3>
          {nextApp ? (
            <Card className="bg-blue-600 text-white shadow-lg border-0 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <PawPrint className="w-24 h-24" />
              </div>
              <CardContent className="p-6 relative z-10">
                <div className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-2">Próximo Atendimento</div>
                <div className="text-4xl font-bold mb-4">{format(new Date(nextApp.startTime), 'HH:mm')}</div>
                <div className="text-2xl font-bold mb-1">{nextApp.pet.name}</div>
                <div className="text-blue-100 mb-6">{formatServicesText(nextApp)}</div>
                
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold"
                  onClick={() => setSelectedApp(nextApp)}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-50 border-slate-200 border-dashed">
              <CardContent className="p-6 text-center text-slate-500">
                Nenhum atendimento pendente para hoje.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedApp} onOpenChange={(o) => !o && setSelectedApp(null)}>
        {selectedApp && (
          <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-slate-50">
            <div className={cn("p-6 text-white", STATUS_UI[selectedApp.status as keyof typeof STATUS_UI]?.activeClass || "bg-blue-600")}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <span>{STATUS_UI[selectedApp.status as keyof typeof STATUS_UI]?.indicator}</span>
                  {selectedApp.pet.name}
                </DialogTitle>
                <div className="text-xl opacity-90 mt-1">
                  {format(new Date(selectedApp.startTime), 'HH:mm')}
                </div>
              </DialogHeader>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 mb-2">Serviços</h4>
                <p className="font-semibold text-slate-700 text-lg">{formatServicesText(selectedApp)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400 mb-1">Porte / Raça</h4>
                  <p className="font-medium text-slate-700">{selectedApp.pet.size} • {selectedApp.pet.breed || 'SRD'}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400 mb-1">Tutor</h4>
                  <p className="font-medium text-slate-700">{selectedApp.pet.client.user.name}</p>
                </div>
              </div>

              {selectedApp.notes && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
                  <h4 className="text-xs uppercase font-bold text-amber-700 mb-1 flex items-center"><Info className="w-3 h-3 mr-1"/> Observações</h4>
                  <p className="text-sm text-amber-900">{selectedApp.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-xs uppercase font-bold text-slate-400 mb-3 text-center">Ações do Atendimento</h4>
                <div className="flex flex-col gap-2">
                  {selectedApp.status === 'AGENDADO' && (
                    <Button onClick={() => handleUpdateStatus(selectedApp.id, 'CONFIRMADO')} disabled={statusLoading} className="bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold">
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Confirmar Presença
                    </Button>
                  )}
                  {selectedApp.status === 'CONFIRMADO' && (
                    <Button onClick={() => handleUpdateStatus(selectedApp.id, 'EM_ATENDIMENTO')} disabled={statusLoading} className="bg-orange-500 hover:bg-orange-600 h-12 text-base font-bold">
                      <PlayCircle className="w-5 h-5 mr-2" /> Iniciar Atendimento
                    </Button>
                  )}
                  {selectedApp.status === 'EM_ATENDIMENTO' && (
                    <Button onClick={() => handleUpdateStatus(selectedApp.id, 'FINALIZADO')} disabled={statusLoading} className="bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-bold">
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Finalizar Atendimento
                    </Button>
                  )}
                  {selectedApp.status === 'FINALIZADO' && (
                    <div className="text-center p-3 bg-emerald-50 text-emerald-700 font-bold rounded-md">
                      Atendimento Finalizado
                    </div>
                  )}
                  
                  {selectedApp.status !== 'FINALIZADO' && selectedApp.status !== 'CANCELADO' && (
                    <Button onClick={() => handleUpdateStatus(selectedApp.id, 'CANCELADO')} disabled={statusLoading} variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-2">
                      <XCircle className="w-4 h-4 mr-2" /> Cancelar Atendimento
                    </Button>
                  )}
                  {selectedApp.status === 'CANCELADO' && (
                    <div className="text-center p-3 bg-slate-100 text-slate-500 font-bold rounded-md">
                      Cancelado
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
