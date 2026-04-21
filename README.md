# Arc Testnet 402 Facilitator

This repository provides a custom, lightweight Facilitator implementation to support projects building on the Arc EVM Testnet using the x402 protocol framework. 

## Architectural Overview

Traditional x402 facilitators often rely on heavy infrastructure, such as OpenZeppelin Defender or similar relay networks. When dealing with new or unsupported Layer 2 networks, or rapidly changing testnets like Arc, relying on native relayers can create deployment bottlenecks or compatibility issues. 

We built this facilitator by directly utilizing the core `x402Facilitator` class exposed by `@x402/core`. Instead of proxying through a third-party relay middleware, this facilitator natively processes EVM signatures and directly broadcasts settlement parameters onto the Arc Testnet using `viem`. 

By decoupling the facilitator logic and running it via standard Express application logic, developers gain full control over the `paymentRequired` challenge payloads, the EIP-3009 transaction validations, and the subsequent on-chain settlements. 

## Technical Components

- **Facilitator Protocol**: Incorporates `@x402/core/facilitator` to expose the standard `/supported`, `/verify`, and `/settle` endpoints. 
- **EVM Scheme**: Uses the `ExactEvmScheme` to handle signature validations targeting the Arc chain ID (`eip155:5042002`).
- **Direct Broadcasting**: Integrates `viem` to directly settle verified challenges onto the Arc network. 
- **Standalone Middleware Integration**: Allows standard HTTP Node clients or user agents to negotiate 402 Payment Required challenges manually, sidestepping rigid middleware assumptions.

## Running the Facilitator

1. Install dependencies:
`npm install`

2. Configure environment variables (e.g. `RPC_URL`, standard private keys to fund the settlement relay).

3. Start the process:
`npm start`

You can then hook your clients up to `http://localhost:3000` to manually complete the 402 payment cycles against the Arc testnet.
