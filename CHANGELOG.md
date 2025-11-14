# Changelog

Este documento resume as principais funcionalidades e as mudanças implementadas no sistema.

## Funcionalidades da Plataforma Base

Esta seção descreve o conjunto de funcionalidades principais da plataforma RC-CHAT em seu estado original.

### Plataforma de Atendimento

-   **Comunicação Centralizada via WhatsApp:** O núcleo do sistema funciona como um hub para atendimento via WhatsApp, permitindo a conexão com um aparelho celular através da leitura de um QR Code para enviar e receber mensagens.
-   **Sistema de Tickets/Helpdesk:** Converte novas conversas em tickets de atendimento, com gerenciamento de status (pendente, em atendimento, resolvido) e atribuição a operadores ou filas (departamentos).
-   **Comunicação em Tempo Real:** Utiliza Socket.IO para atualizações instantâneas na interface, mostrando novas mensagens e alterações nos tickets sem a necessidade de recarregar a página.

### Gestão de Relacionamento com o Cliente (CRM)

-   **Gerenciamento de Contatos:** Cadastra automaticamente os contatos e permite a edição de informações como nome e e-mail.
-   **Campos Personalizados:** Suporta a criação de campos customizados para armazenar informações específicas dos contatos.
-   **Sistema de Etiquetas (Tags):** Permite a criação de etiquetas para organizar e filtrar contatos e tickets.

### Arquitetura Multi-Empresas (SaaS)

-   **Multi-tenancy:** Projetado como uma plataforma multi-tenant, onde cada empresa tem seus dados (usuários, contatos, tickets) completamente isolados.
-   **Gestão de Planos:** Inclui uma entidade de "Planos" para definir limites de usuários, conexões e filas para diferentes níveis de serviço.

### Automação e Roteamento

-   **Filas de Atendimento (Setores):** Permite a criação de filas (ex: "Vendas", "Suporte") para rotear tickets automaticamente.
-   **Chatbot/Atendimento Automático:** Oferece funcionalidades básicas de chatbot com menus de opções (URA) para direcionamento, além de mensagens de saudação e de fora do horário de expediente.
-   **Mensagens Rápidas:** Operadores podem cadastrar e utilizar mensagens pré-definidas para agilizar o atendimento.

### Arquitetura e Deploy

-   **Arquitetura baseada em Docker:** Todo o sistema é containerizado e orquestrado com `docker-compose`.
-   **Proxy Reverso e SSL:** Utiliza `nginx-proxy` e `acme-companion` para gerenciar o tráfego web e gerar certificados SSL automaticamente.
-   **Tecnologias:** Backend em Node.js/TypeScript e frontend em React.

---

## Atualizações Recentes

Esta seção resume as novas funcionalidades e melhorias implementadas recentemente.

### 🗓️ 2024-11-14 13:30:00 - Correções de Build e Banco de Dados

#### 🐞 Correções de Erros (Bug Fixes)

-   **Formato de Número em Planos:** Corrigido um erro no backend que impedia a criação ou atualização de planos com valores decimais separados por vírgula (ex: "33,85"). O sistema agora converte automaticamente a vírgula para ponto antes de salvar no banco de dados.
-   **Build para ARM64:** Restaurada a flag `--no-cache sharp` no `frontend/Dockerfile` para corrigir o erro `qemu: uncaught target signal 4 (Illegal instruction)` que ocorria ao compilar a imagem para a arquitetura ARM64.
-   **Criação de Empresa:** Corrigido um erro no `CreateCompanyService` que causava uma falha de compilação (`Cannot find name 'campaignsEnabled'`) ao criar uma nova empresa.

### 🗓️ 2024-11-14 12:00:00 - Melhorias na Associação de Empresas e Segurança

#### 🚀 Novas Funcionalidades

-   **Associação Inteligente de Empresas via WHMCS:**
    -   Aprimorado o fluxo de login para clientes WHMCS. Se uma empresa ainda não está vinculada a um `whmcsClientId`, o sistema agora tenta localizá-la pelo e-mail do administrador.
    -   Se um usuário com o perfil `admin` e o e-mail correspondente for encontrado, a empresa dele será automaticamente vinculada ao cliente WHMCS, evitando a criação de empresas duplicadas.

#### 🔒 Melhorias de Segurança

