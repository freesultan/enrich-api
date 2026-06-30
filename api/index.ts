import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local first, fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from 'express';
import { x402 } from '../src/middleware/payment';
import enrichRoutes from '../src/routes/enrich';

const app = express();

app.use(express.json({ limit: '50kb' }));

// Free endpoints
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    endpoints: ['/v1/enrich', '/v1/summarize', '/v1/reason'],
  });
});

app.get('/.well-known/x402', (_req, res) => {
  res.json({
    version: 1,
    endpoints: [
      { path: '/v1/enrich',    price: '$0.05', network: process.env.NETWORK ?? 'base-sepolia' },
      { path: '/v1/summarize', price: '$0.02', network: process.env.NETWORK ?? 'base-sepolia' },
      { path: '/v1/reason',    price: '$0.10', network: process.env.NETWORK ?? 'base-sepolia' },
    ],
  });
});

// Paid endpoints — x402 payment gate applied before routes
app.use('/v1', x402);
app.use('/v1', enrichRoutes);

// Required for Vercel serverless
export default app;

// Local dev only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}
