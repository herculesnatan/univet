"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { updateAppointmentStatus } from "@/app/actions/agenda"
import { toast } from "sonner"

export const STATUS_UI = {
  AGENDADO: { 
    label: "Agendado", 
    indicator: "🔵",
    activeClass: "border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500/20",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    hoverClass: "hover:border-blue-300 hover:bg-blue-50/50"
  },
  CONFIRMADO: { 
    label: "Confirmado", 
    indicator: "🟣",
    activeClass: "border-purple-500 bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-500/20",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    hoverClass: "hover:border-purple-300 hover:bg-purple-50/50"
  },
  EM_ATENDIMENTO: { 
    label: "Em atendimento", 
    indicator: "🟠",
    activeClass: "border-orange-500 bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-500/20",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    hoverClass: "hover:border-orange-300 hover:bg-orange-50/50"
  },
  FINALIZADO: { 
    label: "Concluído", 
    indicator: "🟢",
    activeClass: "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-500/20",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    hoverClass: "hover:border-emerald-300 hover:bg-emerald-50/50"
  },
  CANCELADO: { 
    label: "Cancelado", 
    indicator: "🔴",
    activeClass: "border-red-500 bg-red-50 text-red-700 shadow-sm ring-1 ring-red-500/20",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
    hoverClass: "hover:border-red-300 hover:bg-red-50/50"
  }
}

export const statusOrder = ["AGENDADO", "CONFIRMADO", "EM_ATENDIMENTO", "FINALIZADO", "CANCELADO"]

export function FormStatusSelector({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {statusOrder.map((key) => {
        const config = STATUS_UI[key as keyof typeof STATUS_UI]
        const isSelected = value === key

        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(key)}
            className={cn(
              "flex items-center justify-start gap-2 h-11 px-3 rounded-md border-2 text-sm font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1",
              isSelected 
                ? config.activeClass 
                : cn("border-slate-200 bg-white text-slate-600", config.hoverClass)
            )}
          >
            <span className="text-base leading-none">{config.indicator}</span>
            <span className="truncate">{config.label}</span>
            {isSelected && <Check className="w-4 h-4 ml-auto opacity-70 shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}

export function AgendaQuickStatus({ 
  id, 
  currentStatus, 
  petName 
}: { 
  id: string, 
  currentStatus: string, 
  petName?: string 
}) {
  const [open, setOpen] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null)
  
  const config = STATUS_UI[currentStatus as keyof typeof STATUS_UI] || STATUS_UI.AGENDADO

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      setOpen(false)
      return
    }

    if (newStatus === 'CANCELADO') {
      const confirm = window.confirm(`Cancelar este agendamento do pet ${petName || ''}?\nEssa ação alterará o status do atendimento para Cancelado.`)
      if (!confirm) return
    }

    setLoadingStatus(newStatus)
    const result = await updateAppointmentStatus(id, newStatus)
    setLoadingStatus(null)

    if (result.success) {
      toast.success("Status atualizado.")
      setOpen(false)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button 
            onClick={(e) => {
              e.stopPropagation() // prevent opening edit modal
            }}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
              config.badgeClass,
              "hover:brightness-95"
            )}
          />
        }
      >
        <span className="leading-none">{config.indicator}</span>
        <span>{config.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-1.5" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-1">
          {statusOrder.map((key) => {
            const itemConfig = STATUS_UI[key as keyof typeof STATUS_UI]
            const isSelected = currentStatus === key
            const isLoading = loadingStatus === key

            return (
              <button
                key={key}
                disabled={isLoading || !!loadingStatus}
                onClick={(e) => {
                  e.stopPropagation()
                  handleStatusChange(key)
                }}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm font-semibold transition-colors disabled:opacity-50",
                  isSelected ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <span className="leading-none">{itemConfig.indicator}</span>
                <span className="flex-1 text-left">{itemConfig.label}</span>
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                ) : (
                  isSelected && <Check className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
