import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.PG_URL,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      mint_in TEXT,
      mint_out TEXT,
      amount NUMERIC,
      status TEXT,
      chosen_dex TEXT,
      tx_hash TEXT,
      error TEXT
    );
  `);
}

export async function insertOrder(row) {
  const { id, mintIn, mintOut, amount } = row;
  await pool.query(
    `INSERT INTO orders(id, mint_in, mint_out, amount, status)
     VALUES($1,$2,$3,$4,$5)`,
    [id, mintIn, mintOut, amount, "pending"]
  );
}

export async function updateOrderStatus(id, status, extra = {}) {
  const { chosenDex = null, txHash = null, error = null } = extra;
  await pool.query(
    `UPDATE orders
     SET status = $2,
         chosen_dex = COALESCE($3, chosen_dex),
         tx_hash = COALESCE($4, tx_hash),
         error = COALESCE($5, error)
     WHERE id = $1`,
    [id, status, chosenDex, txHash, error]
  );
}
