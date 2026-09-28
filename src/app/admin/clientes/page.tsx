import { getClients } from "@/app/actions/clients"
import { ClientSearch } from "./client-search"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function ClientsPage({ searchParams }: { searchParams: { q?: string } }) {
  const clients = await getClients(searchParams.q)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes e Pets</h2>
          <p className="text-muted-foreground">
            Gerencie os clientes cadastrados e seus respectivos pets.
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/admin/clientes/novo"><Plus className="w-4 h-4 mr-2" /> Novo Cliente</Link>
        </Button>
      </div>

      <div className="flex items-center">
        <ClientSearch />
      </div>

      <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Nome / Contato</TableHead>
              <TableHead className="font-semibold text-slate-700">Pets Associados</TableHead>
              <TableHead className="font-semibold text-slate-700">Último Atendimento</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => {
                // Find latest appointment across all pets
                const allAppointments = client.pets.flatMap(p => p.appointments)
                allAppointments.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                const lastAppt = allAppointments[0]

                return (
                  <TableRow key={client.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="font-medium text-slate-900">{client.user.name}</div>
                      <div className="text-sm text-slate-500">{client.user.email}</div>
                      <div className="text-sm text-slate-500">{client.whatsapp || client.phone || "Sem telefone"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {client.pets.length === 0 ? (
                          <span className="text-xs text-slate-400">Nenhum</span>
                        ) : (
                          client.pets.map(p => (
                            <Badge key={p.id} variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200">
                              {p.name}
                            </Badge>
                          ))
                        )}
                      </div>
                      {client._count.pets > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Total: {client._count.pets} pet(s)
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {lastAppt ? (
                        <span className="text-sm text-slate-700">{format(new Date(lastAppt.startTime), 'dd/MM/yyyy')}</span>
                      ) : (
                        <span className="text-xs text-slate-400">Nunca atendido</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild className="border-slate-300 text-slate-700 hover:bg-slate-100">
                        <Link href={`/admin/clientes/${client.id}`}>
                          <Eye className="w-4 h-4 mr-2" /> Visualizar
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