-   **Validação de Perfil na Associação de Empresas:**
    -   Adicionada uma camada de segurança para impedir que um e-mail pertencente a um operador (perfil `user`) seja usado para vincular uma empresa a um cliente WHMCS.
    -   Se a tentativa de associação for feita com um e-mail de operador, o processo é bloqueado e uma mensagem de erro apropriada é exibida.

### 🗓️ 2024-11-14 11:00:00 - Log de Auditoria de Tickets e Melhorias de Login

#### 🚀 Novas Funcionalidades

-   **Log de Auditoria de Tickets com Mensagens Privadas:**
    -   Implementado um sistema de log de auditoria que registra as principais ações em um ticket (transferência de fila/atendente, fechamento e reabertura) como mensagens privadas.
    -   Essas mensagens são visíveis apenas na interface do sistema e não são enviadas ao cliente, garantindo um histórico detalhado e confidencial das ações.

#### 🐞 Correções de Erros (Bug Fixes)

-   **Login de Usuários Existentes:**
    -   Corrigido um problema que fazia com que usuários já cadastrados no RC-CHAT recebessem uma mensagem de "cliente não encontrado" ao tentar fazer login. O sistema agora retorna a mensagem de erro correta (ex: "senha inválida") se o login normal falhar.
-   **Validação de Senha no Login WHMCS:**
    -   A validação da senha do produto no login via WHMCS foi aprimorada para ignorar espaços em branco, evitando falhas de autenticação.

### 🗓️ 2024-11-14 10:00:00 - Melhorias na Reabertura de Tickets e Integração WHMCS

#### 🚀 Novas Funcionalidades

-   **Opção de Reabertura de Ticket para Atendente Anterior:**
    -   Adicionada uma nova opção nas configurações para permitir que o administrador escolha o comportamento ao reabrir um ticket após a pesquisa de satisfação.
    -   Quando ativada, se o cliente digitar `!` em vez de avaliar, o ticket é reatribuído diretamente ao atendente anterior.
    -   Se desativada, o ticket volta para a fila, como era o comportamento padrão.

#### 🐞 Correções de Erros (Bug Fixes)

-   **Nome da Empresa na Criação via WHMCS:**
    -   Aprimorada a lógica para definir o nome da empresa ao criá-la a partir de um login WHMCS.
    -   O sistema agora prioriza o campo `companyname`. Se estiver vazio ou contiver apenas espaços, o nome será formado pelo `firstname` e `lastname` do cliente.
-   **Sincronização da Data de Vencimento na Criação da Empresa:**
    -   Corrigido o fluxo de criação de empresa via WHMCS para que a `dueDate` (data de vencimento) seja obtida e salva corretamente no momento da criação.
-   **Edição de Planos e Empresas:**
    -   Corrigida a validação de nomes duplicados ao editar planos e empresas, permitindo que as alterações sejam salvas corretamente.
-   **Sincronização de Empresas:**
    -   A função de sincronizar empresa agora também atualiza a data de vencimento (`dueDate`) a partir do WHMCS.

### 🗓️ 2024-11-13 22:45:00 - Correção de Tipagem na Criação de Empresas WHMCS

#### 🐞 Correções de Erros (Bug Fixes)

- **Tipagem de `whmcsClientId`:** Adicionado `whmcsClientId` à interface `CompanyData` em `CreateCompanyService.ts`, resolvendo erro de tipagem ao criar empresas via WHMCS.

### 🗓️ 2024-11-13 22:30:00 - Automação de Criação de Empresas WHMCS

#### 🚀 Novas Funcionalidades

- **Criação Automática de Empresas WHMCS:** Implementada a funcionalidade de criação automática de empresas no RC-CHAT. Quando um cliente WHMCS tenta fazer login pela primeira vez e a empresa correspondente ainda não existe no RC-CHAT, o sistema agora:
    - Obtém os detalhes do cliente (nome da empresa) diretamente do WHMCS.
    - Encontra um plano no RC-CHAT que corresponda ao `whmcsProductId` do serviço contratado pelo cliente.
    - Cria automaticamente a nova empresa no RC-CHAT, associando-a ao `whmcsClientId` do WHMCS e ao `planId` correto.
    - Cria um usuário administrador padrão para a nova empresa, utilizando o e-mail do cliente WHMCS e uma senha aleatória.
    - Realiza o login do usuário na empresa recém-criada.

### 🗓️ 2024-11-13 21:30:00 - Correções e Melhorias Adicionais

