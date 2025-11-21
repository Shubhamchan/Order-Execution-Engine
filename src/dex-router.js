import { createEmptyTransaction } from "./solana-utils.js";
import { log } from "./logger.js";
export async function getQuotes(mintIn, mintOut, amount) {
  await new Promise((r) => setTimeout(r, 300));
  const raydium = {
    dex: "raydium",
    price: 1.02,
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
  return quoteA.price <= quoteB.price ? quoteA : quoteB;
}
export async function buildSwapTx({ chosenDex, mintIn, mintOut, amount }) {
  const tx = createEmptyTransaction();
  log("Building mock transaction for", chosenDex, { mintIn, mintOut, amount });
  return tx;
}
export async function getRaydiumQuoteReal(
  mintIn,
  mintOut,
  amount,
  slippageBps = 50
) {
  const host = process.env.RAYDIUM_API_HOST || "https://api.raydium.io";
  const url = new URL("/v2/main/quote", host); 
  url.searchParams.set("inputMint", mintIn);
  url.searchParams.set("outputMint", mintOut);
  url.searchParams.set("amount", amount);
  url.searchParams.set("slippageBps", slippageBps.toString());
  const res = await fetch(url.href);
  if (!res.ok) throw new Error(`Raydium quote error: ${res.statusText}`);
  const data = await res.json();
  return {
    dex: "raydium",
    price: data.outputAmount / amount,
    liquidity: data.liquidity || 0,
    raw: data,
  };
}
export async function buildRaydiumSwapTxFromApi(quoteData, userPubkey) {
  throw new Error("Implement Raydium Trade API tx building here based on docs");
}
