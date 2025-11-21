import { Connection, Keypair, Transaction } from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection(process.env.SOLANA_RPC, "confirmed");

export function loadKeypairFromEnv() {
  if (!process.env.WALLET_SECRET_KEY_JSON) {
    throw new Error("WALLET_SECRET_KEY_JSON missing");
  }
  const arr = JSON.parse(process.env.WALLET_SECRET_KEY_JSON);
  return Keypair.fromSecretKey(Uint8Array.from(arr));
}

export async function sendAndConfirm(tx) {
  const payer = loadKeypairFromEnv();
  tx.feePayer = payer.publicKey;

  const { blockhash } = await connection.getLatestBlockhash();
  tx.recentBlockhash = blockhash;

  tx.sign(payer);
  const raw = tx.serialize();
  const sig = await connection.sendRawTransaction(raw);
  const confirmation = await connection.confirmTransaction(sig, "confirmed");

  return { txHash: sig, confirmation };
}

// Helper to create an empty transaction (you'll append Raydium/Meteora instructions)
export function createEmptyTransaction() {
  return new Transaction();
}