- **Correção de sintaxe no MessagesList/index.js:** Resolvido erro de sintaxe na linha 804 do componente `MessagesList`, garantindo a correta renderização das mensagens.
- **Ordenação alfabética da lista de conexões**
- **Atualização do componente de renderização de mensagens "React Whatsmarked"**
- **Exibição de nomes mencionados em grupos**
- **Atualização da libzapitu para a versão 1.0.0-alpha.9**
- **Correção no suporte à recepção de eventos "digitando" e "gravando"**
- **Detecção do país do usuário por geolocalização** (serviço do navegador ou por localização do IP) para a tela de adição de contatos
- **Novo campo com código de país na tela de adição de contatos**
- **Tratamento na duplicidade de contatos** com e sem o nono dígito de celular
- **Ajuste nos ícones de status das mensagens enviadas**
- **Refatoração da lógica de carregamento de países** e adição da função `getCountryes` para exportação.
- **Integração do contexto Formik** no componente `PhoneNumberInput`.
- **Uso do componente `PhoneNumberInput`** para o campo de número de telefone no `ContactModal`.

### 🗓️ 2024-11-13 21:00:00 - Implementação de Log de Auditoria e Melhorias na Dashboard

#### 🚀 Novas Funcionalidades

- **Log de Auditoria de Tickets:**
    - **Histórico Detalhado por Ticket:** Implementado um sistema de log que registra todas as ações importantes em um ticket, incluindo:
        - Atendimento inicial pelo operador.
        - Todas as transferências entre operadores e filas.
        - Envio de mensagens pelo atendente.
    - **Acesso Restrito:** O histórico do ticket é visível apenas para administradores, garantindo a confidencialidade das informações.

- **Melhorias na Dashboard:**
    - **Relatório de Satisfação do Cliente (CSAT):** Adicionado um novo conjunto de relatórios para analisar a satisfação do cliente:
        - **Nota Média Geral:** Um card com a nota média de todas as avaliações.
        - **Distribuição de Notas:** Um gráfico de pizza que mostra a porcentagem de cada nota (de 1 a 5 estrelas).
        - **Performance por Atendente:** Uma tabela que exibe a nota média de cada atendente.
    - **Ranking de Contatos:** Adicionado um novo relatório que exibe um ranking dos contatos com mais tickets, ajudando a identificar os clientes mais ativos.

#### 🐞 Correções de Erros (Bug Fixes)

- **WHMCS Product ID em Planos:** Corrigido o salvamento e associação do `whmcsProductId` nos planos.
- **Exibição do Ícone Wavoip:** Ajustada a lógica de verificação para garantir que o ícone de chamada de voz (`wavoip`) seja exibido corretamente, mesmo em ambientes de desenvolvimento sem `https`.
- **Importação de Contatos:** Desativada a importação automática de contatos ao conectar uma nova conta do WhatsApp, mantendo apenas a importação manual.
- **Autenticação via Token:** Corrigido o middleware de autenticação de token para garantir que o envio de mensagens via API funcione corretamente.

### 🗓️ 2024-07-31 15:30:00 - Integração Avançada com WHMCS e Melhorias de Deploy

#### 🚀 Novas Funcionalidades

- **Integração Avançada com WHMCS:**
    - **Login Unificado (SSO) para Clientes Finais:** Implementado um sistema de autenticação inteligente. Agora, a tela de login principal do RC-CHAT permite a autenticação de duas formas:
        1.  **Operadores:** Fazem login com suas credenciais normais do RC-CHAT.
        2.  **Clientes Finais (Donos de Empresas):** Fazem login usando o **e-mail** da sua conta WHMCS e a **senha do produto/serviço** específico do RC-CHAT, que eles podem consultar na área do cliente do WHMCS.
    - **Sincronização Automática de Planos:** A cada login de um cliente via WHMCS, o sistema agora verifica o produto/serviço ativo no WHMCS e sincroniza o plano da empresa no RC-CHAT para garantir que corresponda ao que foi pago.
    - **Mapeamento de Planos:** Adicionada a capacidade de mapear diretamente os "Planos" do RC-CHAT aos "Produtos" do WHMCS através da coluna `whmcsProductId`, tornando a integração flexível para múltiplos planos.
    - **Estrutura para Webhooks:** O backend agora está preparado para receber webhooks do WHMCS, permitindo a automação de ativação, suspensão e cancelamento de contas com base em eventos de faturamento.

