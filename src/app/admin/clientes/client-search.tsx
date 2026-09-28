"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function ClientSearch() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Buscar por nome do cliente, pet ou WhatsApp..."
        className="pl-10"
        defaultValue={searchParams.get('q')?.toString()}
        onChange={(e) => {
          handleSearch(e.target.value)
        }}
      />
    </div>
  )
}
