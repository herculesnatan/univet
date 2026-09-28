"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { createPet } from "@/app/actions/pets"
import { toast } from "sonner"
import { ArrowLeft, Save, Dog } from "lucide-react"
import Link from "next/link"

export default function NovoPetPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const result = await createPet({
      clientId: params.id,
      name: formData.get("name") as string,
      species: formData.get("species") as string,
      breed: formData.get("breed") as string,
      sex: formData.get("sex") as string,
      birthDate: formData.get("birthDate") as string,
      weight: formData.get("weight") as string,
      size: formData.get("size") as string,
      color: formData.get("color") as string,
      notes: formData.get("notes") as string,
    })

    setLoading(false)

    if (result.success) {
      toast.success("Pet adicionado com sucesso!")
      router.push(`/admin/clientes/${params.id}`)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/clientes/${params.id}`}><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Adicionar Pet</h2>
          <p className="text-muted-foreground">
            Adicionando um novo pet para o cliente selecionado.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
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
                <Label htmlFor="name" className="text-slate-700 font-semibold">Nome do Pet *</Label>
                <Input id="name" name="name" required placeholder="Ex: Mel" />
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
                <Input id="breed" name="breed" placeholder="Ex: Shih-tzu" />
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
                <Input id="weight" name="weight" type="number" step="0.1" placeholder="Ex: 5.5" />
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
                <Input id="color" name="color" placeholder="Ex: Branco" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-700 font-semibold">Observações do Pet</Label>
              <Input id="notes" name="notes" placeholder="Detalhes opcionais..." />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 p-6 flex justify-end gap-4 border-t border-slate-200">
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/clientes/${params.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" size="lg" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8">
              {loading ? "Salvando..." : <><Save className="w-5 h-5 mr-2" /> Salvar Pet</>}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
