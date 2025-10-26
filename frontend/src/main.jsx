import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { io } from 'socket.io-client';

// A URL do backend é lida da variável de ambiente VITE_SOCKET_URL.
// Esta variável é definida no arquivo .env e passada para o container pelo docker-compose.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

if (!SOCKET_URL) {
  throw new Error("A variável de ambiente VITE_SOCKET_URL não está definida!");
}

const socket = io(SOCKET_URL);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      console.log('Connected to socket server');
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    }

    function onHello(data) {
      console.log('Received hello event with data:', data);
      alert('Backend says: ' + data);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('hello', onHello);

    // Cleanup: remove os listeners quando o componente for desmontado
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('hello', onHello);
    };
  }, []);

  return (
    <div>
      <h1>RC Chat Frontend</h1>
      <p>Status da Conexão: {isConnected ? 'Conectado' : 'Desconectado'}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
