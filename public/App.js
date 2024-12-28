function NavMenu() {
  return (
    <nav className="bg-gray-800 text-white p-4 mb-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="font-bold">SERAC Fallos</div>
        <div className="space-x-4">
          <a href="#/" className="hover:text-gray-300">Consulta</a>
          <a href="#/login" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Admin</a>
        </div>
      </div>
    </nav>
  );
}

function SearchPage() {
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

function LoginPage() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    // Por ahora solo mostraremos un mensaje
    alert('Función de login pendiente de implementar');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Acceso Administrador</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}

function App() {
  const [page, setPage] = React.useState(window.location.hash.slice(1) || '/');

  React.useEffect(() => {
    const handleHashChange = () => {
      setPage(window.location.hash.slice(1) || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div>
      <NavMenu />
      {page === '/' && <SearchPage />}
      {page === '/login' && <LoginPage />}
    </div>
  );
}
