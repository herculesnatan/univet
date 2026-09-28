import { getServices } from "@/app/actions/services"
import { getEmployees } from "@/app/actions/employees"
import { ServiceSearch } from "./service-search"
import { ToggleServiceButton } from "./toggle-service-button"
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
import { Plus, Edit, UserPlus, Scissors } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleEmployeeButton } from "./toggle-employee-button"
import { NewEmployeeModal } from "./new-employee-modal"

export default async function ServicesPage({ searchParams }: { searchParams: { q?: string } }) {
  const services = await getServices(searchParams.q)
  const employees = await getEmployees()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Serviços e Colaboradores</h2>
        <p className="text-muted-foreground mt-1">
          Gerencie os serviços oferecidos e os colaboradores habilitados para executá-los.
        </p>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="mb-6 bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium px-6 py-2 flex items-center gap-2">
            <Scissors className="w-4 h-4" /> Serviços oferecidos
          </TabsTrigger>
          <TabsTrigger value="employees" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium px-6 py-2 flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Colaboradores
          </TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* TABS CONTENT: SERVIÇOS                                       */}
        {/* ============================================================== */}
        <TabsContent value="services" className="space-y-4 outline-none">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <ServiceSearch />
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/admin/servicos/novo"><Plus className="w-4 h-4 mr-2" /> Novo Serviço</Link>
            </Button>
          </div>

          <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Serviço</TableHead>
                  <TableHead className="font-semibold text-slate-700">Valor e Duração</TableHead>
                  <TableHead className="font-semibold text-slate-700">Colaboradores Habilitados</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      Nenhum serviço encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="font-bold text-slate-900">{service.name}</div>
                        <div className="text-sm text-slate-500 max-w-[200px] truncate">{service.description || "Sem descrição"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                          }).format(service.price)}
                        </div>
                        <div className="text-sm text-slate-500">{service.durationMin} min</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {service.employees.length === 0 ? (
                            <span className="text-xs text-slate-400">Nenhum</span>
                          ) : (
                            service.employees.map(emp => (
                              <Badge key={emp.id} variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 font-medium">
                                {emp.user.name}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.isActive ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary" className="font-bold">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild className="border-slate-300 text-slate-700 hover:bg-slate-100">
                            <Link href={`/admin/servicos/${service.id}/editar`}>
                              <Edit className="w-4 h-4 mr-2" /> Editar
                            </Link>
                          </Button>
                          <ToggleServiceButton id={service.id} isActive={service.isActive} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ============================================================== */}
        {/* TABS CONTENT: COLABORADORES                                  */}
        {/* ============================================================== */}
        <TabsContent value="employees" className="space-y-4 outline-none">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="w-full sm:w-auto text-sm text-slate-500">
              Gerencie a equipe que pode realizar os atendimentos.
            </div>
            {/* Modal para adicionar um novo colaborador */}
            <NewEmployeeModal services={services} />
          </div>

          <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Colaborador</TableHead>
                  <TableHead className="font-semibold text-slate-700">Contato</TableHead>
                  <TableHead className="font-semibold text-slate-700">Serviços Habilitados</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      Nenhum colaborador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((emp) => (
                    <TableRow key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="font-bold text-slate-900">{emp.user.name}</div>
                        <div className="text-xs text-slate-500">{emp.user.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-slate-900">{emp.phone || "Nenhum"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {emp.services?.length === 0 ? (
                            <span className="text-xs text-slate-400">Nenhum</span>
                          ) : (
                            emp.services?.map((s: any) => (
                              <Badge key={s.id} variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 font-medium">
                                {s.name}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {emp.isActive ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary" className="font-bold">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <ToggleEmployeeButton id={emp.id} isActive={emp.isActive} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
