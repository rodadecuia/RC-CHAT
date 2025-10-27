import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import { io } from 'socket.io-client';
import './index.css';

const API_URL = import.meta.env.VITE_SOCKET_URL;

// --- Páginas Placeholder ---
const DashboardPage = () => <div className="text-white p-8">Dashboard Page</div>;
const UsersPage = () => <div className="text-white p-8">Users Management Page</div>;

// --- Componente de Layout Autenticado ---
function AuthenticatedLayout({ onLogout }) {
  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex">
      <aside className="w-64 bg-gray-800 p-4 flex flex-col flex-shrink-0">
        <h1 className="text-2xl font-bold mb-8">RC Chat</h1>
        <nav className="flex flex-col space-y-2">
          <Link to="/chat" className="p-3 rounded-lg hover:bg-sky-600">Conversas</Link>
          <Link to="/dashboard" className="p-3 rounded-lg hover:bg-sky-600">Dashboard</Link>
          <Link to="/admin/users" className="p-3 rounded-lg hover:bg-sky-600">Usuários</Link>
        </nav>
        <div className="mt-auto">
          <button onClick={onLogout} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Logout</button>
        </div>
      </aside>
      <main className="flex-grow flex flex-col overflow-hidden">
        <Outlet /> {/* As rotas aninhadas serão renderizadas aqui */}
      </main>
    </div>
  );
}

// --- Página de Chat (código completo) ---
function ChatPage() {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const newSocket = io(API_URL, { auth: { token } });
    setSocket(newSocket);
    // ... (listeners do socket)
    return () => newSocket.disconnect();
  }, [token]);

  useEffect(() => {
    const fetchChats = async () => {
      const response = await fetch(`${API_URL}/api/chats`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setChats(await response.json());
    };
    fetchChats();
  }, [token]);

  const handleSelectChat = (chat) => {
    if (selectedChat?.id === chat.id) return;
    setSelectedChat(chat);
    setMessages([]);
    socket.emit('request_chat_history', { chatId: chat.id });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (currentMessage.trim() && socket && selectedChat) {
      socket.emit('chat_message', { chatId: selectedChat.id, content: currentMessage });
      setCurrentMessage('');
    }
  };

  return (
    <div className="flex flex-grow overflow-hidden h-full">
      <aside className="w-1/3 bg-gray-800 p-4 overflow-y-auto border-r border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Conversas</h2>
        <ul>
          {chats.map(chat => (
            <li key={chat.id} onClick={() => handleSelectChat(chat)} className={`p-3 rounded-lg cursor-pointer mb-2 ${selectedChat?.id === chat.id ? 'bg-sky-600' : 'hover:bg-gray-700'}`}>
              {chat.customer_name || `Chat ${chat.id}`}
            </li>
          ))}
        </ul>
      </aside>
      <div className="w-2/3 flex flex-col">
        {selectedChat ? (
          <>
            <header className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold">{selectedChat.customer_name || `Chat ${selectedChat.id}`}</h3>
              <button onClick={() => setIsTransferring(true)} className="bg-blue-500 p-2 rounded">Transferir</button>
            </header>
            <ul className="flex-grow p-4 overflow-y-auto bg-gray-900">{messages.map(msg => <li key={msg.id}>{msg.content}</li>)}</ul>
            <form onSubmit={handleSubmit} className="p-4 bg-gray-800">
              <input value={currentMessage} onChange={e => setCurrentMessage(e.target.value)} placeholder="Digite sua mensagem..." className="w-full p-2 rounded bg-gray-700"/>
            </form>
          </>
        ) : <div className="flex items-center justify-center h-full text-gray-500">Selecione uma conversa.</div>}
      </div>
      {isTransferring && <div className="fixed inset-0 bg-black bg-opacity-50"></div>}
    </div>
  );
}

// --- Página de Login (código completo) ---
function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@teste.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro no login');
      onLoginSuccess(data.token);
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-6">RC Chat Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded bg-gray-700"/>
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-bold mb-2">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded bg-gray-700"/>
          </div>
          <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded">Entrar</button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
}

// --- Componente Principal da Aplicação ---
function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {token ? (
          <Route path="/*" element={<AuthenticatedLayout onLogout={handleLogout} />}>
            <Route index element={<Navigate to="/chat" />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="admin/users" element={<UsersPage />} />
          </Route>
        ) : (
          <Route path="*" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
