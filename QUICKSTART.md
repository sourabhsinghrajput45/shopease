# ⚡ ShopEase — Quick Start Guide (v2)

Get the project running in under 10 minutes.

---

## Prerequisites

- **Node.js** v18+ → https://nodejs.org
- **MySQL** 8.0+ running locally
- A terminal / command prompt

---

## Step 1 — Database Setup

```bash
mysql -u root -p < database/setup.sql
```

Or paste `database/setup.sql` into MySQL Workbench and run it.

**Demo accounts (password for both: `demo1234`)**

| Role     | Email                      |
|----------|----------------------------|
| Customer | customer@shopease.com      |
| Seller   | seller@shopease.com        |

---

## Step 2 — Configure Backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and set your MySQL password:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD_HERE
DB_NAME=shopease
JWT_SECRET=change_this_to_something_random
```

---

## Step 3 — Start Backend

```bash
cd backend
npm install
npm run dev
```

Test: open http://localhost:5000/api/health

---

## Step 4 — Start Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## What's New in v2

- **RBAC** — Customer and Seller roles. Sellers get a dashboard to manage listings.
- **Price History** — Sparkline chart + price timeline on every product page.
- **Social Proof** — "X people have this in their cart" on product pages.
- **Stock Urgency** — Animated bar appears when stock drops below 10.
- **Seller Badge** — Shows which seller listed each product.
- **Demo login buttons** — One-click fill on the login page.

---

## Troubleshooting

**"Can't connect to MySQL"** → Check `DB_PASSWORD` in `.env`

**"Port already in use"** → Change `PORT=5001` in `.env` and update `frontend/vite.config.js` proxy target to match

**"npm install fails"** → Delete `node_modules` and `package-lock.json`, retry

---

## Useful SQL Queries

```sql
-- Change a user's role to seller
UPDATE shopease.users SET role = 'seller' WHERE email = 'someone@example.com';

-- View price history for a product
SELECT * FROM shopease.price_history WHERE product_id = 1 ORDER BY recorded_at;

-- See cart activity counts
SELECT p.name, ca.count FROM shopease.cart_activity ca JOIN shopease.products p ON p.id = ca.product_id;

-- View all orders
SELECT * FROM shopease.orders ORDER BY created_at DESC;

-- Reset the DB
DROP DATABASE shopease;
-- Then re-run setup.sql
```
