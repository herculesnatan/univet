import { getServiceById } from "@/app/actions/services"
import { getActiveEmployees } from "@/app/actions/employees"
import { notFound } from "next/navigation"
import { EditarServicoClient } from "./editar-servico-client"

export default async function EditarServicoPage({ params }: { params: { id: string } }) {
  const [service, employees] = await Promise.all([
    getServiceById(params.id),
    getActiveEmployees()
  ])

  if (!service) {
    notFound()
  }

  return <EditarServicoClient service={service} employees={employees} />
}
