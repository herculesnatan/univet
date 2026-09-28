"use client"

import { Button } from "@/components/ui/button"
import { Power, PowerOff } from "lucide-react"
import { toggleServiceStatus } from "@/app/actions/services"
import { toast } from "sonner"
import { useState } from "react"

export function ToggleServiceButton({ id, isActive }: { id: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const result = await toggleServiceStatus(id, isActive)
    setLoading(false)
    if (result.success) {
      toast.success(`Serviço ${isActive ? 'desativado' : 'ativado'} com sucesso!`)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleToggle} 
      disabled={loading}
      className={isActive ? "text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-300" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-slate-300"}
    >
      {isActive ? <><PowerOff className="w-4 h-4 mr-2" /> Desativar</> : <><Power className="w-4 h-4 mr-2" /> Ativar</>}
    </Button>
  )
}
