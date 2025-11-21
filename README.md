# Order Execution Engine (Solana, Fastify, BullMQ, WebSocket)

This project implements a real-time **Order Execution Engine** that processes a chosen order type  
(**Market / Limit / Sniper**) with:

- Live WebSocket status updates  
- DEX Routing (Raydium + Meteora)  
- BullMQ queue system  
- PostgreSQL for persistent order history  
- Redis for active order state  
- Optional Solana Devnet execution  

---

##  Why I Chose This Order Type

> **I chose Market Order** because it is the simplest and fastest execution model.  
It allows me to focus on the project architecture — routing, queues, workers, WebSockets — without adding condition-based logic.  
The architecture is modular, so adding **Limit** or **Sniper** orders later only requires adding pre-check conditions.

---

#  Features

- Real-time WebSocket order status  
- DEX Price Comparison (Raydium + Meteora)  
- Queue processing at scale (100 orders/min)  
- Exponential retry system  
- Full order history in PostgreSQL  
- Redis for active job tracking  
- Solana devnet-ready  
- Unit tests for routing + queue + websocket  
- Clean architecture & scalability  

---

# Architecture

```
Client
  ↓ POST /api/orders/execute
Fastify API Server
  ↓
PostgreSQL (save order)
  ↓
BullMQ Queue (Redis)
  ↓
Worker
  ↓
DEX Router (Raydium/Meteora)
  ↓
Solana Tx (optional)
  ↓
WebSocket notify client
```

Order lifecycle statuses:

- `pending`
- `routing`
- `building`
- `submitted`
- `confirmed`
- `failed`

---

#  Project Structure

```
PlacementProject/
│
├── src/
│   ├── server.js          # Fastify + WebSocket
│   ├── worker.js          # Queue worker
│   ├── queue.js           # Redis connection + queue
│   ├── dex-router.js      # Raydium/Meteora routing
│   ├── ws.js              # WebSocket subscriptions
│   ├── db.js              # PostgreSQL helper
│   ├── solana-utils.js    # Solana RPC + Tx builder
|   ├── ws-test.js         # Simple WebSocket echo tester
│   ├── logger.js          # Logging utility
│   └── test/              # Routing, WS, Queue tests
│
├── .env                   # Environment variables (ignored)
├── .gitignore
├── package.json
└── README.md
```

---

# Environment Variables (.env)

```
PORT=3000

# PostgreSQL
PG_URL=postgres://postgres:password@127.0.0.1:5432/orderdb

# Redis
REDIS_URL=redis://127.0.0.1:6379

# Solana
SOLANA_RPC=https://api.devnet.solana.com
WALLET_PRIVATE_KEY=[1,2,3,...]
```

---

# How to Run

### 1. Start Server
```bash
npm run start
```

### 2. Start Worker (new terminal)
```bash
npm run worker
```
### 3. web socket (new terminal)
```bash
node ws-test.js
```

### 4. Test API

POST → `http://localhost:3000/api/orders/execute`

```json
{
  "mintIn": "So111111111111...",
  "mintOut": "Es9vMF....",
  "amount": "1000000"
}
```

Response:
```json
{
  "orderId": "xxxx-xxxx-xxxx"
}
```

---

# WebSocket Usage

Connect:
```
ws://localhost:3000/ws
```

Subscribe:
```json
{
  "action": "subscribe",
  "orderId": "<your-order-id>"
}
```

Receive:
```
pending → routing → building → submitted → confirmed
```

---

#  Tests

```
npm test
```

Includes:
- Routing tests  
- Queue behavior  
- WebSocket messaging  
- API integration  

---

#  Demo Video

(Upload a 1–2 minute demo showing:  
✔ order creation  
✔ multiple orders  
✔ WebSocket updates  
✔ routing logs  
✔ worker processing)

YouTube link:

```
[https://youtu.be/your-demo-video](https://youtu.be/S8UJAEU-siQ)
```

---

#  Author  
**Shubham Kumar**  
GitHub: https://github.com/Shubhamchan/Order-Execution-Engine.git

---
