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
  const [error, setError] = React.useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        window.location.hash = '/admin';
      } else {
        const data = await response.json();
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Acceso Administrador</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
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

function AdminPanel() {
  const [faults, setFaults] = React.useState([]);
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingFault, setEditingFault] = React.useState(null);
  const [formData, setFormData] = React.useState({
    code: '',
    message: '',
    cause: '',
    consequence: '',
    action: ''
  });

  // Verificar el token al cargar
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.hash = '/login';
      return;
    }
  }, []);

  // Cargar datos
  React.useEffect(() => {
    fetchFaults();
  }, []);

  const fetchFaults = async () => {
    try {
      const response = await fetch('/api/faults');
      const data = await response.json();
      setFaults(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/faults', {
        method: editingFault ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchFaults();
        setIsAdding(false);
        setEditingFault(null);
        setFormData({
          code: '',
          message: '',
          cause: '',
          consequence: '',
          action: ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (fault) => {
    setEditingFault(fault);
    setFormData(fault);
    setIsAdding(true);
  };

  const handleDelete = async (code) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este fallo?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/faults/${code}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchFaults();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Añadir Nuevo Fallo
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
            <h2 className="text-xl font-bold mb-4">
              {editingFault ? 'Editar Fallo' : 'Añadir Nuevo Fallo'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Código</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                  pattern="def\d{4}"
                  title="El código debe tener el formato: def0000"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Mensaje</label>
                <input
                  type="text"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Causa</label>
                <textarea
                  value={formData.cause}
                  onChange={(e) => setFormData({...formData, cause: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Consecuencia</label>
                <textarea
                  value={formData.consequence}
                  onChange={(e) => setFormData({...formData, consequence: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Acción Correctiva</label>
                <textarea
                  value={formData.action}
                  onChange={(e) => setFormData({...formData, action: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingFault(null);
                    setFormData({
                      code: '',
                      message: '',
                      cause: '',
                      consequence: '',
                      action: ''
                    });
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingFault ? 'Guardar Cambios' : 'Añadir Fallo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensaje</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {faults.map(fault => (
              <tr key={fault.code}>
                <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-medium">{fault.code}</td>
                <td className="px-6 py-4">{fault.message}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(fault)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(fault.code)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      {page === '/admin' && <AdminPanel />}
    </div>
  );

}
