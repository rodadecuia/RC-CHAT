import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex flex-grow overflow-hidden h-full">
      <aside className="w-1/4 bg-deep-black p-4 overflow-y-auto border-r border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Menu de Admin</h3>
        <nav className="flex flex-col space-y-2">
          <NavLink to="dashboard" className={({ isActive }) => `p-3 rounded-lg ${isActive ? 'bg-solar text-deep-black font-bold' : 'hover:bg-gray-700'}`}>Dashboard</NavLink>
          <NavLink to="accounts" className={({ isActive }) => `p-3 rounded-lg ${isActive ? 'bg-solar text-deep-black font-bold' : 'hover:bg-gray-700'}`}>Gestão de Contas</NavLink>
          <NavLink to="connections" className={({ isActive }) => `p-3 rounded-lg ${isActive ? 'bg-solar text-deep-black font-bold' : 'hover:bg-gray-700'}`}>Gestor de Conexões</NavLink>
        </nav>
      </aside>
      <div className="w-3/4 flex flex-col"><Outlet /></div>
    </div>
  );
}
