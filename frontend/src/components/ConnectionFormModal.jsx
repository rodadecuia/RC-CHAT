import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_SOCKET_URL;

export default function ConnectionFormModal({ token, companyId, connection, onClose, onSaveSuccess }) {
  const [name, setName] = useState(connection ? connection.name : '');
  const [channelType, setChannelType] = useState(connection ? connection.channel_type : 'WHATSAPP_QRCODE');
  const [instanceName, setInstanceName] = useState(connection?.credentials?.instanceName || '');
  const [credentialsJson, setCredentialsJson] = useState(connection ? JSON.stringify(connection.credentials, null, 2) : '{}');
  const [error, setError] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);

  const channelOptions = ['WHATSAPP_QRCODE', 'INSTAGRAM_DIRECT', 'FACEBOOK_MESSENGER', 'TELEGRAM', 'WHATSAPP_API'];

  // Atualiza credentialsJson quando instanceName ou channelType mudam
  useEffect(() => {
    if (channelType === 'WHATSAPP_QRCODE') {
      setCredentialsJson(JSON.stringify({ instanceName }, null, 2));
    } else {
      // Para outros tipos, mantém o JSON original ou um JSON vazio
      if (!connection || connection.channel_type !== channelType) {
        setCredentialsJson('{}');
      }
    }
  }, [channelType, instanceName, connection]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    let parsedCredentials;
    try {
      parsedCredentials = JSON.parse(credentialsJson);
    } catch (e) {
      setError('Credenciais inválidas: O campo deve ser um JSON válido.');
      return;
    }

    const payload = {
      company_id: companyId,
      name,
      channel_type: channelType,
      credentials: parsedCredentials,
    };

    try {
      const method = connection ? 'PUT' : 'POST';
      const url = connection ? `${API_URL}/api/admin/connections/${connection.id}` : `${API_URL}/api/admin/connections`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar conexão.');
      }

      onSaveSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGenerateQrCode = async () => {
    if (!instanceName) {
      setError('O nome da instância é obrigatório para gerar o QR Code.');
      return;
    }
    setQrCodeLoading(true);
    setQrCodeImage(null);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/evolution/connections/${instanceName}/qrcode`, {
        headers: { 'Authorization': `Bearer ${token}` }, // Pode ser necessário autenticar esta chamada
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao gerar QR Code.');
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setQrCodeImage(imageUrl);

    } catch (err) {
      setError(err.message);
    } finally {
      setQrCodeLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-deep-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg text-mist">
        <h2 className="text-2xl font-bold mb-6 text-solar">{connection ? 'Editar Conexão' : 'Adicionar Nova Conexão'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-mist text-sm font-bold mb-2">Nome da Conexão</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded bg-deep-black text-mist focus:outline-none focus:ring-2 focus:ring-solar" required />
          </div>
          <div className="mb-4">
            <label htmlFor="channelType" className="block text-mist text-sm font-bold mb-2">Tipo de Canal</label>
            <select id="channelType" value={channelType} onChange={e => setChannelType(e.target.value)} className="w-full p-3 rounded bg-deep-black text-mist focus:outline-none focus:ring-2 focus:ring-solar" required>
              {channelOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          {channelType === 'WHATSAPP_QRCODE' && (
            <div className="mb-4">
              <label htmlFor="instanceName" className="block text-mist text-sm font-bold mb-2">Nome da Instância (Evolution API)</label>
              <input type="text" id="instanceName" value={instanceName} onChange={e => setInstanceName(e.target.value)} className="w-full p-3 rounded bg-deep-black text-mist focus:outline-none focus:ring-2 focus:ring-solar" placeholder="Ex: meu_whatsapp_principal" required={channelType === 'WHATSAPP_QRCODE'} />
              <button type="button" onClick={handleGenerateQrCode} disabled={qrCodeLoading} className="mt-2 w-full bg-vibrant hover:opacity-90 text-deep-black font-bold py-2 px-4 rounded">
                {qrCodeLoading ? 'Gerando QR Code...' : 'Gerar QR Code'}
              </button>
              {qrCodeImage && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-mist mb-2">Escaneie com seu celular:</p>
                  <img src={qrCodeImage} alt="QR Code" className="mx-auto border-2 border-solar p-2" />
                </div>
              )}
            </div>
          )}

          {channelType !== 'WHATSAPP_QRCODE' && (
            <div className="mb-6">
              <label htmlFor="credentials" className="block text-mist text-sm font-bold mb-2">Credenciais (JSON)</label>
              <textarea id="credentials" value={credentialsJson} onChange={e => setCredentialsJson(e.target.value)} rows="6" className="w-full p-3 rounded bg-deep-black text-mist focus:outline-none focus:ring-2 focus:ring-solar font-mono" placeholder="{\"token\": \"seu_token_aqui\", \"instance_id\": \"123\"}"></textarea>
            </div>
          )}

          {error && <p className="text-cosmic text-sm mt-2">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-mist font-bold py-2 px-4 rounded">Cancelar</button>
            <button type="submit" className="bg-solar hover:opacity-90 text-deep-black font-bold py-2 px-4 rounded">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
