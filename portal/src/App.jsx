import { useEffect, useState } from 'react';
import './App.css';

// URL base del servicio de citas en Azure
const CITAS_API_BASE =
  'https://citas-api-cloud-gtadg0fycqhqf6hk.canadacentral-01.azurewebsites.net';

// URL base del servicio de notas (SOAP) en Azure
const NOTAS_API_BASE =
  'https://notas-api-cloud-evhxddgkdfbfdngr.canadacentral-01.azurewebsites.net';

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

  // ==== Estados del formulario de creación de nota SOAP ====
  const [citaIdNota, setCitaIdNota] = useState('');
  const [S, setS] = useState('');
  const [O, setO] = useState('');
  const [A, setA] = useState('');
  const [P, setP] = useState('');
  const [creatingNota, setCreatingNota] = useState(false);
  const [createNotaMsg, setCreateNotaMsg] = useState('');
  const [createdNota, setCreatedNota] = useState(null);

  useEffect(() => {
    // 1) Intentamos leer el token desde la URL (?token=...)
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('token');

    if (fromQuery) {
      setToken(fromQuery);
      localStorage.setItem('portalAccessToken', fromQuery);
      setStatus(
        '✅ Token recibido desde el login. El portal ya puede usar las APIs protegidas.'
      );

      // Limpiamos la URL para que no quede el token visible
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.toString());
    } else {
      // 2) Si no hay token en la URL, revisamos si hay uno guardado en este dominio
      const stored = localStorage.getItem('portalAccessToken');
      if (stored) {
        setToken(stored);
        setStatus(
          'ℹ️ Usando el token guardado previamente en este navegador.'
        );
      } else {
        setStatus(
          '⚠️ No se encontró token. Inicia sesión primero en el login para entrar con un token válido.'
        );
      }
    }
  }, []);

  // ==== Crear CITA ====
  async function handleCrearCita(e) {
    e.preventDefault();
    setCreateMsg('');
    setCreatedCita(null);

    if (!token) {
      setCreateMsg(
        '❌ No hay token disponible. Debes iniciar sesión en el login primero.'
      );
      return;
    }

    if (!medicoId || !fechaHora || !motivo) {
      setCreateMsg('⚠️ Todos los campos de la cita son obligatorios.');
      return;
    }

    setCreating(true);
    try {
      const fechaISO = new Date(fechaHora).toISOString();

      const resp = await fetch(`${CITAS_API_BASE}/citas`, {
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

      const data = await resp.json();

      if (!resp.ok) {
        setCreateMsg(
          `❌ Error al crear la cita: ${
            data?.message || `HTTP ${resp.status}`
          }`
        );
        return;
      }

      setCreateMsg('✅ Cita creada correctamente.');
      setCreatedCita(data);

      // Rellenamos automáticamente el campo de cita para la nota
      if (data.id) {
        setCitaIdNota(data.id);
      }
    } catch (err) {
      setCreateMsg(
        `❌ Error inesperado al crear la cita: ${
          err.message || 'ver consola'
        }`
      );
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  // ==== Crear NOTA SOAP ====
  async function handleCrearNota(e) {
    e.preventDefault();
    setCreateNotaMsg('');
    setCreatedNota(null);

    if (!token) {
      setCreateNotaMsg(
        '❌ No hay token disponible. Debes iniciar sesión en el login primero.'
      );
      return;
    }

    if (!citaIdNota) {
      setCreateNotaMsg('⚠️ Debes indicar el ID de la cita.');
      return;
    }

    if (!S && !O && !A && !P) {
      setCreateNotaMsg('⚠️ Escribe al menos un campo de la nota (S, O, A o P).');
      return;
    }

    setCreatingNota(true);
    try {
      const resp = await fetch(
        `${NOTAS_API_BASE}/citas/${encodeURIComponent(citaIdNota)}/nota`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ S, O, A, P }),
        }
      );

      const data = await resp.json();

      if (!resp.ok) {
        setCreateNotaMsg(
          `❌ Error al crear la nota SOAP: ${
            data?.message || `HTTP ${resp.status}`
          }`
        );
        return;
      }

      setCreateNotaMsg('✅ Nota SOAP creada correctamente.');
      setCreatedNota(data);
    } catch (err) {
      setCreateNotaMsg(
        `❌ Error inesperado al crear la nota: ${err.message || 'ver consola'}`
      );
      console.error(err);
    } finally {
      setCreatingNota(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#020617',
        color: '#e5e7eb',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 900,
          padding: 24,
          borderRadius: 16,
          background: '#0b1120',
          border: '1px solid #1e293b',
          boxShadow: '0 10px 24px rgba(0,0,0,.45)',
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 24 }}>
          Portal Salud IPS
        </h1>

        <p style={{ marginBottom: 12, fontSize: 14 }}>{status}</p>

        {token && (
          <p
            style={{
              marginTop: 8,
              marginBottom: 16,
              fontSize: 12,
              wordBreak: 'break-all',
            }}
          >
            <strong>Token (vista parcial):</strong> {token.slice(0, 40)}...
          </p>
        )}

        <hr style={{ borderColor: '#1e293b', margin: '16px 0' }} />

        {/* ==== Sección Crear Cita ==== */}
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Crear nueva cita</h2>
        <p style={{ fontSize: 13, marginTop: 0, marginBottom: 12 }}>
          Usa el mismo formato que probaste en Postman:{' '}
          <code>medicoId</code>, <code>fechaHora</code> y <code>motivo</code>.
        </p>

        <form onSubmit={handleCrearCita}>
          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              ID del médico
            </label>
            <input
              type="text"
              value={medicoId}
              onChange={(e) => setMedicoId(e.target.value)}
              placeholder="medico-demo-1"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #1f2937',
                background: '#020617',
                color: '#e5e7eb',
              }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              Fecha y hora
            </label>
            <input
              type="datetime-local"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #1f2937',
                background: '#020617',
                color: '#e5e7eb',
              }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              Motivo
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="Control general, revisión, etc."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #1f2937',
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
              marginTop: 8,
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              background: !token ? '#4b5563' : '#22c55e',
              color: '#0b1120',
              fontWeight: 600,
              cursor: !token ? 'not-allowed' : 'pointer',
            }}
          >
            {creating ? 'Creando cita...' : 'Crear cita'}
          </button>
        </form>

        {createMsg && (
          <p
            style={{
              marginTop: 12,
              fontSize: 14,
            }}
          >
            {createMsg}
          </p>
        )}

        {createdCita && (
          <pre
            style={{
              marginTop: 12,
              fontSize: 12,
              background: '#020617',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #1e293b',
              overflowX: 'auto',
            }}
          >
{JSON.stringify(createdCita, null, 2)}
          </pre>
        )}

        <hr style={{ borderColor: '#1e293b', margin: '24px 0' }} />

        {/* ==== Sección Crear Nota SOAP ==== */}
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Crear nota SOAP</h2>
        <p style={{ fontSize: 13, marginTop: 0, marginBottom: 12 }}>
          Crea una nota SOAP asociada a una cita existente. Puedes usar el ID
          de la última cita creada (se llena automáticamente arriba) o pegar
          el ID de otra cita.
        </p>

        <form onSubmit={handleCrearNota}>
          <div style={{ marginBottom: 10 }}>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              ID de la cita
            </label>
            <input
              type="text"
              value={citaIdNota}
              onChange={(e) => setCitaIdNota(e.target.value)}
              placeholder="c1763..."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #1f2937',
                background: '#020617',
                color: '#e5e7eb',
              }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              S – Subjectivo
            </label>
            <textarea
              value={S}
              onChange={(e) => setS(e.target.value)}
              rows={2}
              placeholder="Qué refiere el paciente..."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #1f2937',
                background: '#020617',
                color: '#e5e7eb',
              }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              O – Objetivo
            </label>
            <textarea
              value={O}
              onChange={(e) => setO(e.target.value)}
              rows={2}
              placeholder="Signos vitales, hallazgos..."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #1f2937',
                background: '#020617',
                color: '#e5e7eb',
              }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              A – Análisis
            </label>
            <textarea
              value={A}
              onChange={(e) => setA(e.target.value)}
              rows={2}
              placeholder="Impresión diagnóstica..."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #1f2937',
                background: '#020617',
                color: '#e5e7eb',
              }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label
              style={{
                display: 'block',
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              P – Plan
            </label>
            <textarea
              value={P}
              onChange={(e) => setP(e.target.value)}
              rows={2}
              placeholder="Tratamiento, controles, educación..."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid #1f2937',
                background: '#020617',
                color: '#e5e7eb',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={creatingNota || !token}
            style={{
              marginTop: 8,
              padding: '10px 14px',
              borderRadius: 10,
              border: 'none',
              background: !token ? '#4b5563' : '#38bdf8',
              color: '#0b1120',
              fontWeight: 600,
              cursor: !token ? 'not-allowed' : 'pointer',
            }}
          >
            {creatingNota ? 'Creando nota...' : 'Crear nota SOAP'}
          </button>
        </form>

        {createNotaMsg && (
          <p
            style={{
              marginTop: 12,
              fontSize: 14,
            }}
          >
            {createNotaMsg}
          </p>
        )}

        {createdNota && (
          <pre
            style={{
              marginTop: 12,
              fontSize: 12,
              background: '#020617',
              padding: 12,
              borderRadius: 8,
              border: '1px solid #1e293b',
              overflowX: 'auto',
            }}
          >
{JSON.stringify(createdNota, null, 2)}
          </pre>
        )}

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
