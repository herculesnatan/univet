import { getPetById } from "@/app/actions/pets"
import { notFound } from "next/navigation"
import { EditarPetClient } from "./editar-pet"

export default async function EditarPetPage({ params }: { params: { id: string } }) {
  const petData = await getPetById(params.id)

  if (!petData) {
    notFound()
  }

  return <EditarPetClient petData={petData} />
}
