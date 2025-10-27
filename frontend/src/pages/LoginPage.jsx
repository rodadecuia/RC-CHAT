import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_SOCKET_URL;

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@teste.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/login`, {
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
    <div className="min-h-screen flex items-center justify-center bg-deep-black">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-mist text-center mb-6">RC Chat Login</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded bg-gray-700 text-mist focus:outline-none focus:ring-2 focus:ring-solar"/>
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-bold mb-2">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded bg-gray-700 text-mist focus:outline-none focus:ring-2 focus:ring-solar"/>
          </div>
          <button type="submit" className="w-full bg-solar hover:opacity-90 text-deep-black font-bold py-3 px-4 rounded">Entrar</button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
}
