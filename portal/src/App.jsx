import { useEffect, useState } from 'react';
import './App.css';

// ===============================
//  API Gateway (API Management)
// ===============================
// Toda la comunicación del portal va a pasar por el API Gateway.
// Más adelante se puede mover a variables de entorno, por ahora lo dejamos fijo.
const API_BASE = 'https://apigatewaysaludobri.azure-api.net';

function App() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('');

  // ==== Estados del formulario de creación de cita ====
  const [medicoId, setMedicoId] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');
  const [createdCita, setCreatedCita] = useState(null);

  // ==== Estados del formulario de nota SOAP ====
  const [citaIdNota, setCitaIdNota] = useState('');
  const [S, setS] = useState('');
  const [O, setO] = useState('');
  const [A, setA] = useState('');
  const [P, setP] = useState('');
  const [creatingNota, setCreatingNota] = useState(false);
  const [createNotaMsg, setCreateNotaMsg] = useState('');
  const [createdNota, setCreatedNota] = useState(null);

  // ================================
  //  Manejo del token (URL + localStorage)
  // ================================
  useEffect(() => {
    const url = new URL(window.location.href);
    const fromQuery = url.searchParams.get('token');

    if (fromQuery) {
      // 1) Token recibido desde el login via ?token=
      setToken(fromQuery);
      setStatus('🔓 Token recibido desde el login y almacenado.');
      localStorage.setItem('portalAccessToken', fromQuery);

      // 2) Limpiar la URL para que no quede el token visible
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.toString());
    } else {
      // 3) Intentar cargar token desde localStorage
      const stored = localStorage.getItem('portalAccessToken');
      if (stored) {
        setToken(stored);
        setStatus('🔐 Token cargado desde el almacenamiento local.');
      } else {
        setStatus(
          '⚠️ No se encontró token. Inicia sesión primero en el login y deja que te redirija al portal.'
        );
      }
    }
  }, []);

  // ==========================
  //  Crear CITA
  // ==========================
  async function handleCrearCita(e) {
    e.preventDefault();
    setCreateMsg('');
    setCreatedCita(null);

    if (!token) {
      setCreateMsg(
        '⚠️ No hay token disponible. Debes iniciar sesión en el login para obtenerlo.'
      );
      return;
    }

    if (!medicoId || !fechaHora || !motivo) {
      setCreateMsg('⚠️ Debes llenar todos los campos de la cita.');
      return;
    }

    setCreating(true);
    try {
      const fechaISO = new Date(fechaHora).toISOString();

      // 👉 Usamos el API GATEWAY: POST /citas
      const resp = await fetch(`${API_BASE}/citas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicoId,
          fechaHora: fechaISO,
          motivo,
        }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        setCreateMsg(
          `❌ Error al crear la cita (HTTP ${resp.status}): ${txt}`
        );
        return;
      }

      const data = await resp.json();
      setCreatedCita(data);
      setCreateMsg('✅ Cita creada correctamente a través del API Gateway.');

      // Si la API devuelve un id, lo usamos para prellenar la nota
      if (data.id) {
        setCitaIdNota(String(data.id));
      }
    } catch (err) {
      console.error(err);
      setCreateMsg(
        `❌ Error inesperado al crear la cita: ${
          err.message || 'ver consola'
        }`
      );
    } finally {
      setCreating(false);
    }
  }

  // ==========================
  //  Crear NOTA SOAP
  // ==========================
  async function handleCrearNota(e) {
    e.preventDefault();
    setCreateNotaMsg('');
    setCreatedNota(null);

    if (!token) {
      setCreateNotaMsg(
        '⚠️ No hay token disponible. Debes iniciar sesión en el login primero.'
      );
      return;
    }

    if (!citaIdNota) {
      setCreateNotaMsg(
        '⚠️ Debes indicar el ID de la cita para registrar la nota SOAP.'
      );
      return;
    }

    if (!S && !O && !A && !P) {
      setCreateNotaMsg(
        '⚠️ Al menos uno de los campos S, O, A, P debe tener información.'
      );
      return;
    }

    setCreatingNota(true);
    try {
      // 👉 API GATEWAY: POST /citas/{id}/nota
      const resp = await fetch(
        `${API_BASE}/citas/${encodeURIComponent(citaIdNota)}/nota`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ S, O, A, P }),
        }
      );

      if (!resp.ok) {
        const txt = await resp.text();
        setCreateNotaMsg(
          `❌ Error al crear la nota SOAP (HTTP ${resp.status}): ${txt}`
        );
        return;
      }

      const data = await resp.json();
      setCreatedNota(data);
      setCreateNotaMsg('✅ Nota SOAP creada correctamente vía Gateway.');
    } catch (err) {
      console.error(err);
      setCreateNotaMsg(
        `❌ Error inesperado al crear la nota: ${
          err.message || 'ver consola'
        }`
      );
    } finally {
      setCreatingNota(false);
    }
  }

  // ==========================
  //  Cerrar sesión (logout)
  // ==========================
  function handleLogout() {
    // Borrar token del almacenamiento local del portal
    localStorage.removeItem('portalAccessToken');

    // Limpiar estado
    setToken('');
    setStatus(
      '🔒 Sesión cerrada en el portal. Debes iniciar sesión de nuevo desde el login.'
    );

    // Limpiar formularios y resultados
    setMedicoId('');
    setFechaHora('');
    setMotivo('');
    setCitaIdNota('');
    setS('');
    setO('');
    setA('');
    setP('');
    setCreatedCita(null);
    setCreatedNota(null);
    setCreateMsg('');
    setCreateNotaMsg('');
  }

  // ==========================
  //  Render
  // ==========================
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, #111827 0, #020617 40%, #000 100%)',
        color: '#e5e7eb',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          background: '#020617',
          borderRadius: 24,
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          border: '1px solid rgba(148,163,184,0.3)',
        }}
      >
        <header style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 28,
              margin: 0,
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            Portal Clínico - Salud IPS
          </h1>
          <p style={{ marginTop: 8, color: '#9ca3af' }}>
            Este portal consume las APIs de Citas y Notas a través del{' '}
            <strong>API Management</strong> (
            <code>apigatewaysaludobri.azure-api.net</code>).
          </p>
        </header>

        {/* Estado del token + botón Cerrar sesión */}
        <section
          style={{
            marginBottom: 24,
            padding: '1rem',
            borderRadius: 16,
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(148,163,184,0.4)',
          }}
        >
          <div
            style={{
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>
              <strong>Estado del token:</strong>
            </span>

            {token && (
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: '0.3rem 0.9rem',
                  borderRadius: 999,
                  border: '1px solid #f97373',
                  background: 'transparent',
                  color: '#fecaca',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Cerrar sesión
              </button>
            )}
          </div>

          <div style={{ color: '#e5e7eb' }}>{status}</div>

          {token && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: '#9ca3af',
                wordBreak: 'break-all',
              }}
            >
              <span style={{ fontWeight: 500 }}>Token (parcial): </span>
              <code>{token.slice(0, 40)}...</code>
            </div>
          )}
        </section>

        {/* =========================
            FORMULARIO: CREAR CITA
        ========================== */}
        <section
          style={{
            marginBottom: 32,
            padding: '1.5rem',
            borderRadius: 16,
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(148,163,184,0.4)',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 20 }}>
            1. Crear Cita
          </h2>
          <p style={{ marginTop: 0, color: '#9ca3af' }}>
            Esta operación llama a <code>POST /citas</code> en el API Gateway.
          </p>

          <form onSubmit={handleCrearCita}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>
                ID del médico
              </label>
              <input
                type="text"
                value={medicoId}
                onChange={(e) => setMedicoId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 999,
                  border: '1px solid #4b5563',
                  background: '#020617',
                  color: '#e5e7eb',
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Fecha y hora
              </label>
              <input
                type="datetime-local"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 999,
                  border: '1px solid #4b5563',
                  background: '#020617',
                  color: '#e5e7eb',
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Motivo de la cita
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 16,
                  border: '1px solid #4b5563',
                  background: '#020617',
                  color: '#e5e7eb',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={creating || !token}
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: 999,
                border: 'none',
                background:
                  'linear-gradient(to right, #22c55e, #16a34a, #22c55e)',
                color: '#0b1120',
                fontWeight: 600,
                cursor: creating || !token ? 'not-allowed' : 'pointer',
                opacity: !token ? 0.6 : 1,
              }}
            >
              {creating ? 'Creando cita...' : 'Crear cita'}
            </button>
          </form>

          {createMsg && (
            <div style={{ marginTop: 12, color: '#e5e7eb' }}>{createMsg}</div>
          )}

          {createdCita && (
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                borderRadius: 12,
                background: '#020617',
                border: '1px solid #4b5563',
                padding: '0.75rem',
                maxHeight: 260,
                overflow: 'auto',
              }}
            >
              <div style={{ marginBottom: 4, color: '#9ca3af' }}>
                Respuesta de la API (cita creada):
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(createdCita, null, 2)}
              </pre>
            </div>
          )}
        </section>

        {/* =========================
            FORMULARIO: NOTA SOAP
        ========================== */}
        <section
          style={{
            marginBottom: 8,
            padding: '1.5rem',
            borderRadius: 16,
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(148,163,184,0.4)',
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 20 }}>
            2. Registrar Nota SOAP
          </h2>
          <p style={{ marginTop: 0, color: '#9ca3af' }}>
            Esta operación llama a{' '}
            <code>POST /citas/&lt;id&gt;/nota</code> en el API Gateway.
          </p>

          <form onSubmit={handleCrearNota}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>
                ID de la cita
              </label>
              <input
                type="text"
                value={citaIdNota}
                onChange={(e) => setCitaIdNota(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 999,
                  border: '1px solid #4b5563',
                  background: '#020617',
                  color: '#e5e7eb',
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: '1fr 1fr',
              }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  S (Subjetivo)
                </label>
                <textarea
                  value={S}
                  onChange={(e) => setS(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 16,
                    border: '1px solid #4b5563',
                    background: '#020617',
                    color: '#e5e7eb',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  O (Objetivo)
                </label>
                <textarea
                  value={O}
                  onChange={(e) => setO(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 16,
                    border: '1px solid #4b5563',
                    background: '#020617',
                    color: '#e5e7eb',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: '1fr 1fr',
                marginTop: 12,
              }}
            >
              <div>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  A (Análisis)
                </label>
                <textarea
                  value={A}
                  onChange={(e) => setA(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 16,
                    border: '1px solid #4b5563',
                    background: '#020617',
                    color: '#e5e7eb',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4 }}>
                  P (Plan)
                </label>
                <textarea
                  value={P}
                  onChange={(e) => setP(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 16,
                    border: '1px solid #4b5563',
                    background: '#020617',
                    color: '#e5e7eb',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingNota || !token}
              style={{
                marginTop: 16,
                padding: '0.6rem 1.4rem',
                borderRadius: 999,
                border: 'none',
                background:
                  'linear-gradient(to right, #38bdf8, #0ea5e9, #38bdf8)',
                color: '#0b1120',
                fontWeight: 600,
                cursor: creatingNota || !token ? 'not-allowed' : 'pointer',
                opacity: !token ? 0.6 : 1,
              }}
            >
              {creatingNota ? 'Registrando nota...' : 'Registrar nota SOAP'}
            </button>
          </form>

          {createNotaMsg && (
            <div style={{ marginTop: 12, color: '#e5e7eb' }}>
              {createNotaMsg}
            </div>
          )}

          {createdNota && (
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                borderRadius: 12,
                background: '#020617',
                border: '1px solid #4b5563',
                padding: '0.75rem',
                maxHeight: 260,
                overflow: 'auto',
              }}
            >
              <div style={{ marginBottom: 4, color: '#9ca3af' }}>
                Respuesta de la API (nota creada):
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(createdNota, null, 2)}
              </pre>
            </div>
          )}
        </section>

        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>
          El token se almacena solo en este dominio del portal (
          <code>localStorage["portalAccessToken"]</code>). No tiene acceso al{' '}
          <code>localStorage</code> del login porque son orígenes diferentes.
        </p>
      </div>
    </div>
  );
}

export default App;
