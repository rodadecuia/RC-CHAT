import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function AuthenticatedLayout({ user, onLogout }) {
  return (
    <div className="h-screen w-screen bg-deep-black text-mist flex">
      <aside className="w-64 bg-gray-800 p-4 flex flex-col flex-shrink-0">
        <h1 className="text-2xl font-bold mb-8 text-solar">RC Chat</h1>
        <nav className="flex flex-col space-y-2">
          <NavLink to="/chat" className={({ isActive }) => `p-3 rounded-lg ${isActive ? 'bg-solar text-deep-black font-bold' : 'hover:bg-gray-700'}`}>Conversas</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `p-3 rounded-lg ${isActive ? 'bg-solar text-deep-black font-bold' : 'hover:bg-gray-700'}`}>Dashboard</NavLink>
          {user.role === 'admin' && <NavLink to="/admin" className={({ isActive }) => `p-3 rounded-lg ${isActive ? 'bg-solar text-deep-black font-bold' : 'hover:bg-gray-700'}`}>Administração</NavLink>}
        </nav>
        <div className="mt-auto"><button onClick={onLogout} className="w-full bg-cosmic hover:opacity-80 text-mist font-bold py-2 px-4 rounded">Logout</button></div>
      </aside>
      <main className="flex-grow flex flex-col overflow-hidden"><Outlet /></main>
    </div>
  );
}
