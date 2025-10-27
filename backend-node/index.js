const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const amqp = require('amqplib');
const createApiRouter = require('./routes');

// --- Configurações ---
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});
const JWT_SECRET = process.env.JWT_SECRET;

// --- Configurações do RabbitMQ ---
const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
const RABBITMQ_PORT = process.env.RABBITMQ_PORT;
const RABBITMQ_USER = process.env.RABBITMQ_USER;
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD;
const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;

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
const apiRouter = createApiRouter(pool, io, JWT_SECRET);
app.use('/api', apiRouter);
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
      const historyQuery = `
        SELECT 
          m.*, 
          u.name as agent_name 
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id::text AND m.sender_type = 'agent'
        WHERE m.chat_id = $1
        ORDER BY m.created_at ASC
      `;
      const history = await pool.query(historyQuery, [chatId]);
      socket.emit('chat_history', history.rows);
    } catch (error) { console.error('Error fetching specific chat history:', error); }
  });

  socket.on('chat_message', async (payload) => {
    const { chatId, content } = payload;
    const { userId, companyId } = socket.user; // Obtém userId e companyId do socket

    try {
      // TODO: Refatorar: Esta lógica de salvar no DB e emitir para o Socket.io
      // DEVE ser movida para um consumidor da fila 'outgoing_messages' no backend-python.
      // Por enquanto, mantemos aqui para não quebrar o chat.
      const chatCheck = await pool.query('SELECT id FROM chats WHERE id = $1 AND company_id = $2', [chatId, companyId]);
      if (chatCheck.rowCount === 0) return;
      const insertQuery = `
        WITH new_message AS (
          INSERT INTO messages (chat_id, sender_id, sender_type, content) 
          VALUES ($1, $2, 'agent', $3) 
          RETURNING *
        )
        SELECT nm.*, u.name as agent_name 
        FROM new_message nm
        LEFT JOIN users u ON nm.sender_id = u.id::text
      `;
      const result = await pool.query(insertQuery, [chatId, userId, content]);
      const newMessage = result.rows[0];
      io.to(roomName).emit('chat_message', newMessage);

      // Publica a mensagem na fila de saída para o backend-python processar
      const outgoingMessagePayload = {
        chatId: chatId,
        senderId: userId,
        companyId: companyId,
        content: content,
        // TODO: Adicionar informações da conexão (instanceName, number do cliente) aqui
        // Para isso, precisaríamos buscar o chat e a conexão associada.
      };
      // Apenas publica se o canal RabbitMQ estiver conectado
      if (global.rabbitmqChannel) {
        global.rabbitmqChannel.publish(
          '',
          'outgoing_messages',
          Buffer.from(JSON.stringify(outgoingMessagePayload)),
          { persistent: true }
        );
        console.log(" [x] Publicada mensagem de saída para RabbitMQ: %s", outgoingMessagePayload);
      } else {
        console.warn("RabbitMQ channel not available. Outgoing message not published.");
      }

    } catch (error) {
      console.error('Error saving or publishing message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${userId} disconnected from room ${roomName}`);
  });
});

// --- Conexão e Consumo RabbitMQ ---
let rabbitmqConnection = null;
let rabbitmqChannel = null;

async function connectRabbitMQ() {
  try {
    rabbitmqConnection = await amqp.connect(RABBITMQ_URL);
    rabbitmqChannel = await rabbitmqConnection.createChannel();

    await rabbitmqChannel.assertQueue('evolution_webhooks', { durable: true });
    await rabbitmqChannel.assertQueue('outgoing_messages', { durable: true }); // Declara a fila de saída

    console.log("Conectado ao RabbitMQ com sucesso.");

    // Consumidor de webhooks da Evolution API
    rabbitmqChannel.consume('evolution_webhooks', async (msg) => {
      if (msg !== null) {
        const payload = JSON.parse(msg.content.toString());
        console.log(" [x] Received webhook from RabbitMQ: %s", payload);

        const { instance, data } = payload;
        const simulatedCompanyId = 1; // TODO: Extrair companyId do payload do webhook
        const customerId = data.key?.remoteJid || data.key?.participant || 'unknown_customer';
        const messageContent = data.message?.conversation || data.message?.extendedTextMessage?.text || 'Mensagem sem texto';

        try {
          let chat;
          const existingChatResult = await pool.query(
            'SELECT * FROM chats WHERE customer_name = $1 AND company_id = $2 AND status = \'open\'',
            [customerId, simulatedCompanyId]
          );

          if (existingChatResult.rowCount > 0) {
            chat = existingChatResult.rows[0];
          } else {
            const newChatResult = await pool.query(
              'INSERT INTO chats (company_id, customer_name, status) VALUES ($1, $2, \'open\') RETURNING *',
              [simulatedCompanyId, customerId]
            );
            chat = newChatResult.rows[0];
          }

          const messageResult = await pool.query(
            'INSERT INTO messages (chat_id, sender_id, sender_type, content) VALUES ($1, $2, \'customer\', $3) RETURNING *',
            [chat.id, customerId, messageContent]
          );
          const newMessage = messageResult.rows[0];

          const roomName = `company-${simulatedCompanyId}`;
          io.to(roomName).emit('new_incoming_message', { chat, message: newMessage });
          io.to(roomName).emit('chat_message', newMessage);

          rabbitmqChannel.ack(msg);

        } catch (dbError) {
          console.error('Erro ao processar mensagem do RabbitMQ e salvar no DB:', dbError);
          // rabbitmqChannel.nack(msg); // Rejeita a mensagem para reprocessamento
        }
      }
    }, { noAck: false });

  } catch (error) {
    console.error("Erro ao conectar ao RabbitMQ:", error);
    setTimeout(connectRabbitMQ, 5000);
  }
}

// Inicia a conexão com o RabbitMQ e o servidor HTTP
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectRabbitMQ();
});
