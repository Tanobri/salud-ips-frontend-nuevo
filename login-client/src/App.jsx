import { useState } from 'react';
import { login } from './api';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await login(email, password); // POST /auth/login en tu API Gateway
      // Si devuelve token en JSON, lo guardamos; si usa cookie, igual mostramos OK
      if (res && typeof res === 'object' && res.token) {
        localStorage.setItem('token', res.token);
      }
      setMsg('✅ Login exitoso');
    } catch (err) {
      setMsg(`❌ ${err.message || 'Error de autenticación'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#0b1020',color:'#e2e8f0'}}>
      <form onSubmit={onSubmit} style={{width:320, padding:24, background:'#10162a', border:'1px solid #1f2a44', borderRadius:16, boxShadow:'0 10px 24px rgba(0,0,0,.35)'}}>
        <h1 style={{marginTop:0, marginBottom:16, fontSize:22}}>Login</h1>

        <label style={{display:'block', fontSize:14, marginBottom:6}}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          style={{width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #1f2a44', background:'#0f1a31', color:'#e2e8f0', marginBottom:12}}
        />

        <label style={{display:'block', fontSize:14, marginBottom:6}}>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          placeholder="••••••••"
          required
          style={{width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #1f2a44', background:'#0f1a31', color:'#e2e8f0', marginBottom:16}}
        />

        <button
          type="submit"
          disabled={loading}
          style={{width:'100%', padding:'10px 12px', borderRadius:10, border:'none', background:'#3b82f6', color:'#fff', fontWeight:600, cursor:loading?'not-allowed':'pointer'}}
        >
          {loading ? 'Entrando…' : 'Ingresar'}
        </button>

        {msg && <p style={{marginTop:12, fontSize:14}}>{msg}</p>}

        <p style={{marginTop:14, fontSize:12, color:'#94a3b8'}}>
          La URL del backend se lee en runtime desde <code>/config.json</code> (API Gateway).
        </p>
      </form>
    </div>
  );
}
