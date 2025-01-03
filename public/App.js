const { createClient } = supabase;
const supabaseClient = createClient(
  'https://xuyjfqgknmqtdniqzrnk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1eWpmcWdrbm1xdGRuaXF6cm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2MTU2MDYsImV4cCI6MjA1MTE5MTYwNn0.Zyg01poPDTrTg_FcezUklbgLyG2uNzZvewfcURWpNoo'
);

function NavMenu() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    window.location.hash = '/';
  };

  return (
    <nav className="bg-gray-800 text-white p-4 mb-4">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="font-bold">TechMant-IA</div>
        <div className="space-x-4">
          <a href="#/" className="hover:text-gray-300">Consulta</a>
          {isLoggedIn ? (
            <>
              <a href="#/admin" className="hover:text-gray-300">Admin</a>
              <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
                Salir
              </button>
            </>
          ) : (
            <a href="#/login" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Admin</a>
          )}
        </div>
      </div>
    </nav>
  );
}

function SearchPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [faults, setFaults] = React.useState([]);

  React.useEffect(() => {
    const fetchFaults = async () => {
      const { data, error } = await supabaseClient
        .from('fallos')
        .select('*');
      
      if (error) {
        console.error('Error:', error);
        return;
      }
      
      setFaults(data || []);
    };

    fetchFaults();
  }, []);

  const filteredFaults = faults.filter(fault => 
    fault.codigo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fault.mensaje?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Sistema de Consulta de Fallos</h1>
        <p className="text-gray-600">Consulta rápida de códigos de error y soluciones</p>
      </div>

      <input
        type="search"
        placeholder="Buscar por código (ej: def001) o mensaje"
        className="w-full p-4 mb-4 border rounded"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="space-y-4">
        {filteredFaults.map(fault => (
          <div key={fault.codigo} className="border rounded p-4">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-blue-600">{fault.codigo}</span>
              <span className="text-gray-600">{fault.mensaje}</span>
            </div>
            <div className="space-y-2">
              <div>
                <h3 className="font-bold">Causa:</h3>
                <p>{fault.causa}</p>
              </div>
              <div>
                <h3 className="font-bold">Consecuencia:</h3>
                <p>{fault.consecuencia}</p>
              </div>
              <div>
                <h3 className="font-bold">Acción Correctiva:</h3>
                <p>{fault.accion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      window.location.hash = '/admin';
    } catch (error) {
      setError('Error: ' + error.message);
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
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
  const [formData, setFormData] = React.useState({
    code: '',
    message: '',
    cause: '',
    consequence: '',
    action: ''
  });

  React.useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      if (!data.session) {
        window.location.hash = '/login';
        return;
      }
    };

    checkSession();
    fetchFaults();
  }, []);

  const fetchFaults = async () => {
    const { data, error } = await supabaseClient
      .from('fallos')
      .select('*')
      .order('codigo');

    if (error) {
      console.error('Error:', error);
      return;
    }

    setFaults(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabaseClient
        .from('fallos')
        .insert([{
          codigo: formData.code,
          mensaje: formData.message,
          causa: formData.cause,
          consecuencia: formData.consequence,
          accion: formData.action
        }]);

      if (error) throw error;

      setIsAdding(false);
      setFormData({
        code: '',
        message: '',
        cause: '',
        consequence: '',
        action: ''
      });
      fetchFaults();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (codigo) => {
    if (!window.confirm('¿Seguro que quieres eliminar este fallo?')) return;

    try {
      const { error } = await supabaseClient
        .from('fallos')
        .delete()
        .eq('codigo', codigo);

      if (error) throw error;
      fetchFaults();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Añadir Nuevo Fallo
        </button>
      </div>

      <div className="space-y-4">
        {faults.map(fault => (
          <div key={fault.codigo} className="border rounded p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-blue-600">{fault.codigo}</span>
                <span className="ml-4 text-gray-600">{fault.mensaje}</span>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleDelete(fault.codigo)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
            <h2 className="text-xl font-bold mb-4">Añadir Nuevo Fallo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Código</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                  pattern="^[A-Z0-9]+$"
                  title="Solo mayúsculas y números"
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
                  Añadir Fallo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
