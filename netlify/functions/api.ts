import 'dotenv/config';
import express, { Router } from 'express';
import serverless from 'serverless-http';
import { buildX402 } from '../../src/middleware/payment';
import enrichRoutes from '../../src/routes/enrich';

const app = express();
const router = Router();

app.use(express.json({ limit: '50kb' }));

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

router.get('/.well-known/x402', (_req, res) => {
  res.json({
    version: 1,
    endpoints: [
      { path: '/v1/enrich',    price: '$0.05', network: process.env.NETWORK ?? 'base-sepolia' },
      { path: '/v1/summarize', price: '$0.02', network: process.env.NETWORK ?? 'base-sepolia' },
      { path: '/v1/reason',    price: '$0.10', network: process.env.NETWORK ?? 'base-sepolia' },
    ],
  });
});

app.use(buildX402());
app.use('/v1', enrichRoutes);
app.use('/', router);

export const handler = serverless(app);
