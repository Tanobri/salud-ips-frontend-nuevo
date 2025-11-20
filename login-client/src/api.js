import { API_BASE } from './config';

// Une base + path cuidando los slashes
function join(base, path) {
  const b = (base || '').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : '/' + path;
  return b + p;
}

// Wrapper simple con fetch
export async function api(path, init = {}) {
  const url = join(API_BASE, path);
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    credentials: 'include', // útil si el gateway usa cookies; si no, no afecta
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// Login (usa /auth/login de tu API)
export function login(email, password) {
  return api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// 🔹 Registro (usa /auth/register de tu API)
export function register({ email, password, rol, nombre }) {
  return api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, rol, nombre }),
  });
}

