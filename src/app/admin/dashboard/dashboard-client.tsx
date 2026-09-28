"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import { getDashboardKPIs, getDashboardUpcomingAppointments, getDashboardRevenueChart } from "@/app/actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Users, Dog, Clock, UserPlus, Scissors, PlusCircle, CheckCircle2, ChevronRight, UserCircle } from "lucide-react"
import { AgendaQuickStatus } from "../agenda/status-components"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export function DashboardClient() {
  const [dateStr, setDateStr] = useState("")
  const [greeting, setGreeting] = useState("Bom dia")
  const [currentDateString, setCurrentDateString] = useState("")
  
  const [kpis, setKpis] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  
  const [chartPeriod, setChartPeriod] = useState<'hoje' | '7dias' | 'esteMes' | 'ultimoMes'>('7dias')
  const [chartData, setChartData] = useState<{name: string, value: number}[]>([])
  const [hasChartData, setHasChartData] = useState(false)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Setup initial date and greeting
    const now = new Date()
    setDateStr(now.toISOString())
    
    // Greeting
    const hour = now.getHours()
    if (hour < 12) setGreeting("Bom dia")
    else if (hour < 18) setGreeting("Boa tarde")
    else setGreeting("Boa noite")

    // Date String
    setCurrentDateString(format(now, "EEEE, d 'DE' MMMM", { locale: ptBR }).toUpperCase())
    
    // Fetch initial data
    async function loadData() {
      const isoStr = now.toISOString()
      const [kpiData, appData] = await Promise.all([
        getDashboardKPIs(isoStr),
        getDashboardUpcomingAppointments(isoStr)
      ])
      
      setKpis(kpiData)
      
      // Filter out past appointments for "Upcoming" list
      const upcoming = appData.filter((a: any) => {
        const [h, m] = a.time.split(':').map(Number)
        const appTime = new Date(now)
        appTime.setHours(h, m, 0, 0)
        return appTime >= now || a.status === 'EM_ATENDIMENTO'
      })
      setAppointments(upcoming)

      setLoading(false)
    }

    loadData()
  }, [])

  // Refetch chart when period changes
  useEffect(() => {
    if (!dateStr) return
    async function loadChart() {
      const { chartData: cData, hasData: cHasData } = await getDashboardRevenueChart(chartPeriod, dateStr)
      setChartData(cData)
      setHasChartData(cHasData)
    }
    loadChart()
  }, [chartPeriod, dateStr])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-slate-400 font-medium">Carregando painel de controle...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-[#F8FAFC] min-h-screen pb-12">
      
      {/* 1. CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold tracking-wider text-slate-500 mb-2">
            {currentDateString}
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">
            {greeting}, Administrador
          </h2>
          <p className="text-slate-500 mt-1 font-medium">
              {kpis.totalAppointments > 0 
                ? `Hoje você tem ${kpis.totalAppointments} atendimento${kpis.totalAppointments > 1 ? 's' : ''} agendado${kpis.totalAppointments > 1 ? 's' : ''}, sendo ${kpis.confirmedCount} confirmado${kpis.confirmedCount > 1 || kpis.confirmedCount === 0 ? 's' : ''} e ${kpis.pendingCount} pendente${kpis.pendingCount > 1 || kpis.pendingCount === 0 ? 's' : ''}.`
                : "Você não tem nenhum atendimento agendado para hoje."}
            </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-300 text-slate-700 bg-white" asChild>
            <Link href="/admin/agenda">Ver agenda</Link>
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm" asChild>
            <Link href="/admin/clientes/novo">+ Novo cliente</Link>
          </Button>
        </div>
      </div>

      {/* 2. INDICADORES PRINCIPAIS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-100 shadow-sm rounded-2xl bg-gradient-to-br from-emerald-50/50 to-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-emerald-800 tracking-wide">FATURAMENTO HOJE</span>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.todayRevenue)}
            </div>
            <div className="text-xs font-medium mt-2 text-slate-500">
              {kpis.hasFinalized ? "Faturamento real consolidado hoje" : "Nenhum atendimento faturado hoje"}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm rounded-2xl bg-gradient-to-br from-blue-50/50 to-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-blue-800 tracking-wide">AGENDAMENTOS HOJE</span>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800">{kpis.totalAppointments}</div>
            <div className="text-xs font-medium mt-2 text-slate-500">
              {kpis.confirmedCount} confirmados · {kpis.pendingCount} pendentes
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm rounded-2xl bg-gradient-to-br from-orange-50/50 to-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-orange-800 tracking-wide">CLIENTES ATIVOS</span>
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800">{kpis.totalClients}</div>
            <div className="text-xs font-medium mt-2 text-slate-500">
              Base ativa · clientes cadastrados
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-100 shadow-sm rounded-2xl bg-gradient-to-br from-pink-50/50 to-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-pink-800 tracking-wide">PETS CADASTRADOS</span>
              <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center">
                <Dog className="w-5 h-5 text-pink-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800">{kpis.totalPets}</div>
            <div className="text-xs font-medium mt-2 text-slate-500">
              Pets vinculados aos clientes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3 & 4. DESEMPENHO E PRÓXIMOS ATENDIMENTOS */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        
        {/* DESEMPENHO FINANCEIRO */}
        <Card className="border-slate-200 shadow-sm rounded-xl bg-white flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Desempenho financeiro</CardTitle>
              <CardDescription className="text-sm text-slate-500 font-medium">Acompanhe a evolução do faturamento</CardDescription>
            </div>
            <Select value={chartPeriod} onValueChange={(val: any) => setChartPeriod(val)}>
              <SelectTrigger className="w-[160px] h-9 text-sm font-semibold bg-white border-slate-200 text-slate-700">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                <SelectItem value="esteMes">Este mês</SelectItem>
                <SelectItem value="ultimoMes">Último mês</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center min-h-[300px]">
            {hasChartData ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                      tickFormatter={(value) => `R$ ${value}`}
                      dx={-10}
                    />
                    <Tooltip 
                      cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Faturamento']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      activeDot={{ r: 6, fill: '#10B981', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                  <DollarSign className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-lg font-bold text-slate-700">Sem dados financeiros</h4>
                <p className="text-sm font-medium text-slate-500 max-w-xs">
                  Quando houver atendimentos concluídos, o faturamento aparecerá aqui.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PRÓXIMOS ATENDIMENTOS */}
        <Card className="border-slate-200 shadow-sm rounded-xl bg-white flex flex-col h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Próximos atendimentos</CardTitle>
              <CardDescription className="text-sm text-slate-500 font-medium">Agenda do dia</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold -mr-2" asChild>
              <Link href="/admin/agenda">Ver agenda</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {appointments.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2">
                {appointments.map((app) => (
                  <div key={app.id} className="p-5 flex gap-4 items-start hover:bg-slate-50 transition-colors relative group">
                    <div className="w-16 shrink-0">
                      <div className="text-sm font-black text-slate-800 bg-slate-100/80 px-2 py-1.5 rounded-md text-center border border-slate-200">{app.time}</div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-bold text-slate-800 truncate text-base">{app.petName} <span className="text-slate-400 font-medium text-xs ml-1">({app.petBreed ? `${app.petBreed} - ` : ''}{app.petSpecies})</span></div>
                          <div className="text-xs text-slate-500 font-medium truncate">Tutor: {app.clientName}</div>
                        </div>
                        <div className="shrink-0">
                          <AgendaQuickStatus id={app.id} currentStatus={app.status} petName={app.petName} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center mt-1">
                        <div className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md inline-block truncate max-w-full">
                          {app.servicesText}
                        </div>
                        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md">
                          <UserCircle className="w-3.5 h-3.5"/> {app.employeeName}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 flex-1">
                <div className="text-4xl mb-4"></div>
                <h4 className="text-lg font-bold text-slate-700 mb-2">Nenhum atendimento hoje</h4>
                <p className="text-sm font-medium text-slate-500 mb-6 px-4">
                  Quando houver agendamentos, eles aparecerão aqui com horário, pet e serviço.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold" asChild>
                  <Link href="/admin/agenda">
                    <PlusCircle className="w-4 h-4 mr-2" /> Criar agendamento
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5 & 6. VISÃO DA OPERAÇÃO E AÇÕES RÁPIDAS */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        
        {/* VISÃO DA OPERAÇÃO */}
        <Card className="border-slate-200 shadow-sm rounded-xl bg-white">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800">Visão da operação</CardTitle>
            <CardDescription className="text-sm text-slate-500 font-medium">Informações rápidas do cadastro</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              
              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Clientes cadastrados</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{kpis.totalClients} clientes ativos no sistema</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Ativo</Badge>
              </div>

              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                    <Dog className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Pets cadastrados</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{kpis.totalPets} pets vinculados aos clientes</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Ativo</Badge>
              </div>

              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Scissors className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Serviços</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Gerencie os serviços oferecidos pelo Pet Shop</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="font-bold text-slate-600" asChild>
                  <Link href="/admin/servicos">Gerenciar</Link>
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* AÇÕES RÁPIDAS */}
        <Card className="border-slate-200 shadow-sm rounded-xl bg-white">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-800">Ações rápidas</CardTitle>
            <CardDescription className="text-sm text-slate-500 font-medium">Acesse as tarefas mais usadas</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-3">
              <Link href="/admin/clientes/novo" className="flex items-center p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mr-3">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-800 group-hover:text-blue-800">+ Cadastrar cliente</div>
                  <div className="text-xs font-medium text-slate-500">Adicionar novo cliente</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
              </Link>

              <Link href="/admin/clientes" className="flex items-center p-3 rounded-lg border border-slate-200 hover:border-pink-300 hover:bg-pink-50 transition-all group">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-pink-600 group-hover:text-white transition-colors mr-3">
                  <Dog className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-800 group-hover:text-pink-800">🐾 Cadastrar pet</div>
                  <div className="text-xs font-medium text-slate-500">Vincular pet a cliente</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-pink-400" />
              </Link>

              <Link href="/admin/agenda" className="flex items-center p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mr-3">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-800 group-hover:text-blue-800">◷ Novo agendamento</div>
                  <div className="text-xs font-medium text-slate-500">Marcar um atendimento</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />
              </Link>

              <Link href="/admin/servicos" className="flex items-center p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all group">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-700 group-hover:text-white transition-colors mr-3">
                  <Scissors className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-800 group-hover:text-slate-800">✂ Serviços</div>
                  <div className="text-xs font-medium text-slate-500">Gerenciar serviços</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
