import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  getOrCreateUser,
  getUserSettings,
  saveUserSettings,
  getUserBookmarks,
  addBookmark,
  removeBookmark,
  getUserDhikrProgress,
  upsertDhikrProgress,
} from './src/db/users.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Routes secured with requireAuth (Firebase ID Token verification)
  // Sync User / Profile
  app.post('/api/user/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email;
      const displayName = (req.user as any).name || (req.user as any).displayName;
      const user = await getOrCreateUser(uid, email, displayName);
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Failed to sync user:', error);
      res.status(500).json({ error: error.message || 'Failed to sync user' });
    }
  });

  // User Settings
  app.get('/api/settings', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const settings = await getUserSettings(uid);
      res.json({ success: true, settings });
    } catch (error: any) {
      console.error('Failed to get settings:', error);
      res.status(500).json({ error: error.message || 'Failed to get settings' });
    }
  });

  app.post('/api/settings', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const settings = await saveUserSettings(uid, req.body);
      res.json({ success: true, settings });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      res.status(500).json({ error: error.message || 'Failed to save settings' });
    }
  });

  // Bookmarks
  app.get('/api/bookmarks', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const list = await getUserBookmarks(uid);
      res.json({ success: true, bookmarks: list });
    } catch (error: any) {
      console.error('Failed to get bookmarks:', error);
      res.status(500).json({ error: error.message || 'Failed to get bookmarks' });
    }
  });

  app.post('/api/bookmarks', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const bookmark = await addBookmark(uid, req.body);
      res.json({ success: true, bookmark });
    } catch (error: any) {
      console.error('Failed to add bookmark:', error);
      res.status(500).json({ error: error.message || 'Failed to add bookmark' });
    }
  });

  app.delete('/api/bookmarks/:verseKey', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const verseKey = decodeURIComponent(req.params.verseKey);
      await removeBookmark(uid, verseKey);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Failed to remove bookmark:', error);
      res.status(500).json({ error: error.message || 'Failed to remove bookmark' });
    }
  });

  // Dhikr Progress
  app.get('/api/dhikr', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const progress = await getUserDhikrProgress(uid);
      res.json({ success: true, progress });
    } catch (error: any) {
      console.error('Failed to get dhikr progress:', error);
      res.status(500).json({ error: error.message || 'Failed to get dhikr progress' });
    }
  });

  app.post('/api/dhikr', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const progress = await upsertDhikrProgress(uid, req.body);
      res.json({ success: true, progress });
    } catch (error: any) {
      console.error('Failed to save dhikr progress:', error);
      res.status(500).json({ error: error.message || 'Failed to save dhikr progress' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Bangla Mushaf & Cloud SQL' });
  });

  // In development, mount Vite's dev server middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
