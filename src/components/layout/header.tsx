"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut, Menu } from "lucide-react"

export function Header() {
  const { data: session } = useSession()

  return (
    <div className="flex items-center justify-between p-4 border-b h-16 bg-white">
      <div className="flex items-center">
        {/* Futuro botão de abrir menu no mobile */}
        <Button variant="ghost" size="icon" className="md:hidden mr-2">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-sm font-semibold">{session?.user?.name || "Usuário"}</span>
          <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
          {session?.user?.name?.charAt(0) || "U"}
        </div>
        
        <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: '/login' })} title="Sair">
          <LogOut className="w-5 h-5 text-slate-500 hover:text-destructive" />
        </Button>
      </div>
    </div>
  )
}
