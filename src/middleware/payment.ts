import { paymentMiddleware, Network } from 'x402-express';

export const x402 = paymentMiddleware(
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
