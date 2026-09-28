"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { updateClient } from "@/app/actions/clients"
import { toast } from "sonner"
import { ArrowLeft, Save, User } from "lucide-react"
import Link from "next/link"

export function EditarClienteClient({ clientData }: { clientData: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const result = await updateClient(clientData.id, {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      whatsapp: formData.get("whatsapp") as string,
      address: formData.get("address") as string,
      notes: formData.get("notes") as string,
    })

    setLoading(false)

    if (result.success) {
      toast.success("Cliente atualizado com sucesso!")
      router.push(`/admin/clientes/${clientData.id}`)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/admin/clientes/${clientData.id}`}><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Editar Cliente</h2>
          <p className="text-muted-foreground">
            Atualize as informações de cadastro.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
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
              <Input id="name" name="name" required defaultValue={clientData.user.name} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-semibold">E-mail *</Label>
                <Input id="email" name="email" type="email" required defaultValue={clientData.user.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-slate-700 font-semibold">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" defaultValue={clientData.whatsapp || ''} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-slate-700 font-semibold">Endereço Completo</Label>
              <Input id="address" name="address" defaultValue={clientData.address || ''} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-700 font-semibold">Observações do Cliente</Label>
              <Input id="notes" name="notes" defaultValue={clientData.notes || ''} />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 p-6 flex justify-end gap-4 border-t border-slate-200">
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/clientes/${clientData.id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" size="lg" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">
              {loading ? "Salvando..." : <><Save className="w-5 h-5 mr-2" /> Atualizar Cliente</>}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
