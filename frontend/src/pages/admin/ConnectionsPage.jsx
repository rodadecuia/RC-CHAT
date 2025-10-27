import React, { useState, useEffect, useCallback } from 'react';
import ConnectionFormModal from '../../components/ConnectionFormModal';
import { parseJwt } from '../../App'; // Importa a função para decodificar o JWT

const API_URL = import.meta.env.VITE_SOCKET_URL;

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const token = localStorage.getItem('authToken');
  const user = parseJwt(token); // Decodifica o token para obter o companyId

  const fetchConnections = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/connections`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setConnections(await response.json());
      } else {
        console.error("Falha ao buscar conexões:", response.statusText);
      }
    } catch (error) {
      console.error("Erro ao buscar conexões:", error);
    }
  }, [token]);

  useEffect(() => { fetchConnections(); }, [fetchConnections]);

  const handleAddClick = () => {
    setEditingConnection(null); // Para adicionar, não há conexão sendo editada
    setShowModal(true);
  };

  const handleEditClick = (connection) => {
    setEditingConnection(connection);
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta conexão?')) {
      try {
        const response = await fetch(`${API_URL}/api/admin/connections/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          fetchConnections(); // Atualiza a lista após deletar
        } else {
          console.error("Falha ao deletar conexão:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao deletar conexão:", error);
      }
    }
  };

  const handleSaveSuccess = () => {
    setShowModal(false);
    fetchConnections(); // Atualiza a lista após salvar
  };

  return (
    <div className="p-8 text-mist">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestor de Conexões</h2>
        <button onClick={handleAddClick} className="bg-solar hover:opacity-90 text-deep-black font-bold py-2 px-4 rounded">
          + Adicionar Conexão
        </button>
      </div>

      <div className="bg-deep-black rounded-lg shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Canal</th>
              <th className="p-4">Status</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {connections.map(conn => (
              <tr key={conn.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="p-4">{conn.name}</td>
                <td className="p-4"><span className="bg-gray-700 px-2 py-1 rounded-full text-xs">{conn.channel_type}</span></td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${conn.status === 'CONNECTED' ? 'bg-vibrant text-deep-black' : 'bg-cosmic'}`}>
                    {conn.status}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button onClick={() => handleEditClick(conn)} className="text-solar hover:underline">Editar</button>
                  <button onClick={() => handleDeleteClick(conn.id)} className="text-red-500 hover:underline">Deletar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ConnectionFormModal
          token={token}
          companyId={user.companyId} // Passa o companyId do usuário logado
          connection={editingConnection}
          onClose={() => setShowModal(false)}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}
