import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleContextualize } from './src/server/contextualizeHandler.ts';
import { handleParseSemenLab } from './src/server/labParserHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Dev server and container reverse proxy must always use port 3000
const PORT = Number(process.env.APP_PORT || process.env.DEFAULT_APP_PORT || 3000);

const startTime = Date.now();

// In-memory rate limiter (ENG-5: 15 req/min per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 15;

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    res.setHeader('Retry-After', Math.ceil((entry.resetTime - now) / 1000));
    return res.status(429).json({
      error: 'Rate limit exceeded: maximum 15 requests per minute. Please try again shortly.',
    });
  }

  entry.count++;
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // ENG-8: Security Headers Middleware
  app.use((_req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com;"
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  // ENG-7: Enhanced Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Masar Amanah Health Screening Engine',
      algorithm_version: 'v1.4-AUA2021-WHO6-UAE',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      rulesCount: 11,
      zeroPiiMode: true,
      timestamp: new Date().toISOString(),
    });
  });

  // Stage 4: Stateless Agent Harness - Cultural Narrative Rephraser
  app.post('/api/contextualize', rateLimiter, async (req, res) => {
    try {
      const result = await handleContextualize(req.body);
      return res.json(result);
    } catch (err: any) {
      if (err?.name === 'ValidationError' || err?.statusCode === 400) {
        return res.status(400).json({ error: err.message });
      }
      console.error('Error in /api/contextualize:', (err as any)?.message || 'Internal screening engine error');
      return res.status(500).json({ error: err?.message || 'Internal screening engine error' });
    }
  });

  // PM-33: Ephemeral Multimodal Lab Report Vision Scanner
  app.post('/api/parse-semen-lab', rateLimiter, async (req, res) => {
    try {
      const result = await handleParseSemenLab(req.body);
      return res.json(result);
    } catch (err: any) {
      console.error('Error in /api/parse-semen-lab:', (err as any)?.message || 'Failed to extract lab parameters');
      return res.status(500).json({ error: 'Failed to extract lab parameters' });
    }
  });

  // Frontend integration: Vite middleware in dev, static files in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Masar Amanah Health] Server running on port ${PORT} (0.0.0.0)`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