#### 🛠️ Instalação e Deploy (Setup)

-   **Script de Instalação Interativo (`setup.sh`):** O processo de instalação foi completamente redesenhado.
    -   **Detecção Automática:** O script agora detecta se é uma **nova instalação** ou uma **atualização**.
    -   **Assistente de Instalação:** Em uma nova instalação, o script inicia um assistente interativo que guia o usuário na configuração de domínios, e-mail, versão e origem das imagens.
    -   **Atualizações Simplificadas:** Para atualizar, o usuário só precisa executar `sudo ./setup.sh` novamente. O script lê as configurações existentes e atualiza o sistema de forma não destrutiva.
-   **Diretório de Instalação Padrão:** A instalação agora é centralizada em `/opt/rc-chat`, mantendo o sistema de arquivos do servidor organizado.
-   **Limpeza Pós-Instalação:** O script agora mantém o diretório de instalação limpo, preservando apenas os arquivos essenciais: `docker-compose.yml`, `.env`, `setup.sh` e o diretório `backups/`.
-   **Instalação de Dependências:** O script agora verifica e instala automaticamente o `git` se ele não estiver presente no servidor.

#### 🔄 CI/CD (Build e Publicação)

-   **Suporte a Múltiplos Registros:** O workflow do GitHub Actions agora envia as imagens Docker tanto para o **GitHub Container Registry (GHCR)** quanto para o **Docker Hub**.
-   **Estratégia de Tags Simplificada:** A geração de tags foi alinhada com a estratégia de deploy:
    -   Commits na branch `main` geram a tag Docker `latest`.
    -   Commits na branch `beta` geram a tag Docker `beta`.
-   **Versionamento por Commit:** A informação de versão exibida na interface foi alterada para usar o **nome da branch** e o **hash do commit** (ex: `main @ fa64e63`), removendo a dependência de tags Git para versionamento.

#### 🐞 Correções de Erros (Bug Fixes)

-   **Erro 502 Bad Gateway (Múltiplas Causas):**
    -   **Conflito de Rede:** Corrigido o `docker-compose.yml` para garantir que o `nginx-proxy` e o `frontend` estejam na mesma rede Docker, permitindo a comunicação.
    -   **Conflito de Configuração:** Resolvido um problema onde o `nginx-proxy` detectava incorretamente o container do `backend` como um host virtual, causando um balanceamento de carga incorreto.
    -   **Arquivo de Configuração Faltando:** Corrigido o `setup.sh` para garantir que o diretório `confs/` do Nginx seja copido para o diretório de instalação, resolvendo erros de montagem de volume.
-   **Falha no Build da Imagem `arm64`:**
    -   Corrigido o erro `qemu: uncaught target signal 4 (Illegal instruction)` no `frontend/Dockerfile` adicionando a flag `--no-cache sharp` ao comando `npm ci`.
-   **Falhas de Migração do Banco de Dados:**
    -   Corrigido o erro `column "whmcsClientId" does not exist` (e erros similares) criando os arquivos de migração **TypeScript (`.ts`)** necessários para adicionar as colunas `whmcsClientId`, `whmcsTicketId` e `whmcsProductId` às tabelas `Companies`, `Contacts`, `Tickets` e `Plans`.
    -   Corrigido o `backend/Dockerfile` para que o comando `db:migrate` aponte para o caminho correto das migrações compiladas (`dist/database/migrations`).
-   **Falha na Execução do Script de Instalação:**
    -   Corrigido o erro `fatal: not a git repository` garantindo que o `git` seja instalado antes de ser usado.
    -   Corrigido o erro `Permission denied` em scripts internos adicionando `RUN chmod +x` aos `Dockerfiles` correspondentes.
-   **Branding e Consistência:**
    -   Corrigido o prefixo dos logs do backend de `[ticketz]` para `[rc-chat]`.

#### 📚 Documentação

-   **`README.md`:**
    -   O arquivo foi completamente reescrito para focar no público de língua portuguesa.
    -   As instruções de instalação foram atualizadas para refletir o novo processo interativo de 2 passos (`curl` para baixar, `sudo ./setup.sh` para executar).
-   **`docs/whmcs-config.md`:**
    -   Criado um novo guia detalhado explicando passo a passo como configurar a integração com o WHMCS, incluindo a configuração de API, mapeamento de planos e webhooks.
