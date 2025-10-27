const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const createConnectionsRouter = require('./connections'); // Importa o novo router

function createApiRouter(pool, io, JWT_SECRET) {
  const router = express.Router();

  // --- Middlewares de Autenticação (código anterior) ---
  const authenticateToken = (req, res, next) => { /* ... */ };
  const isAdmin = (req, res, next) => { /* ... */ };

  // --- Rotas Públicas (código anterior) ---
  router.post('/login', async (req, res) => { /* ... */ });
  router.post('/webhook/incoming', async (req, res) => { /* ... */ });

  // --- Rotas Autenticadas para Atendentes (código anterior) ---
  router.get('/chats', authenticateToken, async (req, res) => { /* ... */ });
  router.get('/users', authenticateToken, async (req, res) => { /* ... */ });
  router.post('/chats/:chatId/transfer', authenticateToken, async (req, res) => { /* ... */ });

  // --- Rotas de Administração ---
  const adminRouter = express.Router();
  adminRouter.use(authenticateToken, isAdmin);

  // Rotas de Gestão de Contas (empresas e usuários)
  adminRouter.get('/companies', async (req, res) => { /* ... */ });
  adminRouter.get('/companies/:companyId/users', async (req, res) => { /* ... */ });

  // NOVO: Monta as rotas de conexões sob /admin/connections
  const connectionsRouter = createConnectionsRouter(pool);
  adminRouter.use('/connections', connectionsRouter);

  // Aninha o router de administração sob /api/admin
  router.use('/admin', adminRouter);

  return router;
}

module.exports = createApiRouter;
