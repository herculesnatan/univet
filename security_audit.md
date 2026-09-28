# Relatório de Auditoria de Segurança — UNIVET

## Fases Executadas
1 a 17 analisadas detalhadamente.
**Arquitetura Base:** Next.js 14, TypeScript, NextAuth (Credentials), SQLite (Prisma).

## Modelo de Ameaças & Diagnóstico de RLS
Como o banco de dados utilizado é o **SQLite**, não existe o conceito de RLS (Row Level Security) nativo no motor do banco (diferente do PostgreSQL/Supabase). Portanto, a segurança **deve ser obrigatoriamente aplicada na camada de aplicação** (nas Server Actions e Endpoints da API).

Durante a auditoria, foi constatado que a camada visual (Frontend e Layouts) está protegida, bloqueando renderização para usuários não autorizados. No entanto, as Server Actions (backend) estavam completamente expostas.

## Vulnerabilidades Encontradas

| ID | Severidade | Vulnerabilidade | Local (Arquivo/Componente) | Status |
|---|---|---|---|---|
| SEC-001 | CRÍTICA | Broken Access Control (Falta de Autenticação) | `src/app/actions/*.ts` (todas as ações) | Pendente |
| SEC-002 | CRÍTICA | IDOR / BOLA em Atualizações | `updateClient`, `updatePet`, `updateAppointmentStatus` | Pendente |
| SEC-003 | ALTA | RLS Application-Level Ausente | `updateAppointmentStatus` e exclusões | Pendente |
| SEC-004 | ALTA | Account Takeover | `updateClient` (permite troca de e-mail sem verificação de posse) | Pendente |
| SEC-005 | MÉDIA | Fuga de Dados Administrativos | `getDashboardKPIs` e relatórios | Pendente |

### Detalhamento:
* **SEC-001 (Falta de Autenticação nas Server Actions):** Nenhuma Server Action (com exceção da recém-criada `getColaboradorAgendaData`) chama o `getServerSession()`. Isso significa que qualquer requisição POST direta (via cURL, Postman ou DevTools) para o endpoint do Next.js será executada como se fosse um administrador, mesmo por um usuário não logado.
* **SEC-002 (IDOR - Insecure Direct Object Reference):** Se um atacante (ou funcionário curioso) enviar uma requisição direta para `updateClient(id_de_outro_cliente, {email: "meu_email@hacker.com"})`, o sistema aceitará, pois confia 100% no ID recebido.
* **SEC-003 (RLS no Backend):** Um colaborador, que deveria apenas modificar o status dos *seus próprios agendamentos*, conseguiria facilmente enviar uma requisição de `updateAppointmentStatus` modificando a agenda de um colega.

## Estratégia de Correção Planejada (Fase 19)

1. **Centralização da Autenticação:**
   Criar um utilitário `src/lib/server-auth.ts` com funções validadoras rigorosas (`requireAdmin`, `requireEmployeeOrAdmin`).

2. **Blindagem das Server Actions (SEC-001 e SEC-005):**
   Injetar `await requireAdmin()` na primeira linha de TODAS as ações administrativas (`clients.ts`, `pets.ts`, `services.ts`, `employees.ts`, `dashboard.ts`).

3. **Blindagem de IDOR e Application-Level RLS (SEC-002 e SEC-003):**
   Na ação `updateAppointmentStatus`, verificar se o usuário é ADMIN. Se for `FUNCIONARIO`, o sistema deverá forçosamente buscar o agendamento primeiro (`SELECT employeeId`) e confirmar se o `employeeId` pertence à entidade Colaborador vinculada ao `session.user.id`. Só então o `UPDATE` será liberado.

4. **Tratamento de Exclusões:**
   Mesma regra rigorosa para `cancelAppointment`.

Esta estratégia manterá a arquitetura atual de Server Actions e Prisma intacta, garantindo máxima segurança sem quebrar nenhuma interface visual ou fluxo existente.
