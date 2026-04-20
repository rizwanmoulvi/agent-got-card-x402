# Arc Testnet x402 Facilitator

This is an open-source, reference implementation of an x402 Facilitator specifically configured for the **Arc Testnet**. Resource Servers can use this service to verify and settle HTTP 402 AI Agent payments dynamically on the EVM natively without worrying about smart-contract integration locally.

## Why use a Facilitator?

The facilitator is a service that:
1. **Verifies** payment payloads submitted by agent clients.
2. **Settles** payments on the Arc blockchain on behalf of servers.

By using this facilitator, servers do not need to maintain direct blockchain connectivity, manage gas, or implement payment verification logic themselves.

## How to run locally

### 1. Configure the Environment
Ensure you have the following environment variables (or supply them in an `.env` file):

```env
FACILITATOR_PRIVATE_KEY=0x...
PORT=4000
```
This wallet will issue Settle operations on the Arc network, so it should be funded with some native Arc tokens for gas if you use on-chain settlement flows.

### 2. Start the Facilitator
```bash
npm install
npx tsx facilitator.ts
```

## Endpoints Exposed

### `GET /supported`
Returns the schemas, networks, and extensions supported by this facilitator.

### `POST /verify`
**Body:**
```json
{
  "paymentPayload": { ... },
  "paymentRequirements": { ... }
}
```
**Response:**
Returns `{ isValid: true, payer: "..." }` or `{ isValid: false, invalidReason: "..." }`.

### `POST /settle`
**Body:**
```json
{
  "paymentPayload": { ... },
  "paymentRequirements": { ... }
}
```
**Response:**
Returns `{ success: true, transactionId: "..." }` or settlement failure details.
