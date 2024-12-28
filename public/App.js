import React, { useState, useEffect } from 'react';

const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [faults, setFaults] = useState([]);

  useEffect(() => {
    fetch('/api/faults')
      .then(res => res.json())
      .then(data => setFaults(data))
      .catch(error => console.error('Error:', error));
  }, []);

  const filteredFaults = faults.filter(fault => 
    fault.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fault.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Sistema de Consulta de Fallos SERAC</h1>
        <p className="text-gray-600">Consulta rápida de códigos de error y soluciones</p>
      </div>

      <div className="mb-6 relative">
        <input
          type="search"
          placeholder="Buscar por código (ej: def001) o mensaje"
          className="w-full p-4 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <svg
          className="w-6 h-6 text-gray-400 absolute left-3 top-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="space-y-4">
        {filteredFaults.map(fault => (
          <div
            key={fault.code}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
          >
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-600">{fault.code}</span>
                <span className="text-gray-600">{fault.message}</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Causa:</h3>
                <p className="text-gray-600">{fault.cause}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Consecuencia:</h3>
                <p className="text-gray-600">{fault.consequence}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Acción Correctiva:</h3>
                <p className="text-gray-600">{fault.action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
