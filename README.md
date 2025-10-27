# RC Chat - Plataforma de Multiatendimento

RC Chat é uma plataforma de multiatendimento moderna, projetada para centralizar as comunicações de uma empresa com seus clientes em diversos canais. A aplicação é construída com uma arquitetura de microsserviços robusta e escalável.

## Arquitetura

A plataforma é dividida nos seguintes serviços, orquestrados com Docker:

- **Frontend (Web App)**
  - **Tecnologia**: React + Vite + Tailwind CSS
  - **Responsabilidade**: Fornecer a interface do usuário para os atendentes e administradores. É uma Single-Page Application (SPA) com roteamento do lado do cliente.

- **Backend 1 (Comunicação em Tempo Real)**
  - **Tecnologia**: Node.js + Express + Socket.io
  - **Responsabilidade**: Gerenciar todas as conexões de WebSocket, autenticação de usuários, lógica de chat em tempo real, e atuar como o gateway principal para o frontend.

- **Backend 2 (Inteligência e Automações)**
  - **Tecnologia**: Python + FastAPI
  - **Responsabilidade**: (Planejado) Lidar com processamento de IA, análise de sentimentos, integração com modelos de linguagem (LLMs) e automações complexas.

- **Banco de Dados Principal**
  - **Tecnologia**: PostgreSQL
  - **Responsabilidade**: Armazenar todos os dados persistentes da aplicação, como empresas, usuários, conversas e mensagens.

- **Cache e Filas**
  - **Tecnologia**: Redis
  - **Responsabilidade**: (Planejado) Gerenciar filas de tarefas assíncronas e cache para otimizar a performance.

## Funcionalidades Implementadas

- Autenticação de usuários com JSON Web Tokens (JWT).
- Interface de chat em tempo real com histórico de mensagens.
- Arquitetura Multi-tenant com isolamento de dados por empresa.
- Simulação de recebimento de mensagens externas via webhook.
- Notificações em tempo real para novas mensagens e conversas.
- Transferência de chats entre atendentes.
- Roteamento no frontend com menu de navegação lateral.

## Como Executar o Projeto

Este projeto é totalmente containerizado, então o único pré-requisito é ter o **Docker** e o **Docker Compose** instalados.

### 1. Configuração do Ambiente

O projeto utiliza um arquivo `.env` na raiz para gerenciar as configurações de ambiente. Para começar, crie um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:

```
# Configurações do Banco de Dados PostgreSQL
POSTGRES_USER=db_user
POSTGRES_PASSWORD=sua_senha_super_segura
POSTGRES_DB=rc_chat_db
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Segredo para assinar os JSON Web Tokens
JWT_SECRET=seu_segredo_jwt_super_aleatorio

# URL para o frontend se conectar ao backend
VITE_SOCKET_URL=http://localhost:3000
```

**Nota**: O arquivo `.env` do frontend (`frontend/.env`) deve conter apenas a variável `VITE_SOCKET_URL`.

### 2. Build e Inicialização dos Serviços

Com o Docker em execução, abra um terminal na raiz do projeto e execute o seguinte comando:

```sh
docker-compose up --build
```

- O `--build` é importante na primeira vez para construir as imagens customizadas dos serviços.
- Este comando irá iniciar todos os contêineres, criar a rede e os volumes necessários.

### 3. Acessando a Aplicação

- **Frontend**: A interface web estará acessível em `http://localhost:5173`.
- **Backend API**: O servidor Node.js estará acessível em `http://localhost:3000`.

### 4. Credenciais de Teste

O banco de dados é inicializado com os seguintes usuários de teste (para a `company_id = 1`):

- **Email**: `admin@teste.com`
- **Senha**: `password`

- **Email**: `atendente@teste.com`
- **Senha**: `password`

### 5. Resetando o Banco de Dados

Se você precisar resetar o banco de dados para o estado inicial definido em `database/init.sql`, siga estes passos:

```sh
# 1. Derrube todos os contêineres
docker-compose down

# 2. Remova o volume do postgres (isso apagará todos os dados)
docker volume rm rc-chat_postgres_data

# 3. Suba tudo novamente
docker-compose up
```
