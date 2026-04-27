# TechNova Store — Project Documentation & Bug Analysis

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [File Structure](#4-file-structure)
5. [Backend (server.js)](#5-backend-serverjs)
6. [Frontend Pages](#6-frontend-pages)
7. [JavaScript Modules](#7-javascript-modules)
8. [Data Files](#8-data-files)
9. [Authentication System](#9-authentication-system)
10. [Cart System](#10-cart-system)
11. [Admin vs User Separation](#11-admin-vs-user-separation)
12. [Bug Analysis & Fixes](#12-bug-analysis--fixes)
13. [CSS & Design System](#13-css--design-system)

---

## 1. Project Overview

**TechNova** is a multi-page online electronics store built as a university assignment. It features:
- A product catalog with categories, product detail pages, and a gallery
- A Node.js/Express backend serving REST APIs and static files
- Client-side authentication via `sessionStorage`
- A membership fee calculator
- A product submission form with comprehensive validation
- Dynamic product loading from the server (with local JSON fallback)

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Browser (Client)                       │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │index.html│  │product   │  │category  │  │gallery   ││
│  │          │  │.html     │  │.html     │  │.html     ││
│  └────┬─────┘  └────┬─────┘  └──────────┘  └──────────┘│
│       │              │                                    │
│  ┌────┴──────────────┴──────────────────────────────────┐│
│  │  JS Modules: auth.js, main.js, validation.js,        ││
│  │              membership.js                            ││
│  └────┬─────────────────────────────────────────────────┘│
│       │  fetch() / XMLHttpRequest                         │
└───────┼──────────────────────────────────────────────────┘
        │  HTTP
┌───────┼──────────────────────────────────────────────────┐
│       ▼           Server (Node.js + Express)              │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  server.js                                          │ │
│  │  ├── POST /api/login        → users.json            │ │
│  │  ├── GET  /api/products     → products.json         │ │
│  │  ├── POST /api/products     → products.json (write) │ │
│  │  └── express.static()       → all HTML/CSS/JS/data  │ │
│  └─────────────────────────────────────────────────────┘ │
│  Port: 3000                                              │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer      | Technology                           | Purpose                            |
|------------|--------------------------------------|------------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript      | Structure, styling, interactivity  |
| CSS Framework | Bootstrap 5.3.3 (CDN)             | Responsive grid, components, utilities |
| Fonts      | Google Fonts (Inter, Sora)           | Typography                         |
| Backend    | Node.js + Express 4.18.x            | REST API server, static file serving |
| Data       | JSON files on disk                   | Product and user storage           |
| State      | `sessionStorage` (browser)           | Auth tokens, cart data             |
| Port       | `3000`                               | Server listens on localhost:3000   |

---

## 4. File Structure

```
Assignement_Nazari/
├── server.js                 # Express backend
├── package.json              # Node.js config & dependencies
├── index.html                # Home page (live clock, products table, hero)
├── login.html                # Login form
├── product.html              # Product detail page (Sony WH-1000XM5)
├── category.html             # Category listing (Laptops)
├── gallery.html              # Product image gallery
├── add-item.html             # Add New Product form (admin)
├── membership.html           # Membership calculator
├── css/
│   └── styles.css            # Custom dark-theme styles
├── js/
│   ├── auth.js               # Login/logout, cart, admin/user roles
│   ├── main.js               # Clock, countdown, product loading
│   ├── validation.js         # Form validation for add-item
│   └── membership.js         # Membership fee calculator
└── data/
    ├── users.json            # User credentials (3 users)
    ├── products.json         # Product catalog (7 products)
    ├── items.txt             # Static product inventory list
    └── suppliers.txt         # Supplier directory
```

---

## 5. Backend (server.js)

### Server Configuration
- **Framework**: Express 4.18.x
- **Port**: `3000`
- **Middleware**: `express.json()` for parsing JSON bodies, `express.static()` for serving all project files

### API Routes

#### `POST /api/login`
- **Request Body**: `{ username: string, password: string }`
- **Validation**: Checks both fields are present (400 if missing)
- **Logic**: Reads `data/users.json`, searches for matching username+password
- **Success (200)**: `{ success: true, userId: number, name: string, role: string }`
- **Failure (401)**: `{ success: false, error: "Invalid username or password." }`

#### `GET /api/products`
- **No parameters required**
- **Logic**: Reads `data/products.json`, returns the `products` array
- **Response (200)**: JSON array of product objects

#### `POST /api/products`
- **Request Body**: Product object `{ name, category, price, ... }`
- **Validation**: Requires `name`, `price`, `category` (400 if missing)
- **Logic**: 
  1. Reads existing products from `data/products.json`
  2. Assigns new ID = max existing ID + 1
  3. Sets `date_added` to today, defaults `rating=0`, `warranty="1 Year"`
  4. Appends to array, writes back to file
- **Response (201)**: `{ success: true, product: { ...newProduct } }`

### Helper Functions
- `readJSON(filePath)` — Reads and parses a JSON file synchronously
- `writeJSON(filePath, data)` — Writes JSON data to file synchronously

---

## 6. Frontend Pages

### `index.html` — Home Page
- **Hero section** with branding and CTA buttons
- **Live date & time** display (updates every second via `updateDateTime()`)
- **Happy Hour countdown** (18:00–20:00 daily, via `updateHappyHour()`)
- **Store data file links** (items.txt, suppliers.txt)
- **Category cards** (6 categories with emoji icons)
- **Best-sellers section** with product cards and a static HTML table
- **Dynamic products table** loaded from server (`GET /api/products`) with local JSON fallback
- **Scripts**: auth.js, main.js — initialized via `initPage()` on `<body onload>`

### `login.html` — Login Page
- Centered login card with username/password fields
- Error alert shown on failed login
- Demo credential hints (admin, john, sara)
- Calls `handleLogin(event)` from `auth.js` on form submit
- **Scripts**: auth.js

### `product.html` — Product Detail
- Breadcrumb navigation (Home > Audio > Sony WH-1000XM5)
- Product image with thumbnails
- Product info: name, price ($349.99), description, features list
- **"Add to Cart" button** — calls `addToCart()` to add to sessionStorage cart
- Technical specifications table
- Related products section
- **Scripts**: auth.js

### `category.html` — Category (Laptops)
- Breadcrumb navigation
- Info alert about warranty
- Main content: category description, product cards (3 laptops), product table
- Sidebar: category list, price range filters, "List a Product" button
- **Scripts**: auth.js

### `gallery.html` — Product Gallery
- Organized by category: Audio, Laptops, Smartphones & TVs, Gaming
- Image cards with hover overlay showing product names
- **Scripts**: auth.js

### `add-item.html` — Add New Product (Admin)
- Comprehensive product form with 13+ fields:
  - Text inputs (name, SKU, description, email, URL)
  - Number inputs (price, stock)
  - Select dropdowns (category, supplier, warranty)
  - Radio buttons (condition, availability)
  - Range slider (rating 1–5)
  - Date picker, color picker, file upload
  - Checkbox group (tags/features)
  - Terms checkbox
- Full client-side validation via `validation.js`
- On validation success: POSTs to `POST /api/products`
- Success/error alerts with auto-scroll
- **Scripts**: auth.js, validation.js + inline script for POST logic

### `membership.html` — Membership Calculator
- Three package cards (Monthly $4.99, Quarterly $12.99, Yearly $39.99)
- Calculator form: name, email, package selection, member count
- Calculates total with package-specific discounts
- Displays summary table + benefits list
- **Scripts**: auth.js, membership.js

---

## 7. JavaScript Modules

### `auth.js` — Authentication & Cart

| Function | Purpose |
|----------|---------|
| `initAuth()` | Master init — calls `updateNavAuthStatus()`, `updateCartBadge()`, `updateAdminLinks()` |
| `updateNavAuthStatus()` | Injects login button or "user name + logout" into `#nav-auth` |
| `updateAdminLinks()` | Hides "Add Item" nav link for non-admin users |
| `handleLogin(event)` | POST `/api/login`, save userId/userName/userRole to sessionStorage |
| `logout()` | Clear session, redirect to login.html |
| `getCart()` / `saveCart(cart)` | Read/write cart array from sessionStorage |
| `addToCart(name, price, id)` | Add product to cart (or increment qty), show toast |
| `getCartCount()` | Total items in cart |
| `updateCartBadge()` | Update the red badge number on the 🛒 icon |
| `showCartToast(name)` | Temporary success notification at bottom-right |

### `main.js` — Home Page Logic

| Function | Purpose |
|----------|---------|
| `initPage()` | Master init for index.html — clock, countdown, products, auth |
| `updateDateTime()` | Live date & time display (runs every 1s) |
| `updateHappyHour()` | Happy Hour countdown timer (18:00–20:00) |
| `loadProducts()` | `GET /api/products` → render table, falls back to local JSON → falls back to hardcoded data |
| `renderProductTable(products, tbody)` | Builds HTML table rows from product array |
| `loadFallbackData(tbody)` | Hardcoded 5-product array as last-resort fallback |

### `validation.js` — Form Validation

Validates 13 fields for the add-product form:
1. Product Name (required, 2–100 chars)
2. SKU (required)
3. Description (required, 20–1000 chars)
4. Price (required, > 0)
5. Stock (required, ≥ 0, integer)
6. Category (required, dropdown)
7. Supplier (required, dropdown)
8. Condition (required, radio)
9. Availability (required, radio)
10. Date of Last Purchase (required)
11. Email (required, regex validated)
12. URL (optional, must start with http/https if filled)
13. Terms checkbox (required)

Calls `onValidationSuccess()` if defined on the page (for POST to server), otherwise shows local success alert.

### `membership.js` — Fee Calculator

| Function | Purpose |
|----------|---------|
| `calculateMembership()` | Validates inputs, calculates fee (price × members − discount), renders result HTML |

Package discounts: Monthly 0%, Quarterly 5%, Yearly 20%.

---

## 8. Data Files

### `data/users.json` — 3 Demo Users

| ID | Username | Password | Name | Role |
|----|----------|----------|------|------|
| 1 | admin | admin123 | Admin User | admin |
| 2 | john | john123 | John Smith | user |
| 3 | sara | sara456 | Sara Johnson | user |

> ⚠️ Passwords are stored in plain text — acceptable for a university demo only.

### `data/products.json` — 7 Products

IDs 1–7, categories: Audio, Laptops, Smartphones, Gaming, TVs. Each has name, category, price, supplier, stock, rating, warranty, date_added.

### `data/items.txt` — Static Inventory
Plain-text product list (pipe-delimited): ID | Name | Price | Supplier | Date Added

### `data/suppliers.txt` — Supplier Directory
Plain-text supplier info: ID | Name | Country | Contact Email

---

## 9. Authentication System

### Flow
1. User navigates to `login.html`
2. Submits username + password → `handleLogin()` sends `POST /api/login`
3. Server checks credentials against `data/users.json`
4. On success: server returns `{ userId, name, role }`
5. Client stores in `sessionStorage`: `userId`, `userName`, `userRole`
6. Redirects to `index.html`

### Session Management
- **Storage**: `sessionStorage` (cleared when tab closes)
- **Keys**: `userId`, `userName`, `userRole`
- **Check**: `initAuth()` runs on every page load, reads session and updates navbar

### Navbar Auth Display
- **Logged out**: Shows "🔑 Login" button linking to `login.html`
- **Logged in**: Shows "👤 [Name]" + "Logout" button
- Rendered into `<li id="nav-auth">` element by `updateNavAuthStatus()`

---

## 10. Cart System

### Implementation
- **Storage**: `sessionStorage` key `"cart"` — JSON array of objects
- **Cart Item Schema**: `{ id, name, price, qty }`
- **Functions**: `addToCart()`, `getCart()`, `saveCart()`, `getCartCount()`, `updateCartBadge()`

### User Experience
1. User clicks "🛒 Add to Cart" on product page
2. `addToCart('Sony WH-1000XM5', 349.99, 1)` is called
3. If item already in cart → increment qty; otherwise → add new entry
4. Cart badge (red pill number) updates in navbar
5. Green toast notification appears at bottom-right corner for 2.5s

---

## 11. Admin vs User Separation

### Role-Based Access
- `userRole` is stored in `sessionStorage` after login
- `updateAdminLinks()` runs on every page via `initAuth()`

### Behavior by Role

| Feature | Guest (not logged in) | User (john, sara) | Admin |
|---------|:-----:|:-----:|:-----:|
| Browse products | ✅ | ✅ | ✅ |
| Add to cart | ✅ | ✅ | ✅ |
| See login button | ✅ | ❌ (sees name) | ❌ (sees name) |
| See "➕ Add Item" nav link | ❌ | ❌ | ✅ |
| Submit new product | ❌ | ❌ | ✅ |
| Membership calculator | ✅ | ✅ | ✅ |

---

## 12. Bug Analysis & Fixes

### Bug 1: Sign-In Button Not Visible on All Pages

#### Symptom
The "🔑 Login" button only appeared on the Add Item page. All other pages showed no login/logout indicator.

#### Root Cause
The `auth.js` → `updateNavAuthStatus()` function looks for a DOM element with `id="nav-auth"` to inject the login/logout UI into. **Only `add-item.html` had this element** in its navbar `<ul>`:

```html
<!-- Only add-item.html had this: -->
<li class="nav-item d-flex align-items-center ms-2" id="nav-auth"></li>
```

Additionally, several pages didn't even include `auth.js` or call `initAuth()`:

| Page | Had `#nav-auth`? | Included `auth.js`? | Called `initAuth()`? |
|------|:-:|:-:|:-:|
| `index.html` | ❌ | ✅ | ✅ (via `initPage()`) |
| `login.html` | ❌ | ✅ | ❌ |
| `product.html` | ❌ | ❌ | ❌ |
| `category.html` | ❌ | ❌ | ❌ |
| `gallery.html` | ❌ | ❌ | ❌ |
| `membership.html` | ❌ | ❌ | ❌ |
| `add-item.html` | ✅ | ✅ | ✅ |

#### Fix Applied
1. Added `<li id="nav-auth"></li>` to every page's navbar
2. Added `<script src="js/auth.js"></script>` to every page that was missing it
3. Added `<script>initAuth();</script>` to ensure initialization runs

---

### Bug 2: "Add to Cart" Redirects to Add Product Page

#### Symptom
Clicking the primary action button on `product.html` navigated to `add-item.html` (the admin product creation form) instead of adding the product to the user's cart.

#### Root Cause
On `product.html` line 100, the button was a plain anchor link pointing to the admin page:

```html
<!-- BEFORE (broken) -->
<a href="add-item.html" class="btn btn-primary">🛒 Add to Store</a>
```

This **conflated two completely different actions**:
- **Admin action**: "Add to Store" = adding a NEW product to the inventory (via the form on add-item.html)
- **User action**: "Add to Cart" = adding an EXISTING product to the shopping cart

The label "Add to Store" was misleading, and the `href` was simply wrong for a customer-facing action.

#### Fix Applied
Replaced the anchor with a JavaScript-powered button:

```html
<!-- AFTER (fixed) -->
<button type="button" class="btn btn-primary" 
        onclick="addToCart('Sony WH-1000XM5', 349.99, 1)">🛒 Add to Cart</button>
```

This calls `addToCart()` from `auth.js`, which:
1. Adds the product to the sessionStorage cart
2. Updates the cart badge count
3. Shows a success toast notification
4. Does NOT navigate away from the page

---

## 13. CSS & Design System

### Color Palette (CSS Custom Properties)

| Variable | Value | Purpose |
|----------|-------|---------|
| `--color-bg` | `#0d0f1a` | Page background (dark navy) |
| `--color-surface` | `#141726` | Cards, navbar, footer |
| `--color-surface2` | `#1c2038` | Hover states, dropdown menus |
| `--color-border` | `#2a2f4a` | Borders and dividers |
| `--color-primary` | `#6c63ff` | Purple accent (buttons, links) |
| `--color-accent` | `#00d4ff` | Cyan accent (prices, highlights) |
| `--color-text` | `#e2e8f0` | Body text |
| `--color-muted` | `#8892a4` | Secondary text |
| `--color-success` | `#22c55e` | Success states |
| `--color-warning` | `#f59e0b` | Warning states |
| `--color-danger` | `#ef4444` | Error states |

### Typography
- **Body**: Inter (300–700 weight)
- **Headings**: Sora (700–800 weight, white)

### Key Component Styles
- **Product cards**: Dark surface, border, 12px radius, hover lift + shadow + border glow
- **Gallery items**: Relative positioned with overlay gradient on hover
- **Category cards**: Centered text, emoji icon, hover lift effect
- **Alerts**: Semi-transparent backgrounds with matching border colors
- **Tables**: Dark theme with primary-colored headers, hover row highlighting
- **Forms**: Dark background inputs with purple focus ring
