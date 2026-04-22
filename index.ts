import express from 'express';
import { createPublicClient, createWalletClient, http, custom } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';

import { x402Facilitator } from '@x402/core/facilitator';
import { ExactEvmScheme } from '@x402/evm/exact/facilitator';
import { toFacilitatorEvmSigner } from '@x402/evm';

// --- Arc Testnet Setup ---
const arcTestnetDef = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.arc.network'] },
  },
  testnet: true,
});

// --- Initialize Agent Signer ---
const privateKey = (process.env.FACILITATOR_PRIVATE_KEY ||
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d') as `0x${string}`;

const facilitatorAccount = privateKeyToAccount(privateKey);
console.log(`[Startup] Initializing Arc Testnet Facilitator with Wallet: ${facilitatorAccount.address}`);

const publicClient = createPublicClient({ 
  chain: arcTestnetDef, 
  transport: http() 
});

const walletClient = createWalletClient({ 
  account: facilitatorAccount, 
  chain: arcTestnetDef, 
  transport: http() 
});

// Create the unified EVM Signer for the Facilitator Scheme
const facilitatorSigner = toFacilitatorEvmSigner(Object.assign({}, publicClient, walletClient, { address: facilitatorAccount.address }) as any);

// --- Setup x402 Facilitator ---
const facilitator = new x402Facilitator();

// Register the EVM Scheme for the Arc Testnet
facilitator.register('eip155:5042002', new ExactEvmScheme(facilitatorSigner));

// Optional: Add debugging hooks
facilitator.onBeforeVerify(async (context) => {
  console.log('[Facilitator] Incoming Verify Request payload:', context.paymentPayload);
});
facilitator.onBeforeSettle(async (context) => {
  console.log('[Facilitator] Incoming Settle Request payload:', context.paymentPayload);
});

// --- Express Server ---
const app = express();
app.use(express.json());

import * as crypto from 'crypto';

// 0. API Key Generation (Testnet)
app.get('/gen', (req, res) => {
  res.json({ apiKey: crypto.randomUUID() });
});

// 1. Return supported schemas/networks
app.get('/supported', (req, res) => {
  res.json(facilitator.getSupported());
});

// 2. Verification Endpoint
app.post('/verify', async (req, res) => {
  try {
    const paymentPayload = req.body?.paymentPayload;
    const paymentRequirements = req.body?.paymentRequirements;

    if (!paymentPayload || !paymentRequirements) {
      return res.status(400).json({ error: 'Missing paymentPayload or paymentRequirements array' });
    }

    const result = await facilitator.verify(paymentPayload, paymentRequirements);
    res.json(result);
  } catch (error: any) {
    console.error('[Verify] Error:', error);
    res.status(500).json({ isValid: false, invalidReason: error.message });
  }
});

// 3. Settlement Endpoint
app.post('/settle', async (req, res) => {
  try {
    const paymentPayload = req.body?.paymentPayload;
    const paymentRequirements = req.body?.paymentRequirements;

    if (!paymentPayload || !paymentRequirements) {
      return res.status(400).json({ error: 'Missing paymentPayload or paymentRequirements array' });
    }

    const result = await facilitator.settle(paymentPayload, paymentRequirements);
    res.json(result);
  } catch (error: any) {
    console.error('[Settle] Error:', error);
    res.status(500).json({ success: false, errorReason: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Open Arc Testnet x402 Facilitator running at:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`🔗 Network: Arc Testnet (eip155:5042002)`);
  console.log(`=========================================`);
});
