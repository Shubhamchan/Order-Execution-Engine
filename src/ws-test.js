import Fastify from "fastify";
import websocket from "@fastify/websocket";

const app = Fastify({ logger: true });

await app.register(websocket);

// Yahan 'socket' hi WebSocket instance hai (koi .socket nahi)
app.get("/ws", { websocket: true }, (socket, req) => {
  console.log("WS connected");

  // connect hote hi ek message bhejo
  socket.send("hello-from-server");

  socket.on("message", (msg) => {
    const text = msg.toString();
    console.log("WS message:", text);
    socket.send("echo: " + text);
  });

  socket.on("close", () => {
    console.log("WS closed");
  });

  socket.on("error", (err) => {
    console.error("WS error:", err);
  });
});

app.listen({ port: 4000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("WS test server listening on", address);
});
