# enrich-api

Crypto-paywalled AI text enrichment API built with [x402](https://x402.org) + [DeepSeek](https://platform.deepseek.com).

## Endpoints

| Method | Path | Price | Description |
|--------|------|-------|-------------|
| GET | `/health` | free | Health check |
| GET | `/.well-known/x402` | free | Payment discovery |
| POST | `/v1/enrich` | $0.05 USDC | Summary + keywords + sentiment |
| POST | `/v1/summarize` | $0.02 USDC | Summary only |
| POST | `/v1/reason` | $0.10 USDC | DeepSeek-R1 chain-of-thought |

## Payment flow

```
Client  →  POST /v1/enrich
Server  →  402 Payment Required  (amount + wallet + network)
Client  →  Signs EIP-712 USDC transfer, retries with X-PAYMENT header
Server  →  Verifies via x402.org/facilitator → runs DeepSeek → returns result
```

## Setup

```bash
npm install
cp .env.example .env.local
# fill in your keys
npm run dev
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `PAYMENT_ADDRESS` | Your EVM wallet address (receives USDC) |
| `DEEPSEEK_API_KEY` | From https://platform.deepseek.com/api_keys (free $5 credits) |
| `X402_FACILITATOR_URL` | `https://x402.org/facilitator` |
| `NETWORK` | `base-sepolia` (testnet) or `base-mainnet` |

## Deploy to Vercel

```bash
npx vercel --prod
# then set the 4 env vars in Vercel dashboard → Settings → Environment Variables
```

## Test

```bash
# No payment → expect 402
curl -X POST https://your-app.vercel.app/v1/enrich \
  -H "Content-Type: application/json" \
  -d '{"text": "The rise of AI is transforming every industry."}'

# Auto-pay with x402 client
npx x402-client --wallet-key YOUR_PRIVATE_KEY \
  --url https://your-app.vercel.app/v1/enrich \
  --method POST \
  --body '{"text":"The rise of AI is transforming every industry."}'
```

## Get API keys

- **DeepSeek** (free $5 credits, no card): https://platform.deepseek.com/api_keys
- **EVM Wallet**: https://www.coinbase.com/wallet
- **Testnet USDC**: https://faucet.base.org
