import { useState } from 'react';
import { login, register } from './api';

// URL pública del portal en Azure
const PORTAL_URL = 'https://web-portal-salud-ips.azurewebsites.net/';

export default function App() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Campos compartidos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Solo registro
  const [rol, setRol] = useState('paciente');
  const [nombre, setNombre] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [token, setToken] = useState(null); // accessToken devuelto por el backend

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    if (mode === 'login') {
      setToken(null);
    }

    try {
      if (mode === 'login') {
        // ===== LOGIN =====
        const res = await login(email, password);

        if (res && typeof res === 'object' && res.accessToken) {
          setToken(res.accessToken);
          setMsg('✅ Login exitoso. Ahora puedes ir al portal.');
        } else {
          setMsg(
            '⚠️ Login correcto pero la respuesta no trae accessToken.'
          );
        }
      } else {
        // ===== REGISTRO =====
        const res = await register({ email, password, rol, nombre });

        // res trae: { user, registerToken, message }
        const texto =
          res?.message ||
          '✅ Registro exitoso. Ahora inicia sesión para continuar.';
        setMsg(texto);

        // Después de registrarse, lo mandamos a la vista de login
        setMode('login');
        setPassword('');
      }
    } catch (err) {
      setMsg(`❌ ${err.message || 'Error en la operación'}`);
    } finally {
      setLoading(false);
    }
  }

  function irAlPortal() {
    if (!token) return;

    // Construimos la URL del portal con el token como query: ?token=...
    const url = new URL(PORTAL_URL);
    url.searchParams.set('token', token);

    // Redirigimos al portal
    window.location.href = url.toString();
  }

  const isLogin = mode === 'login';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0b1020',
        color: '#e2e8f0',
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: 340,
          padding: 24,
          background: '#10162a',
          border: '1px solid #1f2a44',
          borderRadius: 16,
          boxShadow: '0 10px 24px rgba(0,0,0,.35)',
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 16, fontSize: 22 }}>
          {isLogin ? 'Login' : 'Registro'}
        </h1>

        {/* Email */}
        <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #1f2a44',
            background: '#0f1a31',
            color: '#e2e8f0',
            marginBottom: 12,
          }}
        />

        {/* Contraseña */}
        <label style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: '1px solid #1f2a44',
            background: '#0f1a31',
            color: '#e2e8f0',
            marginBottom: 16,
          }}
        />

        {/* Campos extra solo en registro */}
        {!isLogin && (
          <>
            {/* Nombre */}
            <label
              style={{ display: 'block', fontSize: 14, marginBottom: 6 }}
            >
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre completo"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #1f2a44',
                background: '#0f1a31',
                color: '#e2e8f0',
                marginBottom: 12,
              }}
            />

            {/* Rol */}
            <label
              style={{ display: 'block', fontSize: 14, marginBottom: 6 }}
            >
              Rol
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #1f2a44',
                background: '#0f1a31',
                color: '#e2e8f0',
                marginBottom: 16,
              }}
            >
              <option value="paciente">Paciente</option>
              <option value="medico">Médico</option>
              <option value="admin">Admin</option>
            </select>
          </>
        )}

        {/* Botón principal */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading
            ? isLogin
              ? 'Entrando…'
              : 'Registrando…'
            : isLogin
            ? 'Ingresar'
            : 'Registrarme'}
        </button>

        {/* Mensajes */}
        {msg && (
          <p style={{ marginTop: 12, fontSize: 14 }}>
            {msg}
          </p>
        )}

        {/* Botón para ir al portal solo cuando ya tenemos token (login) */}
        {isLogin && (
          <button
            type="button"
            onClick={irAlPortal}
            disabled={!token}
            style={{
              marginTop: 10,
              width: '100%',
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid #334155',
              background: token ? '#0f172a' : '#111827',
              color: token ? '#e2e8f0' : '#6b7280',
              fontSize: 14,
              cursor: token ? 'pointer' : 'not-allowed',
            }}
          >
            Ir al portal con el token
          </button>
        )}

        {/* Toggle entre login y registro */}
        <p
          style={{
            marginTop: 14,
            fontSize: 12,
            color: '#94a3b8',
          }}
        >
          {isLogin ? (
            <>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setMsg('');
                  setToken(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Regístrate aquí
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setMsg('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>

        <p
          style={{
            marginTop: 4,
            fontSize: 11,
            color: '#64748b',
          }}
        >
          La URL del backend se lee en runtime desde{' '}
          <code>/config.json</code> (API del auth).
        </p>
      </form>
    </div>
  );
}

