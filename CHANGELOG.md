# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0] - 2025-10-27

### Added
- **Estrutura Inicial do Projeto**: Criação da arquitetura de microsserviços com Docker, incluindo `frontend` (React), `backend-node` (Node.js), `backend-python` (Python), `postgres` e `redis`.
- **Comunicação em Tempo Real**: Implementação da conexão base com Socket.io entre o frontend e o backend-node.
- **Persistência de Dados**: Adição do banco de dados PostgreSQL e da biblioteca `pg` ao backend. Mensagens agora são salvas no banco.
- **Carregamento de Histórico**: Implementação da lógica para carregar o histórico de mensagens de um chat ao selecioná-lo.
- **Sistema de Autenticação (JWT)**: 
  - Adição das bibliotecas `jsonwebtoken` e `bcryptjs`.
  - Criação do endpoint `POST /api/login` para autenticação de usuários.
  - Implementação de middleware de autenticação para rotas Express e conexões Socket.io.
- **Multi-tenancy (Isolamento de Empresas)**:
  - Adição de `company_id` às tabelas principais do banco de dados.
  - Uso de salas (rooms) do Socket.io para garantir que a comunicação de uma empresa seja isolada das outras.
  - Queries de banco de dados agora filtram os resultados pelo `companyId` do usuário autenticado.
- **Interface Moderna com Tailwind CSS**:
  - Adição e configuração do Tailwind CSS no projeto frontend.
  - Refatoração completa da UI para um design moderno com tema escuro, layout flexbox e componentes estilizados.
- **Simulação de Mensagens Externas (Webhook)**:
  - Criação do endpoint `POST /api/webhook/incoming` para simular o recebimento de mensagens de clientes.
  - Implementação da lógica de "Find or Create Chat" no backend.
  - Adição de notificações em tempo real na UI para novas conversas.
- **Transferência de Chats**:
  - Adição dos endpoints `GET /api/users` e `POST /api/chats/:chatId/transfer`.
  - Implementação da UI (modal) para permitir que um atendente transfira um chat para outro.
  - Adição de mensagens de sistema para registrar a transferência.
- **Roteamento no Frontend (React Router)**:
  - Adição da biblioteca `react-router-dom`.
  - Criação de um layout persistente com menu lateral para navegação entre diferentes seções (Conversas, Dashboard, etc.).

### Changed
- **Arquitetura do Backend**: Refatoração do `index.js` do backend-node, movendo toda a lógica de rotas HTTP para um arquivo modular em `routes/api.js` para melhor organização e escalabilidade.
- **Arquitetura do Frontend**: Refatoração do `main.jsx` de um componente único para uma Single-Page Application (SPA) com múltiplas rotas e layout persistente.
- **Gestão de Configuração**: Centralização de todas as configurações de infraestrutura (credenciais de DB, segredos JWT) em um único arquivo `.env` na raiz do projeto, consumido pelo `docker-compose.yml`.

### Fixed
- **Dependências de Desenvolvimento**: Corrigido o problema `nodemon: not found` ao garantir que `devDependencies` sejam instaladas no ambiente Docker.
- **CORS (Cross-Origin Resource Sharing)**: Resolvido o erro `Failed to fetch` na tela de login ao adicionar e configurar o middleware `cors` no servidor Express.
- **Inicialização do Banco de Dados**: Corrigido múltiplos erros que impediam a criação dos usuários de teste, incluindo erros de sintaxe SQL e hashes de senha inválidos no `init.sql`.

### Security
- **Senhas**: Implementada a verificação de senhas usando `bcrypt.compare`, substituindo a lógica de login que aceitava qualquer senha.
- **Proteção de Rotas**: Todas as rotas de API e conexões de socket agora exigem um token JWT válido.
