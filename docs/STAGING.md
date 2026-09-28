# Ambiente de Testes / Homologação (STAGING)

## Ambiente DEV
Utilizado para desenvolvimento local. 
As alterações são testadas primeiro aqui. Utiliza o banco de dados `dev.db` (via SQLite) mapeado no `.env.local`.

## Ambiente STAGING
Utilizado exclusivamente para testes/homologação de novos recursos e homologação do cliente/testador antes do lançamento em produção.
Este ambiente é acessível via internet, roda na porta `3001` localmente (via túnel) ou em plataforma de hospedagem, e tem sua **identificação visual própria** (`[STAGING]` no menu).

## Banco STAGING
Possui um banco de dados **totalmente separado** e persistente.
Atualmente configurado no arquivo `.env.staging` para usar o arquivo local SQLite `staging.db`.
Os dados do STAGING não enxergam os dados do DEV e vice-versa. 
*Importante:* os dados dos testadores são persistentes e não serão apagados em novos deploys.

## Deploy
Para publicar uma nova versão ou testar o Staging localmente:
1. `npm run build:staging` (Faz o build da aplicação com as variáveis do staging)
2. `npm run start:staging` (Roda o Next.js de staging na porta 3001)
3. `npm run tunnel:staging` (Se rodando local, cria uma URL pública acessível via internet usando o localtunnel)

Você pode usar o atalho `npm run staging` para rodar DB Migrations, Build e Start numa tacada só.

## Migrations
Sempre que uma nova funcionalidade que altera o banco de dados for criada, crie a migration normalmente com `npx prisma migrate dev` (que aplica ao `dev.db`).
Para atualizar o banco STAGING **sem perder dados**:
Execute `npm run db:staging`, que por trás aciona o comando:
`dotenv -e .env.staging -- prisma migrate deploy`
Isso aplica apenas as mudanças estruturais novas e preserva os dados existentes!

## Variáveis de Ambiente
As configurações ficam no arquivo `.env.staging`.
Nunca exponha esse arquivo no versionamento (Git).
Para que o ambiente funcione corretamente, você deve configurar:
- `DATABASE_URL` (ex: `file:./staging.db`)
- `NEXTAUTH_SECRET` (Uma chave forte para JWT)
- `NEXTAUTH_URL` (URL pública gerada pelo localtunnel ou deploy, ex: `https://staging.univet.com.br`)
- `NEXT_PUBLIC_APP_ENV="staging"` (Aciona as identificações visuais no Frontend)

## Reset (CUIDADO)
O comando padrão de seed (`npm run db:staging`) **não é destrutivo**. Ele é idempotente e apenas recria o Administrador padrão se ele não existir.
**ATENÇÃO:** Nunca execute `prisma migrate reset` apontando para o `.env.staging`. Esse comando é altamente destrutivo e APAGARÁ o banco de dados inteiro dos testadores. Se for rodar resets, sempre use o ambiente local/dev.

## Backup
Como estamos usando SQLite temporariamente para o Staging local (`staging.db`), a estratégia de backup é muito simples:
Basta copiar e colar o arquivo `staging.db` para uma pasta segura em nuvem ou disco externo periodicamente. Em plataformas serverless, lembre-se de que se não houver um *Volume Persistente*, o arquivo será perdido a cada reinício. Recomenda-se migrar para PostgreSQL ou usar volumes persistentes em VPS/Render quando for colocar em uso massivo de Staging.
