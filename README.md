# Built on Arc x402 Facilitator

The Built on Arc x402 Facilitator is a production-ready payment facilitator for the [x402 protocol](https://x402.org/) on the Arc Testnet and EVM networks. It handles payment verification and settlement so that AI agents, developers, and sellers can accept per-request payments without running their own blockchain infrastructure.

It exposes the standard x402 `/verify`, `/settle`, and `/supported` endpoints and is fully compatible with any HTTP clients using the standard `@x402/core` modules.

## Key information

|  |  |
| --- | --- |
| Facilitator URL | `https://your-render-url.onrender.com` |
| API key generation | [Generate testnet key](https://your-render-url.onrender.com/gen) |
| x402 version | v2 |
| x402 scheme | exact |
| Supported assets | Native EVM Gas (`USDC` on Arc) or ERC-20 / EIP-3009 Tokens |

Verify endpoint availability:
```sh
curl -I https://your-render-url.onrender.com/supported
# Expected: HTTP 200 with supported assets/networks
```

## Get started

### 1. Generate an API key

Generate an API key to authenticate your server with the facilitator:

*   **Testnet Hosted API:** `GET https://your-render-url.onrender.com/gen` (No authentication required on testnet)

When visiting or curling `/gen`, it will return the API key like this:
```json
{"apiKey":"21d44887-28ed-43ab-abce-c2352fd24ad0"}
```

Store the generated API key securely. It cannot be retrieved after creation.

### 2. Configure the facilitator URL

Use the facilitator URL in your x402 server configuration. Here's an example using `@x402/express` or standard x402 Node setups:

```typescript
import express from "express";
import { HTTPFacilitatorClient } from "@x402/core/server";

const API_KEY = "YOUR_API_KEY_HERE";

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

const app = express();
// ... (continue implementing x402ResourceServer using facilitatorClient)
```

#### Pricing formats

The `price` field supports two formats:

**Human-readable** — A dollar-string like `"$0.001"`. The x402 SDK converts this natively to the equivalent on-chain amount and maps to 18 decimals on the Arc Network.
```json
"price": "$0.001"
```

**Explicit asset and amount** — Specify the on-chain asset contract address (or `native`) and the amount in base units (the smallest unit as defined by the token's `decimals`; for example, if Native USDC on Arc has 18 decimals, then 1 USDC = 1,000,000,000,000,000,000 base units).
```json
"price": {
  "asset": "native",
  "amount": "1000000000000000000"
}
```

Use the explicit format when you want to accept a specific asset other than native USDC, or when you need precise control over the on-chain base units.

### 3. Accept payments

With the middleware in place, any request to a protected route will trigger the x402 payment flow:

1. The client requests the protected agent resource via HTTP.
2. The server responds with `402 Payment Required` and a `PAYMENT-REQUIRED` header containing the payment instructions (price, network, facilitator URL).
3. The client application signs an authorization entry / standard EVM transaction and resubmits the request with a `PAYMENT-SIGNATURE` header.
4. The facilitator verifies the signature and settles the payment on-chain via Viem logic execution.
5. The server returns the requested resource along with a `PAYMENT-RESPONSE` header confirming settlement.

---

## How it works

The Built on Arc facilitator leverages our custom high-speed execution loop built with modern Viem abstractions. 

### Verification

When a payment is received, the facilitator:
1. Validates the x402 protocol version, exact v2 scheme, and supported EVM networks.
2. Simulates the transaction payload to confirm validity.
3. Checks the requested amount and the recipient match the defined payment requirements.
4. Verifies the authorization (signatures/EIP-3009) is properly signed by the payer against the Arc testnet indexer.

### Settlement

After verification, the facilitator securely broadcasts the signed transaction payload directly on-chain and returns confirmation block data to the requesting server.

---

## Self-hosting & Deployment

Because this is an independent standalone settlement engine utilizing the x402 architecture, it does not require any application-specific secrets—only an EVM wallet private key to act as the relayer/gas sponsor for settling transactions.

If you want to run your own instance of the facilitator instead of using the hosted service, you can deploy it directly or via Render using our `render.yaml`.

1. Connect this repository to your **Render** dashboard via GitHub.
2. Select **Web Service** (or use the included `render.yaml` Blueprint).
3. Use the following deployment configs:
   * **Set Build Command:** `npm install && npx tsc`
   * **Set Start Command:** `npm start`
   * **Environment Variables:**
     ```env
     PORT=3000
     FACILITATOR_PRIVATE_KEY=0x<your_server_private_key>
     ```

*Built on [Arc Network](https://arc.network/) & Designed against the [x402 Spec](https://x402.org/)*.
