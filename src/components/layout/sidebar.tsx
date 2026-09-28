"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, CalendarDays, Users, PawPrint, Scissors, Settings } from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Agenda",
    icon: CalendarDays,
    href: "/admin/agenda",
    color: "text-violet-500",
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/admin/clientes",
    color: "text-pink-700",
  },
  {
    label: "Pets",
    icon: PawPrint,
    href: "/admin/pets",
    color: "text-orange-500",
  },
  {
    label: "Serviços",
    icon: Scissors,
    href: "/admin/servicos",
    color: "text-emerald-500",
  },
  {
    label: "Configurações",
    icon: Settings,
    href: "/admin/config",
    color: "text-gray-500",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/admin/dashboard" className="flex items-center pl-3 mb-14">
          <div className="bg-white/10 p-2 rounded-lg mr-3">
            <PawPrint className="w-6 h-6 text-white" />
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
