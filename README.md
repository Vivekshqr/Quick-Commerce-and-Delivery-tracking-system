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
│       │   ├── seed.js             # npm run seed
│       │   └── seedAdmin.js        # npm run seed:admin
│       ├── controllers/
│       │   ├── authController.js   # register, login, me
│       │   ├── orderController.js  # create, list, history, update status
│       │   ├── productController.js
│       │   ├── addressController.js
│       │   └── adminController.js  # stats, all orders, assign, product CRUD
│       ├── routes/
│       │   ├── authRoutes.js       # /api/auth/*
│       │   ├── orderRoutes.js      # /api/orders/*
│       │   ├── productRoutes.js    # /api/products/*
│       │   ├── addressRoutes.js    # /api/addresses/*
│       │   └── adminRoutes.js      # /api/admin/* (admin only)
│       ├── middleware/
│       │   ├── auth.js             # JWT check + role guard
│       │   └── errorHandler.js     # async wrapper, 404, 500
│       └── socket/
│           ├── index.js            # Socket.IO setup, auth, orderUpdate events
│           └── trackingHandlers.js # live location rooms
├── frontend/
│   ├── package.json
│   ├── .env.example          # copy to .env.local
│   └── src/
│       ├── app/              # pages (App Router)
│       │   ├── layout.js, globals.css
│       │   ├── page.js       # login
│       │   ├── register/  customer/  delivery/  history/
│       │   ├── shop/  cart/  addresses/
│       │   ├── admin/        # admin dashboard
│       │   ├── track/[id]/   # customer live tracking
│       │   ├── delivery/[id]/ # partner route + share location / simulate
│       ├── components/
│       │   ├── Navbar.js  AuthCard.js  PageHeader.js
│       │   ├── OrderForm.js  DeliveryActions.js
│       │   ├── ProductCard.js  ProductImage.js  QuantityStepper.js
│       │   ├── AddressForm.js  AddressSelector.js
│       │   ├── TrackingStats.js
│       │   ├── admin/        # StatsOverview, BarChart, AdminOrders, AdminProducts, ProductFormModal
│       │   ├── map/          # Leaflet maps (LocationPickerMap, TrackingMap, icons)
│       │   └── ui/           # StatusBadge, OrderCard, Alert, Spinner, LoadingState, EmptyState
│       ├── context/
│       │   └── CartContext.js  # cart state (localStorage)
│       └── lib/
│           ├── format.js     # price formatting
│           ├── geocode.js    # OpenStreetMap Nominatim search / reverse
│           ├── geo.js        # distance, ETA, simulated route
│           ├── roles.js      # home page per role
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

### 2. Address & location picker
- **Addresses** (`/addresses`): save up to 10 addresses per user (Home/Work/Other), set a default, remove.
- Pick the exact point on an **OpenStreetMap** map (Leaflet): click the map, drag the pin, search a place, or press **Use my location**. Clicking the map fills in the address text automatically (free OpenStreetMap Nominatim lookup, no API key).
- At checkout (`/cart`) pick a saved address or add a new one on the map. The order stores the address text plus `locationCoords {lat,lng}`, and the order card links to the spot on the map.

### 3. Live map tracking
- When an order is **Accepted**, the delivery partner opens **Open route & share location** (`/delivery/<orderId>`) and taps **Start delivery**. That sets the order to *Out for Delivery*.
- **Share my live location** sends the browser's GPS position (`navigator.geolocation.watchPosition`) to the backend over Socket.IO. The partner has to allow location access in the browser.
- **Simulate route** (for testing on a laptop without GPS) drives a fake rider from about 3 km away to the delivery address, sending an update every 1.5 s.
- The customer taps **Track live** on the order (`/track/<orderId>`) and sees the rider marker move on the map, plus distance, a simple ETA (straight-line distance × 1.3 at 20 km/h) and the time of the last update.
- Security: sockets send the login token. Only the order's customer or its assigned partner can join the order room. Only the assigned partner can send locations, and only while the order is *Out for Delivery*.
- Socket events: `order:watch {orderId}`, `order:unwatch`, `location:update {orderId,lat,lng}` (partner) → `order:location {orderId,lat,lng,updatedAt}`.

### 4. Admin dashboard
- Create the admin account once with `npm run seed:admin --prefix backend`. It creates `admin@quickcart.local` with a random password and writes the login to `backend/admin-credentials.txt`. That file is git-ignored, so delete it after noting the password. Nobody can register as admin from the app.
- Logging in as admin opens `/admin`, which has three tabs:
  - **Overview:** revenue, order/customer/partner/product counts, bar charts of revenue and orders for the last 7 days, orders by status, top products, low-stock warning.
  - **Orders:** every order with a status filter. Assign or reassign a delivery partner from a dropdown; a Pending order becomes Accepted. The list updates live.
  - **Products:** add, edit (price, stock, image URL, category…), delete, filter.

## API (backend, all JSON)

| Method | Path                            | Auth          | Description                                     |
|--------|---------------------------------|---------------|-------------------------------------------------|
| GET    | `/api/health`                   | none          | Health check                                    |
| GET    | `/api/products?q=&category=`    | none          | List or search products                         |
| GET    | `/api/products/categories`      | none          | Category names                                  |
| GET    | `/api/products/:id`             | none          | One product                                     |
| GET    | `/api/addresses`                | Bearer        | Saved addresses                                 |
| POST   | `/api/addresses`                | Bearer        | `{label,line,lat,lng,isDefault?}`               |
| PUT    | `/api/addresses/:id`            | Bearer        | Update / make default                           |
| DELETE | `/api/addresses/:id`            | Bearer        | Remove a saved address                          |
| POST   | `/api/auth/register`            | none          | `{name,email,password,role}` → `{token}`        |
| POST   | `/api/auth/login`               | none          | `{email,password}` → `{token}`                  |
| GET    | `/api/auth/me`                  | Bearer        | Current user                                    |
| POST   | `/api/orders`                   | customer      | `{items:[{productId,quantity}],addressId}` (or `location`+`locationCoords`) or `{product,quantity,location}` → order |
| GET    | `/api/orders/customer/:id`      | same user     | Customer's orders                               |
| GET    | `/api/orders/pending`           | delivery      | Pending orders + partner's undelivered orders   |
| GET    | `/api/admin/stats`              | admin         | Totals, 7-day sales, status counts, top products |
| GET    | `/api/admin/orders?status=`     | admin         | All orders                                      |
| PUT    | `/api/admin/orders/:id/assign`  | admin         | `{partnerId}` assign a delivery partner          |
| GET    | `/api/admin/partners`           | admin         | Delivery partners                               |
| POST/PUT/DELETE | `/api/admin/products[/:id]` | admin    | Product CRUD                                    |
| GET    | `/api/orders/:id/tracking`      | order's customer/partner | Status, destination, last rider location |
| PUT    | `/api/orders/:id/status`        | delivery      | `{status}`: Accepted / Out for Delivery / Delivered |
| GET    | `/api/orders/history/:userId`   | same user     | All orders for the user                         |

Socket.IO event `orderUpdate` → `{ orderId, status }` is emitted on create and status change.
