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

  // API Route: Get latest system data (shared across all devices)
  app.get('/api/system-data', (_req, res) => {
    try {
      if (fs.existsSync(dataFilePath)) {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        res.json({ status: 'success', data: JSON.parse(fileContent) });
        return;
      }
    } catch (e) {
      // fallback to memory
    }
    res.json({ status: 'success', data: currentSystemData });
  });

  // API Route: Save system data (immediately writes to disk and memory for all devices)
  app.post('/api/admin/save-config', (req, res) => {
    try {
      const { config, announcements, schedule } = req.body;
      if (!config) {
        res.status(400).json({ status: 'error', message: 'Config payload is required' });
        return;
      }

      const payload = {
        config,
        announcements: announcements || [],
        schedule: schedule || [],
        updatedAt: new Date().toISOString(),
      };

      currentSystemData = payload;
      fs.writeFileSync(dataFilePath, JSON.stringify(payload, null, 2), 'utf-8');
      console.log('Successfully saved system configuration to disk at', new Date().toISOString());

      res.json({ status: 'success', message: 'Saved successfully and embedded into system' });
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
