const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function createApiRouter(pool, io, JWT_SECRET) {
  const router = express.Router();

  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    try {
      const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = userResult.rows[0];
      if (!user) return res.status(401).json({ message: 'Credenciais inválidas.' });
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) return res.status(401).json({ message: 'Credenciais inválidas.' });
      const token = jwt.sign({ userId: user.id, companyId: user.company_id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
      res.json({ message: 'Login bem-sucedido!', token });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  });

  router.get('/chats', authenticateToken, async (req, res) => {
    const { companyId } = req.user;
    try {
      const result = await pool.query('SELECT * FROM chats WHERE company_id = $1 ORDER BY updated_at DESC', [companyId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  });

  router.get('/users', authenticateToken, async (req, res) => {
    const { companyId, userId } = req.user;
    try {
      const result = await pool.query('SELECT id, name FROM users WHERE company_id = $1 AND id != $2', [companyId, userId]);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  });

  router.post('/chats/:chatId/transfer', authenticateToken, async (req, res) => {
    const { companyId, userId, name: currentUserName } = req.user;
    const { chatId } = req.params;
    const { newUserId } = req.body;
    try {
      const chatResult = await pool.query('SELECT * FROM chats WHERE id = $1 AND company_id = $2', [chatId, companyId]);
      if (chatResult.rowCount === 0) return res.status(404).json({ message: 'Chat não encontrado.' });
      const newUserResult = await pool.query('SELECT name FROM users WHERE id = $1 AND company_id = $2', [newUserId, companyId]);
      if (newUserResult.rowCount === 0) return res.status(404).json({ message: 'Usuário de destino não encontrado.' });
      const newUserName = newUserResult.rows[0].name;
      await pool.query('UPDATE chats SET assigned_to_user_id = $1 WHERE id = $2', [newUserId, chatId]);
      const systemMessageContent = `Chat transferido de ${currentUserName} para ${newUserName}`;
      const messageResult = await pool.query('INSERT INTO messages (chat_id, sender_type, content) VALUES ($1, \'system\', $2) RETURNING *', [chatId, systemMessageContent]);
      const roomName = `company-${companyId}`;
      io.to(roomName).emit('chat_updated', { chatId, assigned_to_user_id: newUserId });
      io.to(roomName).emit('chat_message', messageResult.rows[0]);
      res.status(200).json({ message: 'Chat transferido com sucesso.' });
    } catch (error) {
      console.error('Error transferring chat:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  });

  router.post('/webhook/incoming', async (req, res) => {
    const { customerId, content, companyId } = req.body;
    if (!customerId || !content || !companyId) return res.status(400).json({ message: 'Dados insuficientes.' });
    try {
      let chat;
      const existingChatResult = await pool.query('SELECT * FROM chats WHERE customer_name = $1 AND company_id = $2 AND status = \'open\'', [customerId, companyId]);
      if (existingChatResult.rowCount > 0) {
        chat = existingChatResult.rows[0];
      } else {
        const newChatResult = await pool.query('INSERT INTO chats (company_id, customer_name, status) VALUES ($1, $2, \'open\') RETURNING *', [companyId, customerId]);
        chat = newChatResult.rows[0];
      }
      const messageResult = await pool.query('INSERT INTO messages (chat_id, sender_id, sender_type, content) VALUES ($1, $2, \'customer\', $3) RETURNING *', [chat.id, customerId, content]);
      const newMessage = messageResult.rows[0];
      const roomName = `company-${companyId}`;
      io.to(roomName).emit('new_incoming_message', { chat, message: newMessage });
      res.status(200).json({ message: 'Mensagem recebida com sucesso.' });
    } catch (error) {
      console.error('Erro no webhook:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  });

  return router;
}

module.exports = createApiRouter;
