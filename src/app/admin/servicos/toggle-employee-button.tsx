"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Power, PowerOff } from "lucide-react"
import { toggleEmployee } from "@/app/actions/employees"
import { toast } from "sonner"

export function ToggleEmployeeButton({ id, isActive }: { id: string, isActive: boolean }) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleEmployee(id, isActive)
      if (result.success) {
        toast.success(`Colaborador ${isActive ? "desativado" : "ativado"} com sucesso.`)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Button 
      variant={isActive ? "destructive" : "default"} 
      size="sm" 
      onClick={handleToggle}
      disabled={isPending}
      className={!isActive ? "bg-emerald-600 hover:bg-emerald-700" : ""}
    >
      {isActive ? <PowerOff className="w-4 h-4 mr-2" /> : <Power className="w-4 h-4 mr-2" />}
      {isActive ? "Desativar" : "Ativar"}
    </Button>
  )
}
