# ShopEase — Presentation & Navigation Guide

A complete walkthrough for demonstrating the project to an audience, covering both the Customer and Seller experiences.

---

## Setup Before Presenting

1. Run `mysql -u root -p < database/setup.sql` to seed fresh data
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Open two browser windows — one for Customer, one for Seller
5. Keep the login page open so you can switch roles easily

**Demo accounts:**
| Role | Email | Password |
|------|-------|----------|
| Customer | customer@shopease.com | demo1234 |
| Seller | seller@shopease.com | demo1234 |

---

## Part 1 — The Customer Journey

### 1.1 Homepage (Not Logged In)
**URL:** `http://localhost:5173`

- Point out the clean hero section — no popups, no distractions
- Show the **6 category cards** with colour-coded icons — clicking one goes directly to filtered products
- Scroll down to **Featured Products** — all real products from the database
- Highlight the **"Start Selling" CTA** at the bottom — shows the dual-sided marketplace

**Key talking point:** The homepage loads in two API calls. Everything visible is real data.

---

### 1.2 Product Browsing
**URL:** `/products`

- Show the **category sidebar filter** on the left — click Electronics
- Point out the **price range slider** — drag it down to filter products in real time
- Show **active filter chips** appearing at the top when filters are applied — easy to remove
- Click the sort dropdown — show Newest, Price Low→High, Best Rated
- Hover over a product card to see the **"Add to Cart" slide-up** button appear

**Key talking point:** Filtering is entirely client-side for the price range — instant response.

---

### 1.3 Signing Up as a Customer
**URL:** `/register`

- Show the **Customer / Seller role toggle** — two clear cards, not a dropdown
- Register with a new email or use the demo fill buttons on the login page
- After login, notice the navbar updates — cart and wishlist icons appear, user menu changes

---

### 1.4 Product Detail Page
**URL:** `/products/1` (Wireless Earbuds)

Walk through top to bottom:

1. **Product image** — large, with stock urgency bar visible if stock < 10
2. **Seller badge** — shows "Demo Seller" under the product name
3. **Social proof line** — "7 people have this in their cart right now"
4. **Star rating** and review count
5. **Quantity selector** — tap +/− then Add to Cart
6. **Price History block** — this is the standout feature:
   - A sparkline (hand-drawn SVG, no library) showing price over time
   - Trend indicator: green arrow = price went down, red = went up
   - Highest / lowest prices displayed
   - "At its lowest price — good time to buy" green banner when applicable
7. **Reviews section** at the bottom — submit a review (must be logged in)

**Key talking point:** The price history chart uses zero external chart libraries — it's a pure SVG drawn from DB data.

---

### 1.5 Wishlist
**URL:** `/wishlist` or click ♥ in navbar

- Go back to any product listing
- Click the **heart icon** on a product card — it turns red instantly
- Click the heart on another product
- Navigate to `/wishlist`
- Show **"Move to Cart"** button on each item
- Show **"Add All to Cart"** button at the bottom
- The wishlist count badge updates live in the navbar

---

### 1.6 Cart & Checkout
**URL:** `/cart`

- Show the cart with items, quantity controls, and remove buttons
- Point out the **free delivery threshold** (orders over ₹999)
- Click "Proceed to Checkout"
- Fill in a shipping address and click **Place Order**
- The order is created in MySQL, stock is decremented, cart is cleared

---

### 1.7 Customer Account Dashboard
**URL:** `/account` (click your name → My Account)

Walk through the dashboard panels:

1. **4 stat cards** — Total Orders, Total Spent (real sum from DB), Active Orders, Wishlist count
2. **Recent Orders** — last 5 orders with product thumbnails, status badge, clickable
3. **Wishlist Preview** — first 3 items with link to full wishlist
4. **Recently Viewed** — last 3 products viewed this session
5. **Account card** — name, email, member since date

**Key talking point:** All numbers are pulled live from the database — no fake stats.

---

### 1.8 Order History & Order Detail
**URL:** `/orders` → click any order

- Order list shows **product thumbnails stacked** side by side
- Click an order to see the detail page
- Point out the **visual status stepper**: Order Placed → Processing → Shipped → Delivered
   - Each step has a numbered circle that fills when that status is reached
- Show the shipping address card and payment card side by side

---

## Part 2 — The Seller Journey

Open a new browser tab or window and log in as the Seller.

### 2.1 Register / Login as Seller
**URL:** `/login`

- Click the **"Seller" demo button** to fill credentials
- After login, notice the navbar is different:
   - No cart icon, no wishlist icon
   - Amber-coloured avatar with "Seller" badge
   - Dropdown shows Dashboard and Orders Received

