import { RequestHandler } from 'express';
import { paymentMiddleware, Network } from 'x402-express';

const bypass: RequestHandler = (_req, _res, next) => next();

export function buildX402(): RequestHandler {
  if (process.env.DEV_BYPASS === 'true') {
    console.warn('[x402] DEV_BYPASS — payments skipped');
    return bypass;
  }
  return paymentMiddleware(
    process.env.PAYMENT_ADDRESS!,
    {
      'POST /v1/enrich':    { price: '$0.05', network: (process.env.NETWORK as Network) ?? 'base-sepolia' },
      'POST /v1/summarize': { price: '$0.02', network: (process.env.NETWORK as Network) ?? 'base-sepolia' },
      'POST /v1/reason':    { price: '$0.10', network: (process.env.NETWORK as Network) ?? 'base-sepolia' },
    },
    { url: process.env.X402_FACILITATOR_URL ?? 'https://x402.org/facilitator' }
  );
}
