function App() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [faults, setFaults] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/faults')
      .then(res => res.json())
      .then(data => setFaults(data))
      .catch(error => console.error('Error:', error));
  }, []);

  const filteredFaults = faults.filter(fault => 
    fault.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Sistema de Consulta de Fallos SERAC</h1>
        <p className="text-gray-600">Consulta rápida de códigos de error y soluciones</p>
      </div>

      <input
        type="search"
        placeholder="Buscar por código (ej: def001)"
        className="w-full p-4 mb-4 border rounded"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="space-y-4">
        {filteredFaults.map(fault => (
          <div key={fault.code} className="border rounded p-4">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-blue-600">{fault.code}</span>
              <span>{fault.message}</span>
            </div>
            <div>
              <h3 className="font-bold">Causa:</h3>
              <p>{fault.cause}</p>
              <h3 className="font-bold mt-2">Consecuencia:</h3>
              <p>{fault.consequence}</p>
              <h3 className="font-bold mt-2">Acción Correctiva:</h3>
              <p>{fault.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
