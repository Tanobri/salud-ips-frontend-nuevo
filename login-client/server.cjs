const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DIST = path.join(__dirname, 'dist');
app.use(express.static(DIST));

// Config en runtime (antes del fallback)
app.get('/config.json', (_req, res) => {
  res.json({ API_BASE: process.env.API_BASE || '' });
});

// Fallback SPA: cualquier otra ruta sirve index.html
app.use((req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => console.log(`Login-client en http://0.0.0.0:${PORT}`));
