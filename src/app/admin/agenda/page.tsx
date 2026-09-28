import { AgendaView } from "./agenda-view"

export default function AgendaPage() {
  return (
    <div className="space-y-6 h-full flex flex-col pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Agenda Univet</h2>
        <p className="text-muted-foreground">
          Gerencie os horários e serviços agendados no pet shop.
        </p>
      </div>
      
      {/* O componente cliente vai gerenciar as datas, view (dia/semana/mês) e buscar os dados via server actions, garantindo timezone local */}
      <AgendaView />
    </div>
  )
}
