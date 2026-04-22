# PayPer Card: Hosted x402 Facilitator Service

The standalone **Hosted x402 Facilitator** operates as the core settlement engine bridging on-chain native cryptocurrency execution logic with any off-chain web application, such as our fiat-partner application [PayPer Card Main Repo].

Just like Coinbase Developer Platform (CDP)’s Facilitator, our x402 Agent Facilitator offers:

*   **Native & ERC-20 Payments on Arc Testnet (and EVM Networks):** Supports Native `USDC` using precise 18-decimal scaling over high-speed networks. Out of the box, it seamlessly processes EIP-3009 abstraction logic as well as raw native EVM transactions using Viem execution loops.
*   **Zero Infrastructure For Merchants:** Using our facilitator allows AI developers and sellers to quickly integrate "One-Click AI Payments" without managing complex RPC nodes or blockchain infrastructure, while providing a predictable and low-cost experience for buyers.
*   **High Performance Settlement:** Payments are submitted natively with fast confirmation block times, and high throughput.
*   **Built-in Loop Protection:** The system inherently verifies transaction receipts via Arc Testnet indexers before issuing standard API requests to off-chain systems.

### Pricing

Our Custom x402 Agent Facilitator operates on a pay-as-you-go pricing model with a generous free tier for developer agents:

| Tier | Monthly Transactions (Per Agent) | Cost per Transaction |
| ---- | -------------------------------- | -------------------- |
| **Free** | Up to 1,000 | $0.00 |
| **Usage-based** | Above 1,000 | $0.001 |

---

## Facilitator Documentation & Authentication

The PayPer Card Facilitator exposes standard x402 `/verify`, `/settle`, and `/supported` endpoints and is fully compatible with any HTTP clients using the standard `@x402/core` modules.

### Key Information

| | |
|---|---|
| **Facilitator URL** | `https://your-render-url.onrender.com` |
| **Authentication** | `Bearer YOUR_API_KEY` (Required for Hosted Endpoints) |
| **x402 Version** | `v2` |
| **x402 Scheme** | `exact` |
| **Supported Assets** | Native EVM Gas (`USDC` on Arc) or ERC-20 / EIP-3009 Tokens |

### 1. Configure the Facilitator URL with Authentication

To utilize the facilitator securely for your AI Agents, pass an `API_KEY` (generated via your developer dashboard) as a standard Bearer token inside the `createAuthHeaders` mapping.

Here is an example using `@x402/express` or standard x402 Node setups:

```typescript
import { HTTPFacilitatorClient } from "@x402/core/server";

const API_KEY = process.env.PAYPER_CARD_API_KEY;

const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://your-render-url.onrender.com",
  createAuthHeaders: async () => {
    const headers = { Authorization: `Bearer ${API_KEY}` };
    return {
      verify: headers,
      settle: headers,
      supported: headers
    };
  },
});
```

### 2. Supported Pricing Formats

The Facilitator supports accepting payments in both Human-Readable strings or Explicit Decimal Object mappings.

#### Human-Readable
For standard agents performing e-commerce, pass a human readable price. The x402 SDK parses this natively to `18 decimals` mapped to the Arc Network.
```json
"price": "$15.00"
```

#### Explicit Asset Object Mapping
If the agent requests custom multi-hop routing, specify exactly the base units:
```json
"price": {
  "asset": "native",
  "amount": "15000000000000000000"
}
```

## Quickstart (Render Hosting / Deployment)

If you wish to self-host or bypass our public API rates, you can easily spin up your own secure facilitator stack:

1. Connect this repository to your **Render** dashboard via GitHub.
2. Select **Web Service** (or use the included `render.yaml` Blueprint).
3. Use the following deployment configs:
   * **Set Build Command:** `npm install && npx tsc`
   * **Set Start Command:** `npm start`
   * **Environment Variables:**
     ```env
     PORT=3000
     USDC_ISSUER=native
     CLIENT_SECRET=0x<your_server_private_key>
     merchant_public_key=0x<merchant_destination_address>
     CIRCLE_API_KEY=<optional>
     CIRCLE_ENTITY_SECRET=<optional>
     LITHIC_API_KEY=<sandbox_key>
     PAYPER_CARD_API_KEY=<secure_api_key_to_protect_hosted_endpoints>
     ```

*Built on [Arc Network](https://arc.network/) & Designed against the [x402 Spec](https://x402.org)*.
