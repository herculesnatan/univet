"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { updateService } from "@/app/actions/services"
import { toast } from "sonner"
import { ArrowLeft, Save, Briefcase, Users, Search } from "lucide-react"
import Link from "next/link"

export function EditarServicoClient({ service, employees }: { service: any, employees: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searchEmp, setSearchEmp] = useState("")
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    service.employees.map((emp: any) => emp.id)
  )

  const filteredEmployees = employees.filter(emp => 
    emp.user.name.toLowerCase().includes(searchEmp.toLowerCase())
  )

  function toggleEmployee(id: string) {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter(empId => empId !== id))
    } else {
      setSelectedEmployees([...selectedEmployees, id])
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const priceStr = formData.get("price") as string
    const durationStr = formData.get("durationMin") as string
    
    const price = parseFloat(priceStr.replace(',', '.'))
    const durationMin = parseInt(durationStr, 10)

    if (isNaN(price) || price < 0) {
      toast.error("Preço inválido.")
      setLoading(false)
      return
    }

    if (isNaN(durationMin) || durationMin <= 0) {
      toast.error("Duração inválida.")
      setLoading(false)
      return
    }

    const result = await updateService(service.id, {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price,
      durationMin,
      isActive: formData.has("isActive"),
      employeeIds: selectedEmployees
    })

    setLoading(false)

    if (result.success) {
      toast.success(`O serviço "${formData.get("name")}" foi atualizado com sucesso.`, {
        description: selectedEmployees.length > 0 
          ? `Colaboradores atualizados: ${employees.filter(e => selectedEmployees.includes(e.id)).map(e => e.user.name).join(', ')}` 
          : "Nenhum colaborador vinculado."
      })
      router.push("/admin/servicos")
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/servicos"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Editar Serviço</h2>
          <p className="text-muted-foreground">
            Atualize as informações do serviço e redefina os colaboradores habilitados.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="space-y-8">
          
          {/* INFORMAÇÕES DO SERVIÇO */}
          <Card className="border-slate-300 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Informações do Serviço
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-semibold">Nome do serviço *</Label>
                <Input id="name" name="name" required defaultValue={service.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700 font-semibold">Descrição</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={service.description || ""}
                  className="min-h-[100px] border-2 !border-slate-400 bg-slate-50 text-slate-900 focus-visible:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-slate-700 font-semibold">Preço (R$) *</Label>
                  <Input id="price" name="price" type="number" step="0.01" min="0" required defaultValue={service.price} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationMin" className="text-slate-700 font-semibold">Duração (minutos) *</Label>
                  <Input id="durationMin" name="durationMin" type="number" step="1" min="1" required defaultValue={service.durationMin} />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  name="isActive" 
                  defaultChecked={service.isActive}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                />
                <Label htmlFor="isActive" className="text-slate-700 font-semibold cursor-pointer select-none">
                  Serviço Ativo
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* COLABORADORES HABILITADOS */}
          <Card className="border-slate-300 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                <Users className="w-5 h-5 text-orange-500" />
                Colaboradores Habilitados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {employees.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-slate-300 rounded-lg text-slate-500">
                  <p className="mb-4">Nenhum colaborador cadastrado no sistema.</p>
                  <Button variant="outline" asChild>
                    <Link href="#">Cadastrar colaborador (Em breve)</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      placeholder="Pesquisar colaborador..." 
                      className="pl-10" 
                      value={searchEmp}
                      onChange={e => setSearchEmp(e.target.value)}
                    />
                  </div>
                  
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-md p-4 max-h-64 overflow-y-auto space-y-2">
                    {filteredEmployees.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">Nenhum colaborador encontrado.</p>
                    ) : (
                      filteredEmployees.map(emp => (
                        <label 
                          key={emp.id} 
                          className="flex items-center gap-3 p-3 rounded-md border border-slate-200 bg-white hover:bg-blue-50 cursor-pointer transition-colors"
                        >
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                            checked={selectedEmployees.includes(emp.id)}
                            onChange={() => toggleEmployee(emp.id)}
                          />
                          <span className="font-medium text-slate-900 select-none">{emp.user.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Selecione os colaboradores que estão aptos a realizar este serviço.
                  </p>
                </>
              )}
            </CardContent>
            <CardFooter className="bg-slate-50 p-6 flex justify-end gap-4 border-t border-slate-200">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/servicos">Cancelar</Link>
              </Button>
              <Button type="submit" size="lg" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">
                {loading ? "Salvando..." : <><Save className="w-5 h-5 mr-2" /> Atualizar Serviço</>}
              </Button>
            </CardFooter>
          </Card>

        </div>
      </form>
    </div>
  )
}
