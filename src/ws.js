// orderId -> Set<ws>
const clients = new Map();

export function subscribe(ws, orderId) {
  if (!clients.has(orderId)) clients.set(orderId, new Set());
  const set = clients.get(orderId);
  set.add(ws);

  ws.on("close", () => {
    set.delete(ws);
    if (set.size === 0) clients.delete(orderId);
  });
}

export function publishStatus(orderId, payload) {
  const set = clients.get(orderId);
  if (!set) return;
  const msg = JSON.stringify(payload);
  for (const ws of set) {
    try { ws.send(msg); } catch (e) { /* ignore */ }
  }
}
