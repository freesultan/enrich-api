import { RequestHandler } from 'express';
import { paymentMiddleware, Network } from 'x402-express';

const bypassMiddleware: RequestHandler = (_req, _res, next) => next();

export function buildX402(): RequestHandler {
  if (process.env.DEV_BYPASS === 'true') {
    console.warn('[x402] DEV_BYPASS=true — payment checks DISABLED (local dev only)');
    return bypassMiddleware;
  }

  if (!process.env.PAYMENT_ADDRESS) {
    throw new Error('PAYMENT_ADDRESS is not set in your .env.local');
  }
  if (!process.env.X402_FACILITATOR_URL) {
    throw new Error('X402_FACILITATOR_URL is not set in your .env.local');
  }

  console.log('[x402] Payment middleware ENABLED');
  return paymentMiddleware(
    process.env.PAYMENT_ADDRESS,
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
    { url: process.env.X402_FACILITATOR_URL }
  );
}
