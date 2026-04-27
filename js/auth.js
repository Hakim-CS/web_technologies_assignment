/*
 * auth.js — TechNova Store
 * Handles: login (POST /api/login), logout, sessionStorage,
 *          cart management, admin/user role separation
 */

/* ============================================================
   CHECK LOGIN STATE ON PAGE LOAD
   Call this on every page to update the navbar login status
   ============================================================ */
function initAuth() {
  updateNavAuthStatus();
  updateCartBadge();
  updateAdminLinks();
}

/* Updates the navbar to show the logged-in user or a login button */
function updateNavAuthStatus() {
  var statusEl = document.getElementById('nav-auth');
  if (!statusEl) return;

  var userId   = sessionStorage.getItem('userId');
  var userName = sessionStorage.getItem('userName');

  if (userId && userName) {
    // User is logged in — show name + logout button
    statusEl.innerHTML =
      '<span class="nav-link text-success">👤 ' + userName + '</span>'
    + '<a class="btn btn-sm btn-outline-danger ms-2" href="#" onclick="logout()">Logout</a>';
  } else {
    // Not logged in — show login button
    statusEl.innerHTML =
      '<a class="btn btn-sm btn-primary" href="login.html">🔑 Login</a>';
  }
}

/* ============================================================
   ADMIN / USER ROLE SEPARATION
   Hide "Add Item" nav link for non-admin users
   ============================================================ */
function updateAdminLinks() {
  var userRole = sessionStorage.getItem('userRole');
  // Find all nav links pointing to add-item.html
  var addItemLinks = document.querySelectorAll('a.nav-link[href="add-item.html"]');
  for (var i = 0; i < addItemLinks.length; i++) {
    var li = addItemLinks[i].closest('li.nav-item');
    if (li) {
      // Show only for admin, hide for regular users and guests
      if (userRole === 'admin') {
        li.style.display = '';
      } else {
        li.style.display = 'none';
      }
    }
  }
}

/* ============================================================
   CART MANAGEMENT (sessionStorage-based)
   ============================================================ */

/* Get the current cart array from sessionStorage */
function getCart() {
  var cartJSON = sessionStorage.getItem('cart');
  if (cartJSON) {
    try { return JSON.parse(cartJSON); }
    catch(e) { return []; }
  }
  return [];
}

/* Save cart array to sessionStorage */
function saveCart(cart) {
  sessionStorage.setItem('cart', JSON.stringify(cart));
}

/* Add a product to the cart (requires login) */
function addToCart(productName, productPrice, productId) {
  // Check if user is logged in
  var userId = sessionStorage.getItem('userId');
  if (!userId) {
    showLoginRequiredToast();
    return;
  }

  var cart = getCart();

  // Check if product already in cart — if so, increment quantity
  var found = false;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === productId || cart[i].name === productName) {
      cart[i].qty += 1;
      found = true;
      break;
    }
  }

  if (!found) {
    cart.push({
      id:    productId || Date.now(),
      name:  productName,
      price: parseFloat(productPrice),
      qty:   1
    });
  }

  saveCart(cart);
  updateCartBadge();

  // Show a brief toast/notification
  showCartToast(productName);
}

/* Get total number of items in the cart */
function getCartCount() {
  var cart = getCart();
  var count = 0;
  for (var i = 0; i < cart.length; i++) {
    count += cart[i].qty;
  }
  return count;
}

/* Update the cart badge count in the navbar */
function updateCartBadge() {
  var badge = document.getElementById('cart-badge');
  if (!badge) return;

  var count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-block' : 'none';
}

/* Show a temporary toast notification when item is added */
function showCartToast(productName) {
  // Remove existing toast if any
  var existing = document.getElementById('cart-toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.id = 'cart-toast';
  toast.style.cssText =
    'position:fixed; bottom:24px; right:24px; z-index:9999;'
  + 'background:linear-gradient(135deg, #22c55e 0%, #16a34a 100%);'
  + 'color:#fff; padding:14px 24px; border-radius:12px;'
  + 'font-weight:600; font-size:0.95rem;'
  + 'box-shadow:0 8px 32px rgba(0,0,0,0.4);'
  + 'animation: slideInRight 0.3s ease-out;'
  + 'display:flex; align-items:center; gap:8px;';
  toast.innerHTML = '🛒 <span><b>' + productName + '</b> added to cart!</span>';

  document.body.appendChild(toast);

  // Auto-remove after 2.5 seconds
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(function() { toast.remove(); }, 300);
  }, 2500);
}

/* Show toast prompting user to log in before adding to cart */
function showLoginRequiredToast() {
  // Remove existing toast if any
  var existing = document.getElementById('cart-toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.id = 'cart-toast';
  toast.style.cssText =
    'position:fixed; bottom:24px; right:24px; z-index:9999;'
  + 'background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);'
  + 'color:#fff; padding:14px 24px; border-radius:12px;'
  + 'font-weight:600; font-size:0.95rem;'
  + 'box-shadow:0 8px 32px rgba(0,0,0,0.4);'
  + 'display:flex; align-items:center; gap:8px;';
  toast.innerHTML =
    '🔒 <span>Please <a href="login.html" style="color:#fff; text-decoration:underline; font-weight:700;">log in</a> to add items to your cart.</span>';

  document.body.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(function() { toast.remove(); }, 300);
  }, 4000);
}

/* ============================================================
   LOGOUT
   ============================================================ */
function logout() {
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userName');
  sessionStorage.removeItem('userRole');
  // Keep cart on logout (cart is per-session anyway)
  window.location.href = 'login.html';
}

/* ============================================================
   LOGIN FORM SUBMISSION
   Sends POST /api/login with { username, password }
   On success: saves userId/userName to sessionStorage, redirects
   On failure: shows error message
   ============================================================ */
function handleLogin(event) {
  event.preventDefault();

  var username = document.getElementById('loginUsername').value.trim();
  var password = document.getElementById('loginPassword').value.trim();
  var errorEl  = document.getElementById('loginError');
  var btnEl    = document.getElementById('loginBtn');

  // Clear previous error
  errorEl.style.display = 'none';
  errorEl.textContent   = '';

  // Basic client-side check
  if (!username || !password) {
    errorEl.textContent   = 'Please enter both username and password.';
    errorEl.style.display = 'block';
    return;
  }

  // Disable button while waiting
  btnEl.disabled    = true;
  btnEl.textContent = 'Logging in...';

  // POST request to server
  fetch('/api/login', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username: username, password: password })
  })
  .then(function(response) {
    return response.json().then(function(data) {
      return { status: response.status, data: data };
    });
  })
  .then(function(result) {
    if (result.status === 200 && result.data.success) {
      // SUCCESS — save to sessionStorage
      sessionStorage.setItem('userId',   result.data.userId);
      sessionStorage.setItem('userName', result.data.name);
      sessionStorage.setItem('userRole', result.data.role);

      // Redirect to home page
      window.location.href = 'index.html';

    } else {
      // FAILURE — show error from server
      errorEl.textContent   = '❌ ' + result.data.error;
      errorEl.style.display = 'block';
      btnEl.disabled    = false;
      btnEl.textContent = '🔑 Login';
    }
  })
  .catch(function(err) {
    // Network error (server not running)
    errorEl.textContent   = '⚠️ Cannot connect to server. Make sure Node.js is running.';
    errorEl.style.display = 'block';
    btnEl.disabled    = false;
    btnEl.textContent = '🔑 Login';
  });
}
