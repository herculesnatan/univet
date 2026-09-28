"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Check, ChevronsUpDown, X } from "lucide-react"
import { createEmployee } from "@/app/actions/employees"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

export function NewEmployeeModal({ services }: { services: any[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [serviceComboboxOpen, setServiceComboboxOpen] = useState(false)

  const handleAddService = (id: string) => {
    if (!serviceIds.includes(id)) {
      setServiceIds([...serviceIds, id])
    }
    setServiceComboboxOpen(false)
  }

  const handleRemoveService = (id: string) => {
    setServiceIds(serviceIds.filter(sid => sid !== id))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await createEmployee({
      name,
      email,
      phone,
      serviceIds
    })

    setLoading(false)

    if (result.success) {
      toast.success("Colaborador criado com sucesso!")
      setOpen(false)
      setName("")
      setEmail("")
      setPhone("")
      setServiceIds([])
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <button 
            type="button" 
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50" 
          />
        }
      >
        <Plus className="w-4 h-4 mr-2" /> Novo Colaborador
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-slate-50 border-slate-300">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800">
            Cadastrar Colaborador
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-800 font-bold">Nome Completo *</Label>
            <Input 
              id="name" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="h-11 border-2 border-slate-300"
              placeholder="Ex: João da Silva"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-800 font-bold">E-mail (Login) *</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="h-11 border-2 border-slate-300"
              placeholder="joao@univet.com.br"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-800 font-bold">Celular / WhatsApp</Label>
            <Input 
              id="phone" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              className="h-11 border-2 border-slate-300"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-800 font-bold">Serviços Habilitados</Label>
            <Popover open={serviceComboboxOpen} onOpenChange={setServiceComboboxOpen}>
              <PopoverTrigger
                render={
                  <button
                    type="button"
                    role="combobox"
                    aria-expanded={serviceComboboxOpen}
                    className="inline-flex items-center justify-between w-full h-11 px-3 border-2 border-slate-300 rounded-md bg-white text-slate-600 font-normal text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  />
                }
              >
                Adicionar um serviço...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0 bg-white border-2 border-slate-300 z-50">
                <Command>
                  <CommandInput placeholder="Pesquisar serviço..." className="h-11" />
                  <CommandList>
                    <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
                    <CommandGroup>
                      {services.filter(s => !serviceIds.includes(s.id)).map(service => (
                        <CommandItem
                          key={service.id}
                          value={service.name}
                          onSelect={() => handleAddService(service.id)}
                          className="cursor-pointer"
                        >
                          <Check className="mr-2 h-4 w-4 opacity-0" />
                          {service.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {serviceIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {serviceIds.map(id => {
                  const s = services.find(x => x.id === id)
                  if (!s) return null
                  return (
                    <div key={id} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md border border-blue-200 text-sm font-medium">
                      {s.name}
                      <button type="button" onClick={() => handleRemoveService(id)} className="ml-1 text-slate-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12" disabled={loading}>
              {loading ? "Salvando..." : "Cadastrar Colaborador"}
            </Button>
            <p className="text-xs text-center text-slate-500 mt-3 font-medium">
              A senha de acesso padrão será: <strong className="text-slate-800">senha123</strong>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
