"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CalendarPlus, Check, ChevronsUpDown, Clock, Plus, X } from "lucide-react"
import { getAgendaOptions, updateAppointment, cancelAppointment } from "@/app/actions/agenda"
import { toast } from "sonner"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { FormStatusSelector } from "./status-components"

const TIME_SLOTS = Array.from({ length: 24 }).map((_, i) => {
  const h = Math.floor(i / 2) + 8
  const m = i % 2 === 0 ? '00' : '30'
  return `${h.toString().padStart(2, '0')}:${m}`
})

export function EditAppointmentDialog({ 
  appointment, 
  open, 
  setOpen, 
  onSuccess 
}: { 
  appointment: any, 
  open: boolean, 
  setOpen: (val: boolean) => void, 
  onSuccess?: () => void 
}) {
  const [loading, setLoading] = useState(false)
  const [canceling, setCanceling] = useState(false)
  
  const [petComboboxOpen, setPetComboboxOpen] = useState(false)
  
  const [options, setOptions] = useState<{pets: any[], services: any[], employees: any[]}>({ pets: [], services: [], employees: [] })

  const [dateStr, setDateStr] = useState("")
  const [petId, setPetId] = useState("")
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [currentServiceSelect, setCurrentServiceSelect] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [time, setTime] = useState("09:00")
  const [status, setStatus] = useState("AGENDADO")

  useEffect(() => {
    if (open && appointment) {
      getAgendaOptions().then(data => {
        setOptions(data)
        
        const st = new Date(appointment.startTime)
        setDateStr(st.toISOString().split('T')[0])
        const t = `${st.getHours().toString().padStart(2, '0')}:${st.getMinutes().toString().padStart(2, '0')}`
        
        setPetId(appointment.petId)
        
        // Handle migration legacy service or new multiple services
        const loadedServiceIds = appointment.services?.length > 0 
          ? appointment.services.map((s: any) => s.id) 
          : (appointment.service ? [appointment.service.id] : [])
          
        setServiceIds(loadedServiceIds)
        setEmployeeId(appointment.employeeId)
        setTime(t)
        setStatus(appointment.status)
      })
    }
  }, [open, appointment])

  const selectedServices = useMemo(() => {
    return options.services.filter(s => serviceIds.includes(s.id))
  }, [serviceIds, options.services])

  // Valid employees: must be able to perform ALL selected services
  const availableEmployees = useMemo(() => {
    if (selectedServices.length === 0) return []
    return options.employees.filter(emp => {
      return selectedServices.every(svc => svc.employees.some((e: any) => e.id === emp.id))
    })
  }, [selectedServices, options.employees])

  useEffect(() => {
    const validEmployeeIds = availableEmployees.map(e => e.id)
    if (open && employeeId && validEmployeeIds.length > 0 && !validEmployeeIds.includes(employeeId)) {
      setEmployeeId("")
    }
  }, [serviceIds, employeeId, availableEmployees, open])

  const handleAddService = () => {
    if (!currentServiceSelect) return
    if (serviceIds.includes(currentServiceSelect)) {
      toast.error("Este serviço já foi adicionado!")
      return
    }
    setServiceIds([...serviceIds, currentServiceSelect])
    setCurrentServiceSelect("")
  }

  const handleRemoveService = (id: string) => {
    setServiceIds(serviceIds.filter(sid => sid !== id))
  }

  const totalDuration = selectedServices.reduce((acc, curr) => acc + curr.durationMin, 0)
  const totalPrice = selectedServices.reduce((acc, curr) => acc + curr.price, 0)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!petId || serviceIds.length === 0 || !employeeId || !time || !dateStr) {
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }

    setLoading(true)

    const start = new Date(dateStr) // parses local timezone because it's YYYY-MM-DD
    // Correct way to merge time into local date properly without timezone shift:
    const [y, m, d] = dateStr.split('-').map(Number)
    const localStart = new Date(y, m - 1, d)
    
    const [hours, minutes] = time.split(':').map(Number)
    localStart.setHours(hours, minutes, 0, 0)
    
    const result = await updateAppointment(appointment.id, {
      petId,
      serviceIds,
      employeeId,
      status,
      startTimeStr: localStart.toISOString()
    })

    setLoading(false)

    if (result.success) {
      toast.success("Agendamento atualizado!")
      setOpen(false)
      if (onSuccess) onSuccess()
    } else {
      toast.error(result.error)
    }
  }

  const handleCancel = async () => {
    const confirm = window.confirm(`Deseja realmente cancelar este agendamento?\nPet: ${selectedPet?.name}\nData: ${dateStr}\nHorário: ${time}`)
    if (!confirm) return

    setCanceling(true)
    const result = await cancelAppointment(appointment.id)
    setCanceling(false)

    if (result.success) {
      toast.success("Agendamento cancelado.")
      setOpen(false)
      if (onSuccess) onSuccess()
    } else {
      toast.error(result.error)
    }
  }

  const selectedPet = options.pets.find(p => p.id === petId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] bg-slate-50 border-slate-300 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-slate-800">
            Editar Agendamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6 pt-2">
          
          <div className="grid grid-cols-2 gap-4">
            {/* DATA */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-slate-800 font-bold">Data *</Label>
              <input 
                type="date"
                id="date"
                value={dateStr}
                onChange={e => setDateStr(e.target.value)}
                required
                className="flex h-12 w-full rounded-md border-2 border-slate-400 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              />
            </div>
            
            {/* HORÁRIO */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-slate-800 font-bold">Horário Inicial *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <select 
                  id="time" 
                  name="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="flex h-12 w-full rounded-md border-2 border-slate-400 bg-white pl-10 pr-3 py-2 text-base text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <option value={time}>{time}</option>
                  {TIME_SLOTS.filter(s => s !== time).map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PET */}
          <div className="space-y-2 flex flex-col">
            <Label className="text-slate-800 font-bold">Pet *</Label>
            <Popover open={petComboboxOpen} onOpenChange={setPetComboboxOpen}>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    role="combobox"
                    aria-expanded={petComboboxOpen}
                    className="inline-flex items-center justify-between w-full h-12 px-3 border-2 border-slate-400 rounded-md bg-white hover:bg-slate-50 text-slate-900 font-medium text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  />
                }
              >
                {selectedPet
                  ? `${selectedPet.name} (Tutor: ${selectedPet.client.user.name})`
                  : "Selecione ou pesquise o pet..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[450px] p-0 bg-white border-2 border-slate-300 shadow-xl z-50" align="start">
                <Command className="bg-white">
                  <CommandInput placeholder="Pesquisar por nome do pet..." className="h-11" />
                  <CommandList className="bg-white">
                    <CommandEmpty>Nenhum pet encontrado.</CommandEmpty>
                    <CommandGroup className="bg-white">
                      {options.pets.map((pet) => (
                        <CommandItem
                          key={pet.id}
                          value={`${pet.name} ${pet.client.user.name}`}
                          onSelect={() => {
                            setPetId(pet.id)
                            setPetComboboxOpen(false)
                          }}
                          className="cursor-pointer py-3 hover:bg-blue-50 aria-selected:bg-blue-50"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-blue-600",
                              petId === pet.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{pet.name}</span>
                            <span className="text-xs text-slate-500">Tutor: {pet.client.user.name}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* SERVIÇOS MULTIPLOS */}
          <div className="space-y-4">
            <Label className="text-slate-800 font-bold">Serviços *</Label>
            
            <div className="flex gap-2">
              <select 
                value={currentServiceSelect}
                onChange={(e) => setCurrentServiceSelect(e.target.value)}
                className="flex-1 h-12 rounded-md border-2 border-slate-400 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <option value="">Selecione o serviço...</option>
                {options.services.map(s => (
                  <option key={s.id} value={s.id} disabled={serviceIds.includes(s.id)}>
                    {s.name} ({s.durationMin} min)
                  </option>
                ))}
              </select>
              <Button type="button" onClick={handleAddService} className="h-12 bg-slate-800 hover:bg-slate-900 text-white font-bold px-4">
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>

            {selectedServices.length > 0 && (
              <div className="border border-slate-200 rounded-md bg-white p-3 space-y-2 shadow-inner">
                <div className="text-xs font-bold text-slate-500 uppercase mb-2">Serviços Selecionados:</div>
                {selectedServices.map(s => (
                  <div key={s.id} className="flex justify-between items-center bg-blue-50 border border-blue-200 p-2 rounded-md">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{s.name}</span>
                      <span className="text-xs text-slate-500">{s.durationMin} min • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(s.price)}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveService(s.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center px-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase">Duração Total</span>
                    <span className="font-bold text-slate-800">{totalDuration} min</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-500 uppercase">Valor Total</span>
                    <span className="font-bold text-emerald-600 text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL'}).format(totalPrice)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {serviceIds.length === 0 && (
              <div className="text-sm text-red-500 font-medium">Adicione ao menos um serviço.</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* PROFISSIONAL */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="employeeId" className="text-slate-800 font-bold flex justify-between">
                Profissional *
              </Label>
              <select 
                id="employeeId" 
                name="employeeId" 
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                disabled={serviceIds.length === 0 || availableEmployees.length === 0}
                className="flex h-12 w-full rounded-md border-2 border-slate-400 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50 disabled:bg-slate-200"
              >
                <option value="">
                  {serviceIds.length === 0 ? "Escolha serviços..." : "Profissional..."}
                </option>
                {availableEmployees.map(e => (
                  <option key={e.id} value={e.id}>{e.user.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* STATUS */}
          <div className="space-y-2 mt-4">
            <Label className="text-slate-800 font-bold flex justify-between">
              Status *
            </Label>
            <FormStatusSelector value={status} onChange={setStatus} />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between gap-4">
            {appointment.status !== 'CANCELADO' && (
              <Button type="button" variant="destructive" className="h-12 px-6" onClick={handleCancel} disabled={canceling}>
                {canceling ? "Cancelando..." : "Cancelar Agendamento"}
              </Button>
            )}
            <Button type="submit" size="lg" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-12" disabled={loading || serviceIds.length === 0}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
