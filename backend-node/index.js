const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Configuração do Socket.io com CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Apenas permite conexões desta origem
    methods: ["GET", "POST"] // Métodos HTTP permitidos para o handshake
  }
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>Backend Node Works!</h1>');
});

io.on('connection', (socket) => {
  console.log(`user connected: ${socket.id}`);

  // Evento de teste para o frontend
  socket.emit("hello", "world");

  socket.on('disconnect', () => {
    console.log(`user disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
