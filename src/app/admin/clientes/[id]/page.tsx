import { getClientById } from "@/app/actions/clients"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Plus, Dog, User } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function ClientDetailsPage({ params }: { params: { id: string } }) {
  const client = await getClientById(params.id)

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/clientes"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{client.user.name}</h2>
          <p className="text-muted-foreground">
            Detalhes do cliente e pets associados
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CLIENT INFO */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-slate-300 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Cliente
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="h-8 text-blue-600">
                <Link href={`/admin/clientes/${client.id}/editar`}>
                  <Edit className="w-4 h-4 mr-2" /> Editar
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">E-mail</span>
                <span className="font-medium text-slate-900">{client.user.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">WhatsApp</span>
                <span className="font-medium text-slate-900">{client.whatsapp || client.phone || "Não informado"}</span>
              </div>
              {client.cpf && (
                <div>
                  <span className="text-slate-500 block mb-1">CPF</span>
                  <span className="font-medium text-slate-900">{client.cpf}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 block mb-1">Endereço</span>
                <span className="font-medium text-slate-900">{client.address || "Não informado"}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Observações</span>
                <span className="font-medium text-slate-900">{client.notes || "Nenhuma"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PETS INFO */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Dog className="w-5 h-5 text-orange-500" /> Pets Associados ({client.pets.length})
            </h3>
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
              <Link href={`/admin/clientes/${client.id}/novo-pet`}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar Pet
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {client.pets.length === 0 ? (
              <div className="col-span-2 text-center p-8 border-2 border-dashed border-slate-300 rounded-lg text-slate-500">
                Este cliente ainda não possui pets cadastrados.
              </div>
            ) : (
              client.pets.map(pet => (
                <Card key={pet.id} className="border-slate-300 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">{pet.name}</h4>
                      <div className="text-xs text-slate-500 mt-1">
                        {pet.species} {pet.breed ? `• ${pet.breed}` : ""}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-500 hover:text-blue-600">
                      <Link href={`/admin/pets/${pet.id}/editar`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <ul className="text-sm space-y-2">
                      <li className="flex justify-between">
                        <span className="text-slate-500">Porte:</span>
                        <span className="font-medium text-slate-900 capitalize">{pet.size.toLowerCase()}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-slate-500">Sexo:</span>
                        <span className="font-medium text-slate-900 capitalize">{pet.sex === "FEMEA" ? "Fêmea" : pet.sex === "MACHO" ? "Macho" : "Não inf."}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-slate-500">Idade Aprox.:</span>
                        <span className="font-medium text-slate-900">
                          {pet.birthDate ? format(new Date(pet.birthDate), 'MMM yyyy', { locale: ptBR }) : "Desconhecida"}
                        </span>
                      </li>
                      {pet.weight && (
                        <li className="flex justify-between">
                          <span className="text-slate-500">Peso:</span>
                          <span className="font-medium text-slate-900">{pet.weight} kg</span>
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
