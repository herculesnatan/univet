import { getPets } from "@/app/actions/pets"
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

export default async function PetsPage() {
  const pets = await getPets()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pets</h2>
          <p className="text-muted-foreground">
            Gerencie os animais cadastrados no sistema.
          </p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/admin/clientes">
            <Plus className="w-4 h-4 mr-2" /> Novo Pet (Via Cliente)
          </Link>
        </Button>
      </div>

      <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Nome do Pet</TableHead>
              <TableHead className="font-semibold text-slate-700">Detalhes</TableHead>
              <TableHead className="font-semibold text-slate-700">Tutor</TableHead>
              <TableHead className="font-semibold text-slate-700">Agendamentos</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  Nenhum pet cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              pets.map((pet) => (
                <TableRow key={pet.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <div className="font-bold text-slate-900">{pet.name}</div>
                    <div className="text-xs text-slate-500 capitalize">{pet.size.toLowerCase()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-slate-700">{pet.species}</div>
                    <div className="text-xs text-slate-500">
                      {pet.breed || "Sem raça"} • {pet.sex === "FEMEA" ? "Fêmea" : pet.sex === "MACHO" ? "Macho" : "Não inf."}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/clientes/${pet.clientId}`} className="text-sm font-medium text-blue-600 hover:underline">
                      {pet.client.user.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">{pet._count.appointments} registro(s)</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild className="border-slate-300 text-slate-700 hover:bg-slate-100">
                      <Link href={`/admin/clientes/${pet.clientId}`}>
                        <Eye className="w-4 h-4 mr-2" /> Ficha
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
