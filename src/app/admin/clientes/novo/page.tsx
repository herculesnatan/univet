"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { createClientWithPet } from "@/app/actions/clients"
import { toast } from "sonner"
import { ArrowLeft, Save, User, Dog } from "lucide-react"
import Link from "next/link"

export default function NovoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const result = await createClientWithPet({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      whatsapp: formData.get("whatsapp") as string,
      address: formData.get("address") as string,
      clientNotes: formData.get("clientNotes") as string,
      
      petName: formData.get("petName") as string,
      species: formData.get("species") as string,
      breed: formData.get("breed") as string,
      sex: formData.get("sex") as string,
      birthDate: formData.get("birthDate") as string,
      weight: formData.get("weight") as string,
      size: formData.get("size") as string,
      color: formData.get("color") as string,
      petNotes: formData.get("petNotes") as string,
    })

    setLoading(false)

    if (result.success) {
      toast.success("Cliente cadastrado com sucesso!", {
        description: `O pet ${result.pet?.name} foi associado a ${result.client?.user?.name || formData.get("name")}.`
      })
      router.push("/admin/clientes")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/clientes"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Novo Cliente</h2>
          <p className="text-muted-foreground">
            Cadastre o cliente e seu primeiro pet em um único passo.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="space-y-8">
          
          {/* DADOS DO CLIENTE */}
          <Card className="border-slate-300 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                <User className="w-5 h-5 text-blue-600" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-semibold">Nome completo *</Label>
                <Input id="name" name="name" required placeholder="Ex: João da Silva" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-semibold">E-mail *</Label>
                  <Input id="email" name="email" type="email" required placeholder="joao@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-slate-700 font-semibold">WhatsApp</Label>
                  <Input id="whatsapp" name="whatsapp" placeholder="(11) 90000-0000" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-700 font-semibold">Endereço Completo</Label>
                <Input id="address" name="address" placeholder="Rua Exemplo, 123 - Bairro, Cidade - UF" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientNotes" className="text-slate-700 font-semibold">Observações do Cliente</Label>
                <Input id="clientNotes" name="clientNotes" placeholder="Ex: Prefere contato pelo WhatsApp" />
              </div>
            </CardContent>
          </Card>

          {/* DADOS DO PET */}
          <Card className="border-slate-300 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                <Dog className="w-5 h-5 text-orange-500" />
                Dados do Pet
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="petName" className="text-slate-700 font-semibold">Nome do Pet *</Label>
                  <Input id="petName" name="petName" required placeholder="Ex: Thor" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="species" className="text-slate-700 font-semibold">Espécie *</Label>
                  <Input id="species" name="species" list="species-list" required placeholder="Ex: Cachorro, Gato..." />
                  <datalist id="species-list">
                    <option value="Cachorro" />
                    <option value="Gato" />
                    <option value="Pássaro" />
                    <option value="Coelho" />
                    <option value="Roedor" />
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="breed" className="text-slate-700 font-semibold">Raça</Label>
                  <Input id="breed" name="breed" placeholder="Ex: Golden Retriever" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex" className="text-slate-700 font-semibold">Sexo *</Label>
                  <select 
                    id="sex" 
                    name="sex" 
                    required
                    className="flex h-10 w-full rounded-md border-2 !border-slate-400 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-blue-600"
                  >
                    <option value="MACHO">Macho</option>
                    <option value="FEMEA">Fêmea</option>
                    <option value="NAO_INFORMADO">Não Informado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-slate-700 font-semibold">Data de Nasc. (Aprox.)</Label>
                  <Input id="birthDate" name="birthDate" type="date" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-slate-700 font-semibold">Peso (kg)</Label>
                  <Input id="weight" name="weight" type="number" step="0.1" placeholder="Ex: 15.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size" className="text-slate-700 font-semibold">Porte *</Label>
                  <select 
                    id="size" 
                    name="size" 
                    required
                    className="flex h-10 w-full rounded-md border-2 !border-slate-400 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-blue-600"
                  >
                    <option value="PEQUENO">Pequeno (até 10kg)</option>
                    <option value="MEDIO">Médio (11 a 25kg)</option>
                    <option value="GRANDE">Grande (26 a 40kg)</option>
                    <option value="GIGANTE">Gigante (+40kg)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-slate-700 font-semibold">Cor</Label>
                  <Input id="color" name="color" placeholder="Ex: Caramelo" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="petNotes" className="text-slate-700 font-semibold">Observações do Pet</Label>
                <Input id="petNotes" name="petNotes" placeholder="Ex: Alérgico a frango, muito dócil..." />
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 p-6 flex justify-end gap-4 border-t border-slate-200">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/clientes">Cancelar</Link>
              </Button>
              <Button type="submit" size="lg" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">
                {loading ? "Salvando..." : <><Save className="w-5 h-5 mr-2" /> Cadastrar Cliente e Pet</>}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
