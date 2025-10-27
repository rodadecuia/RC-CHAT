import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_SOCKET_URL;

export default function AccountsPage() {
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await fetch(`${API_URL}/api/admin/companies`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setCompanies(await res.json());
    };
    fetchCompanies();
  }, [token]);

  const handleSelectCompany = async (company) => {
    setSelectedCompany(company);
    setUsers([]);
    const res = await fetch(`${API_URL}/api/admin/companies/${company.id}/users`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setUsers(await res.json());
  };

  return (
    <div className="p-8 text-mist">
      <h2 className="text-2xl font-bold mb-4">Gestão de Contas</h2>
      <div className="flex space-x-8">
        <div className="w-1/3">
          <h3 className="text-xl mb-2">Empresas</h3>
          <ul className="bg-deep-black p-2 rounded">{companies.map(c => <li key={c.id} onClick={() => handleSelectCompany(c)} className={`cursor-pointer p-2 rounded ${selectedCompany?.id === c.id ? 'bg-solar text-deep-black font-bold' : 'hover:bg-gray-700'}`}>{c.name}</li>)}</ul>
        </div>
        {selectedCompany && <div className="w-2/3">
          <h3 className="text-xl mb-2">Usuários de {selectedCompany.name}</h3>
          <ul className="bg-deep-black p-2 rounded">{users.map(u => <li key={u.id} className="p-2 flex justify-between"><span>{u.name} ({u.email})</span><span className="font-mono text-gray-400">{u.role}</span></li>)}</ul>
        </div>}
      </div>
    </div>
  );
}
