import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express from 'express';
import { buildX402 } from '../src/middleware/payment';
import enrichRoutes from '../src/routes/enrich';

const app = express();
app.use(express.json({ limit: '50kb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
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

// Mount x402 at root so it sees the FULL path (e.g. "POST /v1/enrich")
app.use(buildX402());
app.use('/v1', enrichRoutes);

export default app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
}
