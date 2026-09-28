import { getActiveEmployees } from "@/app/actions/employees"
import { NovoServicoClient } from "./novo-servico-client"

export default async function NovoServicoPage() {
  const employees = await getActiveEmployees()

  return <NovoServicoClient employees={employees} />
}
