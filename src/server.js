import Fastify from "fastify";
import websocket from "@fastify/websocket";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { orderQueue } from "./queue.js";
import { subscribe } from "./ws.js";
import { initDb, insertOrder } from "./db.js";
import { log } from "./logger.js";

dotenv.config();

const fastify = Fastify({ logger: false });
await fastify.register(websocket);
await initDb();
fastify.post("/api/orders/execute", async (req, reply) => {
  const { mintIn, mintOut, amount } = req.body || {};

  if (!mintIn || !mintOut || !amount) {
    return reply.code(400).send({ error: "mintIn, mintOut, amount required" });
  }

  const orderId = uuidv4();
  await insertOrder({ id: orderId, mintIn, mintOut, amount });

  await orderQueue.add(
    "execute-order",
    { orderId, mintIn, mintOut, amount },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    }
  );

  log("Order accepted", orderId);
  return reply.send({ orderId });
});
fastify.get("/ws", { websocket: true }, (connection, req) => {
  const ws = connection.socket;
  console.log("WS connected");
  ws.send(JSON.stringify({ status: "ws_connected" }));

  ws.on("message", (msg) => {
    const text = msg.toString();
    console.log("WS message raw:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      ws.send(
        JSON.stringify({
          status: "received_plain",
          raw: text,
        })
      );
      return;
    }
    if (data.action === "subscribe" && data.orderId) {
      subscribe(ws, data.orderId);
      ws.send(
        JSON.stringify({
          status: "subscribed",
          orderId: data.orderId,
        })
      );
    } else {
      ws.send(
        JSON.stringify({
          status: "unknown_action",
          data,
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("WS closed");
  });

  ws.on("error", (err) => {
    console.error("WS error:", err);
  });
});

const port = process.env.PORT || 3000;
fastify.listen({ port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Server listening on", address);
});
