declare module 'x402-express' {
  import { RequestHandler } from 'express';

  export type Network =
    | 'base-mainnet'
    | 'base-sepolia'
    | 'ethereum-mainnet'
    | 'ethereum-sepolia';

  export interface RouteConfig {
    price: string;
    network: Network;
    description?: string;
  }

  export interface FacilitatorConfig {
    url: string;
  }

  export function paymentMiddleware(
    address: string,
    routes: Record<string, RouteConfig>,
    facilitator: FacilitatorConfig
  ): RequestHandler;
}
