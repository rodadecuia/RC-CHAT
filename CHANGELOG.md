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

### 🚀 Novas Funcionalidades

#### Integração Avançada com WHMCS

-   **Login Unificado (SSO) para Clientes Finais:** Implementado um sistema de autenticação inteligente. Agora, a tela de login principal do RC-CHAT permite a autenticação de duas formas:
    1.  **Operadores:** Fazem login com suas credenciais normais do RC-CHAT.
    2.  **Clientes Finais (Donos de Empresas):** Fazem login usando o **e-mail** da sua conta WHMCS e a **senha do produto/serviço** específico do RC-CHAT, que eles podem consultar na área do cliente do WHMCS.
-   **Sincronização Automática de Planos:** A cada login de um cliente via WHMCS, o sistema agora verifica o produto/serviço ativo no WHMCS e sincroniza o plano da empresa no RC-CHAT para garantir que corresponda ao que foi pago.
-   **Mapeamento de Planos:** Adicionada a capacidade de mapear diretamente os "Planos" do RC-CHAT aos "Produtos" do WHMCS através da coluna `whmcsProductId`, tornando a integração flexível para múltiplos planos.
-   **Estrutura para Webhooks:** O backend agora está preparado para receber webhooks do WHMCS, permitindo a automação de ativação, suspensão e cancelamento de contas com base em eventos de faturamento.

### 🛠️ Instalação e Deploy (Setup)

-   **Script de Instalação Interativo (`setup.sh`):** O processo de instalação foi completamente redesenhado.
    -   **Detecção Automática:** O script agora detecta se é uma **nova instalação** ou uma **atualização**.
    -   **Assistente de Instalação:** Em uma nova instalação, o script inicia um assistente interativo que guia o usuário na configuração de domínios, e-mail, versão e origem das imagens.
    -   **Atualizações Simplificadas:** Para atualizar, o usuário só precisa executar `sudo ./setup.sh` novamente. O script lê as configurações existentes e atualiza o sistema de forma não destrutiva.
-   **Diretório de Instalação Padrão:** A instalação agora é centralizada em `/opt/rc-chat`, mantendo o sistema de arquivos do servidor organizado.
-   **Limpeza Pós-Instalação:** O script agora mantém o diretório de instalação limpo, preservando apenas os arquivos essenciais: `docker-compose.yml`, `.env`, `setup.sh` e o diretório `backups/`.
-   **Instalação de Dependências:** O script agora verifica e instala automaticamente o `git` se ele não estiver presente no servidor.

### 🔄 CI/CD (Build e Publicação)

-   **Suporte a Múltiplos Registros:** O workflow do GitHub Actions agora envia as imagens Docker tanto para o **GitHub Container Registry (GHCR)** quanto para o **Docker Hub**.
-   **Estratégia de Tags Simplificada:** A geração de tags foi alinhada com a estratégia de deploy:
    -   Commits na branch `main` geram a tag Docker `latest`.
    -   Commits na branch `beta` geram a tag Docker `beta`.
-   **Versionamento por Commit:** A informação de versão exibida na interface foi alterada para usar o **nome da branch** e o **hash do commit** (ex: `main @ fa64e63`), removendo a dependência de tags Git para versionamento.

### 🐞 Correções de Erros (Bug Fixes)

-   **Erro 502 Bad Gateway (Múltiplas Causas):**
    -   **Conflito de Rede:** Corrigido o `docker-compose.yml` para garantir que o `nginx-proxy` e o `frontend` estejam na mesma rede Docker, permitindo a comunicação.
    -   **Conflito de Configuração:** Resolvido um problema onde o `nginx-proxy` detectava incorretamente o container do `backend` como um host virtual, causando um balanceamento de carga incorreto.
    -   **Arquivo de Configuração Faltando:** Corrigido o `setup.sh` para garantir que o diretório `confs/` do Nginx seja copiado para o diretório de instalação, resolvendo erros de montagem de volume.
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

### 📚 Documentação

-   **`README.md`:**
    -   O arquivo foi completamente reescrito para focar no público de língua portuguesa.
    -   As instruções de instalação foram atualizadas para refletir o novo processo interativo de 2 passos (`curl` para baixar, `sudo ./setup.sh` para executar).
-   **`docs/whmcs-config.md`:**
    -   Criado um novo guia detalhado explicando passo a passo como configurar a integração com o WHMCS, incluindo a configuração de API, mapeamento de planos e webhooks.