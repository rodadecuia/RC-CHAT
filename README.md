# RC Chat - Plataforma de Multiatendimento

RC Chat é uma plataforma de multiatendimento moderna, projetada para centralizar as comunicações de uma empresa com seus clientes em diversos canais. A aplicação é construída com uma arquitetura de microsserviços robusta e escalável.

## Arquitetura

A plataforma é dividida nos seguintes serviços, orquestrados com Docker:

- **Frontend (Web App)**
  - **Tecnologia**: React, Vite, React Router, Tailwind CSS
  - **Responsabilidade**: Fornecer a interface do usuário para os atendentes e administradores. É uma Single-Page Application (SPA) com roteamento do lado do cliente e uma arquitetura de componentes modular.
  - **Estrutura**: O código-fonte do frontend está organizado em `src/components`, `src/layouts`, e `src/pages` para máxima manutenibilidade.

- **Backend 1 (Comunicação em Tempo Real)**
  - **Tecnologia**: Node.js, Express, Socket.io, PostgreSQL
  - **Responsabilidade**: Gerenciar conexões WebSocket, autenticação, lógica de chat, e servir a API REST principal. As rotas da API são modularizadas em `routes/api.js`.

- **Backend 2 (Inteligência e Automações)**
  - **Tecnologia**: Python, FastAPI
  - **Responsabilidade**: (Planejado) Lidar com processamento de IA, análise de sentimentos, e automações complexas.

- **Banco de Dados e Cache**
  - **Tecnologias**: PostgreSQL, Redis
  - **Responsabilidade**: Armazenar dados persistentes e gerenciar cache/filas.

## Funcionalidades Implementadas

- **Autenticação**: Sistema de login com JWT e verificação de senha com `bcrypt`.
- **Painel de Atendimento**: Interface de chat em tempo real com lista de conversas e histórico de mensagens.
- **Multi-tenancy**: Isolamento de dados por empresa usando `company_id` e salas do Socket.io.
- **Notificações em Tempo Real**: Atualização da UI para novas mensagens e criação de novos chats via webhook.
- **Transferência de Chats**: Funcionalidade para um atendente transferir uma conversa para outro.
- **Área Administrativa**: Uma seção separada para administradores com:
  - Proteção de rotas baseada em função (`role`).
  - **Gestão de Contas**: Visualização de empresas e seus respectivos usuários.
- **Roteamento Profissional**: Navegação completa no frontend usando React Router com layouts aninhados.

## Como Executar o Projeto

O único pré-requisito é ter o **Docker** e o **Docker Compose** instalados.

### 1. Configuração do Ambiente

Crie um arquivo `.env` na raiz do projeto. Ele é a fonte única de verdade para as configurações de infraestrutura.

```
# Configurações do Banco de Dados PostgreSQL
POSTGRES_USER=db_user
POSTGRES_PASSWORD=sua_senha_super_segura
POSTGRES_DB=rc_chat_db
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Segredo para assinar os JSON Web Tokens
JWT_SECRET=seu_segredo_jwt_super_aleatorio
```

Crie um segundo arquivo de ambiente em `frontend/.env` para as variáveis de build do Vite:

```
VITE_SOCKET_URL=http://localhost:3000
```

### 2. Build e Inicialização

Com o Docker em execução, abra um terminal na raiz do projeto e execute:

```sh
docker-compose up --build
```

### 3. Acessando a Aplicação

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`

### 4. Credenciais de Teste

- **Admin**: `admin@teste.com` / `password`
- **Atendente**: `atendente@teste.com` / `password`

### 5. Resetando o Banco de Dados

Para resetar o banco de dados para o estado inicial, execute:

```sh
docker-compose down
docker volume rm rc-chat_postgres_data
docker-compose up
```
