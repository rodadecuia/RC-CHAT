# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.2.0] - 2025-10-27

### Added
- **Área Administrativa**: 
  - Implementação de uma seção `/admin` no frontend, protegida por função de usuário (`role`).
  - Adição de um layout aninhado com um sub-menu para as páginas de administração.
  - Criação da página de **Gestão de Contas** para visualizar empresas e seus respectivos usuários.
- **Endpoints de Administração**: 
  - Adição de um middleware `isAdmin` no backend para proteger rotas de administração.
  - Criação dos endpoints `GET /api/admin/companies` e `GET /api/admin/companies/:companyId/users`.
- **Paleta de Cores Customizada**: Adicionada a paleta "Roda de Cuia" ao `tailwind.config.js` e aplicada em toda a interface para uma identidade visual única.

### Changed
- **Arquitetura do Frontend**: Refatoração massiva do frontend. O arquivo `main.jsx` foi simplificado e todos os componentes foram separados em uma estrutura de pastas profissional (`components`, `layouts`, `pages`). O roteamento agora é gerenciado pelo componente `App.jsx`.

---

## [0.1.0] - 2025-10-27

### Added
- **Estrutura Inicial do Projeto**: Criação da arquitetura de microsserviços com Docker.
- **Comunicação em Tempo Real**: Implementação da conexão base com Socket.io.
- **Persistência de Dados**: Adição do banco de dados PostgreSQL.
- **Carregamento de Histórico**: Implementação da lógica para carregar o histórico de mensagens.
- **Sistema de Autenticação (JWT)**: Criação do endpoint de login e middleware de autenticação.
- **Multi-tenancy (Isolamento de Empresas)**: Uso de salas do Socket.io e filtragem de queries.
- **Interface Moderna com Tailwind CSS**: Refatoração da UI para um design moderno.
- **Simulação de Mensagens Externas (Webhook)**: Criação do endpoint de webhook para novas mensagens.
- **Transferência de Chats**: Implementação da funcionalidade de transferência de chats.
- **Roteamento no Frontend (React Router)**: Adição da biblioteca e criação de layout com menu.

### Changed
- **Arquitetura do Backend**: Refatoração do `index.js` do backend, movendo rotas para `routes/api.js`.
- **Gestão de Configuração**: Centralização de configurações em um arquivo `.env` raiz.

### Fixed
- **Dependências de Desenvolvimento**: Corrigido o problema `nodemon: not found`.
- **CORS (Cross-Origin Resource Sharing)**: Resolvido o erro `Failed to fetch` na tela de login.
- **Inicialização do Banco de Dados**: Corrigido múltiplos erros no `init.sql`.

### Security
- **Senhas**: Implementada a verificação de senhas usando `bcrypt.compare`.
- **Proteção de Rotas**: Todas as rotas de API e conexões de socket agora exigem um token JWT válido.
