import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_SOCKET_URL;

export default function TransferModal({ token, chatId, onClose, onTransferSuccess }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch(`${API_URL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setUsers(await response.json());
    };
    fetchUsers();
  }, [token]);

  const handleTransfer = async (newUserId) => {
    await fetch(`${API_URL}/api/chats/${chatId}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ newUserId }),
    });
    onTransferSuccess();
  };

  return (
    <div className="fixed inset-0 bg-deep-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4 text-mist">Transferir Chat</h3>
        <ul>{users.map(user => <li key={user.id} onClick={() => handleTransfer(user.id)} className="p-2 hover:bg-solar rounded cursor-pointer text-mist">{user.name}</li>)}</ul>
        <button onClick={onClose} className="mt-4 bg-cosmic p-2 rounded w-full">Cancelar</button>
      </div>
    </div>
  );
}
