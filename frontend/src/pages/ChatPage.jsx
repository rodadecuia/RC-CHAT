import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import TransferModal from '../components/TransferModal'; // Importa o TransferModal

const API_URL = import.meta.env.VITE_SOCKET_URL;

// --- Sub-componente para uma única mensagem ---
function ChatMessage({ msg }) {
  const time = new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (msg.sender_type === 'system') {
    return (
      <div className="text-center my-2">
        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">{msg.content} - {time}</span>
      </div>
    );
  }

  const isAgent = msg.sender_type === 'agent';
  const senderName = isAgent ? msg.agent_name : 'Cliente';
  
  const bubbleAlignment = isAgent ? 'self-end ml-auto' : 'self-start';
  const bubbleColor = isAgent ? 'bg-solar text-deep-black' : 'bg-gray-700';

  return (
    <div className={`flex flex-col max-w-md my-1 ${isAgent ? 'items-end self-end' : 'items-start'}`}>
      <div className={`p-3 rounded-lg ${bubbleColor} ${bubbleAlignment}`}>
        <p className="text-sm">{msg.content}</p>
      </div>
      <span className="text-xs text-gray-500 mt-1 px-1">{senderName} - {time}</span>
    </div>
  );
}

// --- Componente Principal da Página de Chat ---
export default function ChatPage() {
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [unreadChats, setUnreadChats] = useState(new Set());
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('authToken');

  // Refatorar fetchChats para ser useCallback para evitar re-render desnecessários
  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/chats`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setChats(await response.json());
    } catch (error) { console.error("Falha ao buscar chats:", error); }
  }, [token]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  useEffect(() => {
    const newSocket = io(API_URL, { auth: { token } });
    setSocket(newSocket);

    newSocket.on('chat_history', setMessages);
    newSocket.on('chat_message', (newMessage) => {
      if (newMessage.chat_id === selectedChat?.id) {
        setMessages(prev => [...prev, newMessage]);
      }
    });

    newSocket.on('new_incoming_message', ({ chat, message }) => {
      setChats(prevChats => {
        const otherChats = prevChats.filter(c => c.id !== chat.id);
        return [chat, ...otherChats];
      });
      if (chat.id !== selectedChat?.id) setUnreadChats(prev => new Set(prev).add(chat.id));
      if (chat.id === selectedChat?.id) setMessages(prev => [...prev, message]);
    });

    newSocket.on('chat_updated', ({ chatId, assigned_to_user_id }) => {
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, assigned_to_user_id } : c));
    });

    return () => newSocket.disconnect();
  }, [token, selectedChat]);

  const handleSelectChat = (chat) => {
    if (selectedChat?.id === chat.id) return;
    setSelectedChat(chat);
    setMessages([]);
    setUnreadChats(prev => { const newUnread = new Set(prev); newUnread.delete(chat.id); return newUnread; });
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
      <aside className="w-1/3 bg-deep-black p-4 overflow-y-auto border-r border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Conversas</h2>
        <ul>
          {chats.map(chat => (
            <li key={chat.id} onClick={() => handleSelectChat(chat)} className={`flex justify-between items-center p-3 rounded-lg cursor-pointer mb-2 ${selectedChat?.id === chat.id ? 'bg-solar text-deep-black font-bold' : 'hover:bg-gray-700'}`}>
              <span>{chat.customer_name || `Chat ${chat.id}`}</span>
              {unreadChats.has(chat.id) && <span className="w-3 h-3 bg-vibrant rounded-full"></span>}
            </li>
          ))}
        </ul>
      </aside>
      <div className="w-2/3 flex flex-col">
        {selectedChat ? (
          <>
            <header className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold">{selectedChat.customer_name || `Chat ${selectedChat.id}`}</h3>
              <button onClick={() => setIsTransferring(true)} className="bg-cosmic hover:opacity-80 text-mist p-2 rounded text-sm">Transferir</button>
            </header>
            <ul className="flex-grow p-4 overflow-y-auto bg-deep-black flex flex-col space-y-2">
              {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
              <div ref={messagesEndRef} />
            </ul>
            <form onSubmit={handleSubmit} className="p-4 bg-gray-800">
              <input value={currentMessage} onChange={e => setCurrentMessage(e.target.value)} placeholder="Digite sua mensagem..." className="w-full p-2 rounded bg-deep-black text-mist focus:outline-none focus:ring-2 focus:ring-solar"/>
            </form>
          </>
        ) : <div className="flex items-center justify-center h-full text-gray-500">Selecione uma conversa.</div>}
      </div>
      {isTransferring && selectedChat && <TransferModal token={token} chatId={selectedChat.id} onClose={() => setIsTransferring(false)} onTransferSuccess={() => { setIsTransferring(false); setSelectedChat(null); }} />}
    </div>
  );
}