---

### 2.2 Seller Dashboard — Overview Tab
**URL:** `/seller`

Point out the layout:

**Stat Row (4 cards):**
- Active Listings — count of their products
- Total Revenue — real sum from order_items in DB (shown with vs-last-month % trend)
- Orders Received — distinct order count
- Low Stock Items — count of products with ≤5 units (amber when > 0)

**Revenue Chart:**
- Bar chart of the last 30 days — each bar = one day with an order
- Hover a bar to see the exact date and revenue in a tooltip
- If no orders yet: shows "No revenue data yet" message

**Top Products:**
- Horizontal bar chart ranked by units sold
- Product image, name, units sold count, proportional bar
- If no sales: shows a polite "No sales yet" message

**Key talking point:** The chart is built from scratch with SVG — no recharts, no chart.js needed.

---

### 2.3 Seller Dashboard — Products Tab

Click the **Products** tab:

- See all their listings in a card list
- Each row shows: image, name, badges (Featured / Low Stock / Inactive), price, stock, category, units sold, star rating
- **Edit (pencil icon)** — opens a modal form with image preview
- **Delete (trash icon)** — soft-deletes (sets is_active = 0)

Click **New Product** (top right):
- Modal form slides in
- Fill: name, description, price, stock, category, image URL
- Check "Featured" to show on homepage
- Submit — product appears instantly, price history entry created automatically

**Key talking point:** Editing price automatically logs to `price_history` — customers will see the change in the sparkline.

---

### 2.4 Seller Dashboard — Orders Tab

Click the **Orders** tab:

- Every order that contains this seller's products appears here
- Shows Order ID, customer name, date, status badge, seller's revenue from that order
- Revenue shown is only for the seller's own products (not the full order total)

---

## Part 3 — Standout Features Summary

Use this section to summarise what makes ShopEase different:

| Feature | Where to see it | What it shows |
|---|---|---|
| **Price History Sparkline** | Any product detail page | Real historical prices from DB, SVG chart, "good time to buy" banner |
| **Deal Badge** | Product cards (when price dropped) | % off vs historical high, shown automatically |
| **Social Proof Counter** | Product detail page | "X people have this in cart right now" — from cart_activity table |
| **Stock Urgency Bar** | Product image when stock ≤ 10 | Animated fill bar with count |
| **Wishlist with Heart Toggle** | Product cards + navbar | Persisted in localStorage, red heart, count badge |
| **Recently Viewed** | Homepage + Account dashboard | Last 6 products, localStorage |
| **Order Status Stepper** | Order detail page | Visual 4-step progress bar |
| **Role-Based Access** | Register page toggle | Customer vs Seller, different navbar, different routes |
| **Seller Revenue Chart** | Seller Dashboard → Overview | 30-day bar chart, tooltip on hover, real DB data |
| **Customer Account Dashboard** | /account | Real stats, wishlist preview, recently viewed |
| **Price Range Slider** | Products page sidebar | Client-side instant filter |
| **Category Dropdown Navbar** | Desktop navbar | Hover-open megamenu with icons |
| **Quick Add on Hover** | Product cards | Slide-up "Add to Cart" button on hover |

---

## Navigation Map

```
/                    → Home
├── /products        → All Products (filter, sort, search)
│   └── /products/:id → Product Detail (price history, reviews, wishlist)
├── /cart            → Cart
│   └── /checkout    → Checkout → places order
├── /wishlist        → Wishlist
├── /orders          → Order List
│   └── /orders/:id  → Order Detail (status stepper)
├── /account         → Customer Dashboard
├── /login           → Sign In (with demo buttons)
├── /register        → Register (Customer/Seller toggle)
└── /seller          → Seller Dashboard (Overview / Products / Orders tabs)
```

---

## Common Questions & Answers

**Q: Is the data real or mocked?**
A: All numbers come from MySQL. No fake stats — if no orders exist, the charts show 0 or an empty state message.

**Q: How does price history work?**
A: When a product is created, its initial price is logged to `price_history`. When a seller edits the price, a new row is added automatically. The sparkline reads this table.

**Q: How is the "people in cart" counter updated?**
A: Every time a customer adds/removes an item from their cart, the frontend pings `/api/products/cart-ping` which updates the `cart_activity` table. No login required.

**Q: Can a seller buy products?**
A: No. The cart and wishlist icons are hidden for seller accounts. If they try to visit `/cart`, it works but they won't be directed there by the UI.

**Q: Where is the role enforced?**
A: On the backend via the `sellerOnly` middleware — all `/api/seller/*` routes require a valid JWT with `role: 'seller'`. On the frontend via `isSeller` from AuthContext.
