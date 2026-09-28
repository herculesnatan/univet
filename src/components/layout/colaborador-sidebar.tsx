"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { CalendarDays, ListTodo, User } from "lucide-react"

const routes = [
  {
    label: "Minha Agenda",
    icon: CalendarDays,
    href: "/colaborador/agenda",
    color: "text-violet-500",
  },
  {
    label: "Próximos atendimentos",
    icon: ListTodo,
    href: "/colaborador/proximos",
    color: "text-emerald-500",
  },
  {
    label: "Meu perfil",
    icon: User,
    href: "/colaborador/perfil",
    color: "text-sky-500",
  },
]

export function ColaboradorSidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/colaborador/agenda" className="flex items-center pl-3 mb-14">
          <div className="bg-white/10 p-2 rounded-lg mr-3">
            <span className="text-xl font-bold">🐾</span>
          </div>
          <h1 className="text-xl font-bold flex items-center">
            Univet
            {process.env.NEXT_PUBLIC_APP_ENV === 'staging' && (
              <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-300 font-bold px-2 py-0.5 rounded-full uppercase border border-yellow-500/30">Staging</span>
            )}
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
