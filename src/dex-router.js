// ❌ NO "node-fetch" import – Node 18+ has global fetch
import { createEmptyTransaction } from "./solana-utils.js";
import { log } from "./logger.js";

// ===== MOCK IMPLEMENTATION (works immediately) =====

export async function getQuotes(mintIn, mintOut, amount) {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 300));

  // Fake slightly different prices and liquidity
  const raydium = {
    dex: "raydium",
    price: 1.02, // pretend 1 tokenOut per tokenIn
    liquidity: 100000,
  };

  const meteora = {
    dex: "meteora",
    price: 1.05,
    liquidity: 80000,
  };

  return { raydium, meteora };
}

export function chooseBest(quoteA, quoteB) {
  // lower price is better (assuming we are buying output)
  return quoteA.price <= quoteB.price ? quoteA : quoteB;
}

// Build a mock transaction. Replace later with real Raydium/Meteora instructions.
export async function buildSwapTx({ chosenDex, mintIn, mintOut, amount }) {
  const tx = createEmptyTransaction();
  // TODO: append Raydium or Meteora swap instructions based on chosenDex
  // For now, empty tx (just to prove flow).
  log("Building mock transaction for", chosenDex, { mintIn, mintOut, amount });
  return tx;
}

// ===== REAL RAYDIUM HOOK (for later) =====

// Example function: call Raydium Trade API for a *real* quote.
// You can use this inside getQuotes() instead of mock raydium.
export async function getRaydiumQuoteReal(
  mintIn,
  mintOut,
  amount,
  slippageBps = 50
) {
  const host = process.env.RAYDIUM_API_HOST || "https://api.raydium.io";
  const url = new URL("/v2/main/quote", host); // path may differ, check docs
  url.searchParams.set("inputMint", mintIn);
  url.searchParams.set("outputMint", mintOut);
  url.searchParams.set("amount", amount); // amount in smallest units
  url.searchParams.set("slippageBps", slippageBps.toString());

  // Node 18+ has global fetch available
  const res = await fetch(url.href);
  if (!res.ok) throw new Error(`Raydium quote error: ${res.statusText}`);
  const data = await res.json();

  // You will map data to { price, liquidity, ... }
  return {
    dex: "raydium",
    price: data.outputAmount / amount,
    liquidity: data.liquidity || 0,
    raw: data,
  };
}

// Example function: build Raydium tx from Trade API swap response
export async function buildRaydiumSwapTxFromApi(quoteData, userPubkey) {
  // Usually Raydium API returns a base64-encoded transaction or transaction data
  // You would decode it to a Transaction object and sign.
  // Pseudocode (depends on exact API format):

  // const rawTx = Buffer.from(quoteData.swapTransaction, "base64");
  // const tx = Transaction.from(rawTx);
  // return tx;

  throw new Error("Implement Raydium Trade API tx building here based on docs");
}
