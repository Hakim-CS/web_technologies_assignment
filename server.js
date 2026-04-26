/*
 * server.js — TechNova Store Backend
 * Node.js + Express
 *
 * Routes:
 *   POST /api/login         — check user credentials, return user ID
 *   GET  /api/products      — return all products
 *   POST /api/products      — add a new product
 *   GET  /                  — serve static HTML files
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = 3000;

// ── Middleware ──────────────────────────────────────────────
// Parse incoming JSON request bodies
app.use(express.json());

// Serve all static files (HTML, CSS, JS, images) from this folder
app.use(express.static(path.join(__dirname)));

// ── Helper: read/write JSON files ───────────────────────────
function readJSON(filePath) {
  const fullPath = path.join(__dirname, filePath);
  const content  = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(content);
}

function writeJSON(filePath, data) {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
}

// ── ROUTE 1: POST /api/login ────────────────────────────────
// Body: { username, password }
// Success: 200  { success: true,  userId: 1, name: "Admin" }
// Failure: 401  { success: false, error: "Invalid credentials" }
app.post('/api/login', function(req, res) {
  const { username, password } = req.body;

  // Basic input check
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required.'
    });
  }

  // Load users from file
  const users = readJSON('data/users.json');

  // Find matching user
  const user = users.find(function(u) {
    return u.username === username && u.password === password;
  });

  if (user) {
    // SUCCESS — return user ID and name
    console.log('Login success: user', user.id, '(' + user.username + ')');
    return res.status(200).json({
      success: true,
      userId:  user.id,
      name:    user.name,
      role:    user.role
    });
  } else {
    // FAILURE — return 401 Unauthorized
    console.log('Login failed for username:', username);
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password.'
    });
  }
});

// ── ROUTE 2: GET /api/products ──────────────────────────────
// Returns the full product list as JSON array
app.get('/api/products', function(req, res) {
  const data = readJSON('data/products.json');
  console.log('Sending', data.products.length, 'products to client');
  return res.status(200).json(data.products);
});

// ── ROUTE 3: POST /api/products ─────────────────────────────
// Body: product object { name, category, price, supplier, stock, ... }
// Returns: 201 { success: true, product: { id, name, ... } }
app.post('/api/products', function(req, res) {
  const newProduct = req.body;

  // Validate required fields
  if (!newProduct.name || !newProduct.price || !newProduct.category) {
    return res.status(400).json({
      success: false,
      error: 'Product name, price, and category are required.'
    });
  }

  // Load existing products
  const data = readJSON('data/products.json');

  // Assign a new ID (max existing ID + 1)
  const maxId = data.products.reduce(function(max, p) {
    return Math.max(max, p.id);
  }, 0);

  newProduct.id         = maxId + 1;
  newProduct.date_added = new Date().toISOString().split('T')[0]; // today's date
  newProduct.rating     = newProduct.rating || 0;
  newProduct.warranty   = newProduct.warranty || '1 Year';

  // Add to list and save
  data.products.push(newProduct);
  writeJSON('data/products.json', data);

  console.log('New product added:', newProduct.name, '(ID:', newProduct.id + ')');

  return res.status(201).json({
    success: true,
    product: newProduct
  });
});

// ── START SERVER ────────────────────────────────────────────
app.listen(PORT, function() {
  console.log('');
  console.log('  TechNova Store server running!');
  console.log('  Open: http://localhost:' + PORT);
  console.log('');
});
