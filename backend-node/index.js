const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const createApiRouter = require('./routes/api'); // Importa o nosso novo router

// --- Configurações ---
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});
const JWT_SECRET = process.env.JWT_SECRET;

// --- Configuração do Servidor Express ---
const app = express();
const corsOptions = { origin: 'http://localhost:5173' };
app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// --- Lógica do Socket.io ---
const io = new Server(server, { cors: corsOptions });

// --- Rotas da API ---
// O router é criado passando as dependências necessárias
const apiRouter = createApiRouter(pool, io, JWT_SECRET);
app.use('/api', apiRouter); // Usa o router para todas as rotas que começam com /api
app.get('/', (req, res) => res.send('<h1>Backend Node Works!</h1>'));


// --- Middleware de Autenticação do Socket.io ---
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error: Token not provided.'));
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error: Invalid token.'));
    socket.user = decoded;
    next();
  });
});

// --- Lógica de Conexão do Socket.io ---
io.on('connection', (socket) => {
  const { userId, companyId } = socket.user;
  const roomName = `company-${companyId}`;
  socket.join(roomName);
  console.log(`User ${userId} joined room ${roomName}`);

  socket.on('request_chat_history', async ({ chatId }) => {
    try {
      const chatCheck = await pool.query('SELECT id FROM chats WHERE id = $1 AND company_id = $2', [chatId, companyId]);
      if (chatCheck.rowCount === 0) return;
      const history = await pool.query('SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC', [chatId]);
      socket.emit('chat_history', history.rows);
    } catch (error) { console.error('Error fetching specific chat history:', error); }
  });

  socket.on('chat_message', async (payload) => {
    const { chatId, content } = payload;
    try {
      const chatCheck = await pool.query('SELECT id FROM chats WHERE id = $1 AND company_id = $2', [chatId, companyId]);
      if (chatCheck.rowCount === 0) return;
      const result = await pool.query('INSERT INTO messages (chat_id, sender_id, sender_type, content) VALUES ($1, $2, $3, $4) RETURNING *', [chatId, userId, 'agent', content]);
      const newMessage = result.rows[0];
      io.to(roomName).emit('chat_message', newMessage);
    } catch (error) { console.error('Error saving message:', error); }
  });

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected from room ${roomName}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
