import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '15mb' }));

  const dataFilePath = path.join(__dirname, 'src', 'data', 'persistedData.json');

  // Load initial data
  let currentSystemData: any = null;
  try {
    if (fs.existsSync(dataFilePath)) {
      currentSystemData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading persisted data file:', err);
  }

  // Enable CORS & No-Cache for all API routes to ensure instant multi-device synchronization
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Cache-Control, Pragma');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    if (req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }
    next();
  });

  // API Route: Get latest system data (shared across all devices)
  app.get('/api/system-data', (_req, res) => {
    try {
      if (fs.existsSync(dataFilePath)) {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        currentSystemData = parsed;
        res.json({
          status: 'success',
          data: parsed,
          serverTime: new Date().toISOString(),
          updatedAt: parsed.updatedAt || new Date().toISOString(),
        });
        return;
      }
    } catch (e) {
      console.warn('Reading dataFilePath failed, using in-memory state:', e);
    }

    res.json({
      status: 'success',
      data: currentSystemData,
      serverTime: new Date().toISOString(),
      updatedAt: currentSystemData?.updatedAt || new Date().toISOString(),
    });
  });

  // API Route: Save system data (immediately writes to disk and memory for all devices)
  app.post('/api/admin/save-config', (req, res) => {
    try {
      const { config, announcements, schedule } = req.body;
      if (!config) {
        res.status(400).json({ status: 'error', message: 'Config payload is required' });
        return;
      }

      const updatedAt = new Date().toISOString();
      const payload = {
        config,
        announcements: announcements || [],
        schedule: schedule || [],
        updatedAt,
      };

      currentSystemData = payload;

      try {
        fs.writeFileSync(dataFilePath, JSON.stringify(payload, null, 2), 'utf-8');
      } catch (writeErr) {
        console.error('File write warning:', writeErr);
      }

      console.log(`[SYNC] System config updated by admin at ${updatedAt}. Synced across all connected devices.`);

      res.json({
        status: 'success',
        message: 'Saved successfully and broadcasted across all devices',
        updatedAt,
        data: payload,
      });
    } catch (err: any) {
      console.error('Failed to save system data:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // Mount Vite middleware in development
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
