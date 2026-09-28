import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ColaboradorAgendaView } from "./colaborador-agenda-view"

export default async function ColaboradorAgendaPage() {
  const session = await getServerSession(authOptions)
  const userName = session?.user?.name || "Colaborador"

  return (
    <div className="space-y-6 h-full flex flex-col pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Minha Agenda</h2>
        <p className="text-muted-foreground">
          Bom dia, {userName}!
        </p>
      </div>
      
      <ColaboradorAgendaView />
    </div>
  )
}
