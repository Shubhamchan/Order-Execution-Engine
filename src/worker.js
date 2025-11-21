import { Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";
import { getQuotes, chooseBest, buildSwapTx } from "./dex-router.js";
import { sendAndConfirm } from "./solana-utils.js";
import { publishStatus } from "./ws.js";
import { log } from "./logger.js";
import { updateOrderStatus } from "./db.js";

dotenv.config();
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const worker = new Worker(
  "orders",
  async (job) => {
    const { orderId, mintIn, mintOut, amount, slippageBps = 50 } = job.data;
    publishStatus(orderId, { status: "pending" });
    await updateOrderStatus(orderId, "pending");

    try {
      publishStatus(orderId, { status: "routing" });

      const quotes = await getQuotes(mintIn, mintOut, amount);
      const chosen = chooseBest(quotes.raydium, quotes.meteora);

      log("Routing decision", { orderId, quotes, chosen });
      publishStatus(orderId, { status: "routing", chosenDex: chosen.dex, quotes });
      await updateOrderStatus(orderId, "routing", { chosenDex: chosen.dex });
      publishStatus(orderId, { status: "building" });

      const tx = await buildSwapTx({
        chosenDex: chosen.dex,
        mintIn,
        mintOut,
        amount,
        slippageBps,
        quote: chosen,
      });
      publishStatus(orderId, { status: "submitted" });
      await updateOrderStatus(orderId, "submitted");
      const { txHash } = await sendAndConfirm(tx);
      publishStatus(orderId, {
        status: "confirmed",
        txHash,
        finalPrice: chosen.price,
      });
      await updateOrderStatus(orderId, "confirmed", {
        txHash,
      });

      return { txHash };
    } catch (err) {
      log("Order failed", orderId, err.message);
      publishStatus(orderId, {
        status: "failed",
        error: err.message,
      });
      await updateOrderStatus(orderId, "failed", { error: err.message });
      throw err;
    }
  },
  {
    connection,
    concurrency: 10,
  }
);
worker.on("failed", (job, err) => {
  log("Job permanently failed", job.id, err.message);
});
