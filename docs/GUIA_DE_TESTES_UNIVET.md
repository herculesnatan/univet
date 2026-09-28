# Guia Prático de Testes - UNIVET

Bem-vindo ao ambiente de testes do **UNIVET**! 
Este guia foi feito para te ajudar a navegar e testar o sistema de forma simples.

---

## 1. O que é o UNIVET?
O UNIVET é um sistema moderno de gerenciamento para Pet Shops. Ele foi criado para organizar o cadastro de clientes e seus pets, gerenciar os serviços oferecidos, controlar o acesso de colaboradores e, principalmente, manter a agenda do Pet Shop funcionando perfeitamente.

---

## 2. Como acessar o ambiente de Testes
Este é o ambiente **STAGING (Testes)**. Tudo o que você fizer aqui ficará salvo, mas **não** afetará o sistema oficial. Você verá uma etiqueta indicando `[STAGING]` no menu do sistema para lembrar que está em ambiente seguro para errar e testar!

**Passo a passo para entrar:**
1. Acesse o link de testes fornecido pela equipe (ex: `https://univet-staging...loca.lt`)
2. Insira o e-mail de administrador de testes: `admin@petshop.com`
3. Insira a senha de testes: `admin123`
4. Clique em Entrar.

*Dica: Você também pode testar criar um colaborador no sistema e fazer login com as credenciais dele depois!*

---

## 3. O que testar e como fazer

### Clientes e Pets
1. Vá no menu **Clientes** e clique em "Novo Cliente".
2. **Cadastre um cliente:** Ex: *Maria da Silva*, preencha um telefone e salve.
3. **Cadastre um pet:** Na tela da cliente Maria, clique em "Adicionar Pet". Cadastre o *Thor* (Cachorro, Golden Retriever) e salve.
4. **Edite informações:** Tente editar o nome do pet ou os dados da cliente para ver se o sistema atualiza.

### Serviços
1. Acesse **Serviços** no menu esquerdo.
2. Cadastre um novo serviço clicando em "Novo Serviço" (Ex: *Banho Completo Porte Grande*, R$ 80,00, duração 60 minutos).
3. Verifique se ele aparece na listagem. Tente editar o preço.

### Colaboradores
1. Vá no menu **Equipe/Colaboradores** (se disponível na versão atual do painel).
2. Cadastre um novo colaborador. Defina o nome e os dados de acesso dele.
3. O administrador vê a agenda de todos. O colaborador, quando faz login, verá apenas a agenda dele.

### Agenda
O coração do sistema! Vá no menu **Agenda**.
1. Clique em **Novo Agendamento** (ou clique num espaço vazio do calendário).
2. Selecione um **Cliente** (ex: Maria da Silva).
3. Selecione o **Pet** (ex: Thor).
4. Escolha **Data e Horário**.
5. Selecione **um ou mais serviços** (ex: Banho + Tosa).
6. Atribua a um **Colaborador** responsável.
7. O status inicial será "Agendado". Clique em Salvar.
8. Teste editar o agendamento clicando nele, ou mude a visualização do calendário (Dia, Semana, Mês).

---

## 4. Testando os Status do Atendimento
Você pode alterar os status clicando no agendamento, seja na tela da Agenda ou no Painel Inicial (Dashboard). Cada cor e status significa uma etapa do trabalho:

* **AGENDADO:** O serviço foi marcado no calendário (ainda vai acontecer).
* **CONFIRMADO:** O tutor confirmou que vai trazer o pet.
* **EM ATENDIMENTO:** O pet chegou e está tomando banho/tosa.
* **FINALIZADO:** O serviço terminou e o pet está pronto.
* **CANCELADO:** O tutor desmarcou ou não apareceu.

---

## 5. Testando o acesso do Colaborador
O sistema separa o que o Dono (Admin) e o Funcionário (Colaborador) podem ver.

1. Clique em **Sair / Logout** do usuário Administrador.
2. Entre com o usuário e senha de um colaborador que você criou.
3. Acesse **Minha Agenda** no menu.
4. Verifique os atendimentos designados apenas para você no dia.
5. Abra um atendimento e altere o status (ex: mude para "Em Atendimento" quando começar a trabalhar).
6. Note que, como colaborador, o sistema oculta o "Dashboard Financeiro" e as configurações gerais do Pet Shop para sua segurança e foco.

*(Nota: a visualização do colaborador pode estar recebendo melhorias. Reporte o que achar estranho!)*

---

## 6. Dashboard (Painel Inicial)
Quando você faz login como Administrador, a primeira tela é o **Dashboard**.
* **Resumo do dia:** Um texto que diz quantos pets vêm hoje.
* **Números / KPIs:** Quadros coloridos mostrando faturamento do dia, quantidade de atendimentos, etc.
* **Gráfico de Faturamento:** Mostra a evolução das vendas nos últimos 7 dias.
* **Agenda do Dia:** Uma linha do tempo prática. Você pode mudar o status do pet (ex: de Agendado para Finalizado) direto por lá!

---

## 7. Exemplo de Teste Completo (Faça isso!)
Este é o teste principal sugerido para você conhecer o sistema de ponta a ponta:

1. Vá em Clientes e crie a cliente "Joana".
2. Crie o pet "Bolinha" para a Joana.
3. Vá na Agenda e crie um Agendamento para hoje.
4. Escolha o pet Bolinha, adicione os serviços "Banho" e "Hidratação", escolha um colaborador.
5. Salve o agendamento.
6. Volte para a tela Inicial (Dashboard). O Bolinha deve estar na lista do dia!
7. No próprio Dashboard, clique no status "Agendado" do Bolinha e mude para "Em Atendimento".
8. Depois, mude para "Finalizado".
9. Vá em Agenda e verifique se o status do Bolinha atualizou por lá também.
10. O Faturamento de Hoje no Dashboard deve ter aumentado.

---

## 8. Testando a Persistência (Importante!)
**Os dados inseridos no ambiente de testes ficam salvos.**
Para testar isso:
1. Siga o "Exemplo de Teste Completo" acima.
2. Saia do sistema (Logout).
3. Atualize a página do navegador (F5).
4. Entre novamente.
5. Confira se a cliente Joana e o Bolinha ainda estão lá e se o Dashboard continua mostrando o atendimento.

---

## 9. Encontrou um erro? Como reportar!
Se algo quebrou ou deu uma mensagem estranha, por favor, avise a equipe de desenvolvimento! 
Mande uma mensagem contendo:
* **O que estava tentando fazer** (Ex: Tentar salvar um agendamento sem escolher o pet).
* **O que aconteceu** (Ex: A tela ficou toda branca).
* **O que esperava que acontecesse** (Ex: O sistema avisar que faltou o pet).
* **Data e horário aproximados**.
* Se possível, envie um **print (foto)** da tela do erro.

---

## 10. Checklist Rápido de Testes
Use esta listinha para guiar seus testes:

- [ ] Consegui entrar no sistema usando `admin@petshop.com`.
- [ ] Consegui cadastrar um cliente.
- [ ] Consegui cadastrar um pet.
- [ ] Consegui cadastrar ou editar serviços.
- [ ] Consegui criar um agendamento.
- [ ] Consegui selecionar dois serviços no mesmo agendamento.
- [ ] Consegui selecionar um colaborador na agenda.
- [ ] Consegui editar e cancelar um agendamento.
- [ ] Consegui alterar o status no Dashboard ou na Agenda.
- [ ] Testei o acesso com o login de um colaborador.
- [ ] Saí do sistema, entrei novamente e meus dados continuaram salvos!
