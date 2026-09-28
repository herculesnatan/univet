import { getClientById } from "@/app/actions/clients"
import { notFound } from "next/navigation"
import { EditarClienteClient } from "./editar-client"

export default async function EditarClientePage({ params }: { params: { id: string } }) {
  const clientData = await getClientById(params.id)

  if (!clientData) {
    notFound()
  }

  return <EditarClienteClient clientData={clientData} />
}
