# ShopEase 🛒

A clean, no-nonsense e-commerce web application. Simple to run, easy to understand, and ready to extend.

---

## What is ShopEase?

ShopEase is a fully functional e-commerce website built for developers who want a real, working example without the clutter. The UI is intentionally clean — no popups, no flashy banners, no dark patterns. Just a straightforward shopping experience.

---

## Features

**For Shoppers**
- Browse products by category or search
- View detailed product pages with reviews and ratings
- Add to cart and adjust quantities
- Register / sign in with JWT authentication
- Checkout with a shipping address form
- View order history and order details

**For Developers**
- Clean REST API with Express
- MySQL database with proper relational schema
- JWT authentication with bcrypt password hashing
- Cart persisted in localStorage
- Responsive design that works on mobile and desktop

---

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 18 + Vite         |
| Styling  | Tailwind CSS            |
| Backend  | Node.js + Express       |
| Database | MySQL 8                 |
| Auth     | JWT + bcryptjs          |
| HTTP     | Axios                   |
| Routing  | React Router v6         |
| Toast    | react-hot-toast         |

---

## Project Structure

```
shopease/
├── backend/
│   ├── config/
│   │   └── db.js              # MySQL connection pool
│   ├── controllers/
│   │   ├── auth.js            # Register, login, profile
│   │   ├── products.js        # Product listings, detail, categories
│   │   ├── orders.js          # Create and view orders
│   │   └── reviews.js         # Submit reviews
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── reviews.js
│   ├── .env.example           # Copy this to .env
│   ├── package.json
│   └── server.js              # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Header with search, cart, user menu
│   │   │   ├── Footer.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # User auth state
│   │   │   └── CartContext.jsx  # Cart state (localStorage)
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page with featured products
│   │   │   ├── Products.jsx    # Product listing with filters
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── Auth.jsx        # Login + Register
│   │   ├── api.js             # Axios instance with auth interceptor
│   │   ├── App.jsx            # Router setup
│   │   ├── main.jsx
│   │   └── index.css          # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── database/
│   └── setup.sql              # All CREATE TABLE + sample data
│
├── QUICKSTART.md              # Step-by-step setup guide
└── README.md                  # This file
```

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/profile` | Yes | Get user profile |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | No | List products (supports `?search=`, `?category=`, `?sort=`, `?page=`) |
| GET | `/api/products/featured` | No | Get featured products |
| GET | `/api/products/categories` | No | List all categories |
| GET | `/api/products/:id` | No | Get single product + reviews |

### Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/orders` | Yes | Place an order |
| GET | `/api/orders` | Yes | Get user's orders |
| GET | `/api/orders/:id` | Yes | Get order detail |

### Reviews
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/reviews/:product_id` | Yes | Add a review |

---

## Database Schema

```
users           → id, name, email, password, created_at
categories      → id, name, slug
products        → id, name, description, price, stock, image_url, category_id, is_featured, is_active, created_at
orders          → id, user_id, total, status, shipping_address (JSON), payment_method, created_at
order_items     → id, order_id, product_id, quantity, price
reviews         → id, user_id, product_id, rating, comment, created_at
```

---

## Getting Started

See [QUICKSTART.md](./QUICKSTART.md) for step-by-step setup instructions.

---

## Extending the Project

Some ideas if you want to take it further:
- Add an admin panel to manage products and orders
- Integrate Razorpay or Stripe for real payments
- Add product images upload (Multer + Cloudinary)
- Implement wishlist functionality
- Add email notifications on order placement (Nodemailer)
- Deploy the backend on Railway and frontend on Vercel

---

## Notes

- Payments are in demo mode — no real charges
- Product images use Unsplash (requires internet connection)
- The demo user password is `demo1234`
- Passwords are always hashed with bcrypt — never stored in plain text
