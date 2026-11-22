# Quick Commerce & Delivery Tracking System

Customers place orders, delivery partners accept them and update the status,
and everyone sees changes live over Socket.IO.

- **backend/**: Express + Socket.IO + MongoDB (Mongoose) REST API on **port 5000**
- **frontend/**: Next.js 15 + React 19 + Tailwind CSS v4 UI on **port 3000**

## Project structure

```
Quick-Commerce-and-Delivery-tracking-system/
├── package.json              # root scripts: run backend + frontend together
├── README.md
├── backend/
│   ├── package.json
│   ├── .env.example          # copy to .env
│   └── src/
│       ├── server.js         # starts HTTP server + Socket.IO
│       ├── app.js            # Express app: CORS, JSON, routes, errors
│       ├── config/
│       │   ├── env.js        # loads and checks .env
│       │   └── db.js         # MongoDB connection
│       ├── models/
│       │   ├── User.js
│       │   ├── Order.js
│       │   └── Product.js
│       ├── services/
│       │   └── stockService.js     # reserve/restore stock
│       ├── seed/
│       │   ├── products.js         # sample catalogue
│       │   └── seed.js             # npm run seed
│       ├── controllers/
│       │   ├── authController.js   # register, login, me
│       │   ├── orderController.js  # create, list, history, update status
│       │   └── productController.js
│       ├── routes/
│       │   ├── authRoutes.js       # /api/auth/*
│       │   ├── orderRoutes.js      # /api/orders/*
│       │   └── productRoutes.js    # /api/products/*
│       ├── middleware/
│       │   ├── auth.js             # JWT check + role guard
│       │   └── errorHandler.js     # async wrapper, 404, 500
│       └── socket/
│           └── index.js            # Socket.IO setup + orderUpdate events
├── frontend/
│   ├── package.json
│   ├── .env.example          # copy to .env.local
│   └── src/
│       ├── app/              # pages (App Router)
│       │   ├── layout.js, globals.css
│       │   ├── page.js       # login
│       │   ├── register/  customer/  delivery/  history/
│       │   ├── shop/  cart/
│       ├── components/
│       │   ├── Navbar.js  AuthCard.js  PageHeader.js
│       │   ├── OrderForm.js  DeliveryActions.js
│       │   ├── ProductCard.js  ProductImage.js  QuantityStepper.js
│       │   └── ui/           # StatusBadge, OrderCard, Alert, Spinner, LoadingState, EmptyState
│       ├── context/
│       │   └── CartContext.js  # cart state (localStorage)
│       └── lib/
│           ├── format.js     # price formatting
│           ├── api.js        # axios client for the backend (NEXT_PUBLIC_API_URL)
│           └── useSocket.js  # Socket.IO client hook
└── legacy-nextjs/            # old single-app version (Next API routes), kept for reference
```

## Requirements

- **Node.js 20 or 22 (LTS).** Newer versions (e.g. Node 26) break `jsonwebtoken`.
- **MongoDB** running locally on `127.0.0.1:27017` (or any MongoDB URI).

## Setup

```bash
# 1. Install dependencies (root, backend, frontend)
npm run install:all

# 2. Configure the backend
cp backend/.env.example backend/.env        # then set JWT_SECRET to a long random string

# 3. Configure the frontend
cp frontend/.env.example frontend/.env.local
```

`backend/.env`

| Variable      | Example                                      |
|---------------|----------------------------------------------|
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/quick-commerce`   |
| `JWT_SECRET`  | long random string                           |
| `PORT`        | `5000`                                       |
| `CLIENT_URL`  | `http://localhost:3000` (CORS + Socket.IO)   |

`frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000`

## Run

```bash
npm run dev              # backend (5000) + frontend (3000) together
# or separately
npm run dev:backend
npm run dev:frontend
```

Open http://localhost:3000.

Production: `npm run build` then `npm start`.

## Features

### 1. Product catalogue & cart
- 20 sample grocery products: run `npm run seed --prefix backend` once. It only adds products that are missing; add `-- --reset` to replace them all.
- **Shop** (`/shop`): search by name, filter by category, add to cart, change quantity.
- **Cart** (`/cart`): saved in the browser (localStorage). Checkout creates one order with several items and a total.
- Stock goes down when an order is placed. If an item runs out, checkout is refused with "Only N left of …".
- The custom one-line order form is still on the customer dashboard.

## API (backend, all JSON)

| Method | Path                            | Auth          | Description                                     |
|--------|---------------------------------|---------------|-------------------------------------------------|
| GET    | `/api/health`                   | none          | Health check                                    |
| GET    | `/api/products?q=&category=`    | none          | List or search products                         |
| GET    | `/api/products/categories`      | none          | Category names                                  |
| GET    | `/api/products/:id`             | none          | One product                                     |
| POST   | `/api/auth/register`            | none          | `{name,email,password,role}` → `{token}`        |
| POST   | `/api/auth/login`               | none          | `{email,password}` → `{token}`                  |
| GET    | `/api/auth/me`                  | Bearer        | Current user                                    |
| POST   | `/api/orders`                   | customer      | `{items:[{productId,quantity}],location}` or `{product,quantity,location}` → order |
| GET    | `/api/orders/customer/:id`      | same user     | Customer's orders                               |
| GET    | `/api/orders/pending`           | delivery      | Pending orders + partner's undelivered orders   |
| PUT    | `/api/orders/:id/status`        | delivery      | `{status}`: Accepted / Out for Delivery / Delivered |
| GET    | `/api/orders/history/:userId`   | same user     | All orders for the user                         |

Socket.IO event `orderUpdate` → `{ orderId, status }` is emitted on create and status change.
