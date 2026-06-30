import { RequestHandler } from 'express';
import { paymentMiddleware, Network } from 'x402-express';

// Set DEV_BYPASS=true in .env.local to skip payment checks locally
const bypassMiddleware: RequestHandler = (_req, _res, next) => next();

function buildX402(): RequestHandler {
  if (process.env.DEV_BYPASS === 'true') {
    console.warn('[x402] DEV_BYPASS=true — payment checks disabled (local dev only)');
    return bypassMiddleware;
  }

  return paymentMiddleware(
    process.env.PAYMENT_ADDRESS!,
    {
      'POST /v1/enrich': {
        price: '$0.05',
        network: (process.env.NETWORK as Network) ?? 'base-sepolia',
        description: 'AI text enrichment: summary + keywords + sentiment',
      },
      'POST /v1/summarize': {
        price: '$0.02',
        network: (process.env.NETWORK as Network) ?? 'base-sepolia',
        description: 'AI text summarization only',
      },
      'POST /v1/reason': {
        price: '$0.10',
        network: (process.env.NETWORK as Network) ?? 'base-sepolia',
        description: 'DeepSeek-R1 chain-of-thought reasoning',
      },
    },
    { url: process.env.X402_FACILITATOR_URL! }
  );
}

export const x402 = buildX402();
