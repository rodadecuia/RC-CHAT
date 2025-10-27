const express = require('express');

// Importa os controllers
const listConnections = require('./admin/connections/list');
const createConnection = require('./admin/connections/create');
const updateConnection = require('./admin/connections/update');
const deleteConnection = require('./admin/connections/delete');

function createConnectionsRouter(pool) {
  const router = express.Router();

  // Monta os controllers nas rotas
  router.get('/', listConnections(pool));
  router.post('/', createConnection(pool));
  router.put('/:id', updateConnection(pool));
  router.delete('/:id', deleteConnection(pool));

  return router;
}

module.exports = createConnectionsRouter;
