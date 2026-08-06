// ==========================================
// MAIN EXPRESS SERVER ENTRY POINT
// Urdu Comment: Yeh Express server script hai jo APIs aur Vite frontend server chalata hai
// ==========================================

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import authRouter from './server/routes/auth';
import productRouter, { ensureProductsTable } from './server/routes/products';
import { checkDatabaseConnection } from './server/db';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Urdu Comment: JSON body parser aur CORS enable kar rahe hain
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });

  // Urdu Comment: Auth routes ko /api path par attach kar rahe hain
  const isDatabaseConnected = await checkDatabaseConnection();
  if (isDatabaseConnected) {
    await ensureProductsTable();
  }
  app.use('/uploads/products', express.static(path.join(process.cwd(), 'uploads', 'products')));
  app.use('/api', authRouter);
  app.use('/api', productRouter);

  // Health check API endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Urdu Comment: Development vs Production mode setup (Vite integration)
  if (process.env.NODE_ENV !== 'production') {
    console.log('// Urdu Comment: Vite development middleware initialize ho raha hai...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    console.log('// Urdu Comment: Production static files serve ki ja rahi hain...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server http://localhost:${PORT} par kamyabi se chal raha hai!`);
    console.log(`// Urdu Comment: Aap browser mein http://localhost:${PORT} open kar sakte hain`);
  });
}

startServer().catch((error) => {
  console.error('Server boot failed:', error);
});
