/*
 * main.js — TechNova Store
 * Handles:
 *   1. Live date & time display
 *   2. Happy Hour countdown
 *   3. Product loading from server GET /api/products  (Task 4)
 *      Falls back to local JSON if server is not running
 */

/* ============================================================
   1. DATE & TIME
   ============================================================ */
function updateDateTime() {
  var now    = new Date();
  var days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var months = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

  var dayName = days[now.getDay()];
  var day     = now.getDate();
  var month   = months[now.getMonth()];
  var year    = now.getFullYear();
  var hh      = String(now.getHours()).padStart(2, '0');
  var mm      = String(now.getMinutes()).padStart(2, '0');
  var ss      = String(now.getSeconds()).padStart(2, '0');

  var el = document.getElementById('live-datetime');
  if (el) {
    el.innerHTML =
      '<span>📅 ' + dayName + ', ' + day + ' ' + month + ' ' + year + '</span>'
    + '&nbsp;&nbsp;<span>🕐 ' + hh + ':' + mm + ':' + ss + '</span>';
  }
}

/* ============================================================
   2. HAPPY HOUR COUNTDOWN  (18:00 – 20:00 daily)
   ============================================================ */
function updateHappyHour() {
  var el = document.getElementById('happy-hour-countdown');
  if (!el) return;

  var now        = new Date();
  var nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  var happyStart = 18 * 3600;
  var happyEnd   = 20 * 3600;

  var diff, label, cssClass;

  if (nowSeconds >= happyStart && nowSeconds < happyEnd) {
    diff     = happyEnd - nowSeconds;
    label    = '⏳ Happy Hour ends in:';
    cssClass = 'alert alert-success';
  } else if (nowSeconds < happyStart) {
    diff     = happyStart - nowSeconds;
    label    = '🔔 Happy Hour starts in:';
    cssClass = 'alert alert-info';
  } else {
    diff     = (24 * 3600 - nowSeconds) + happyStart;
    label    = '🔔 Next Happy Hour starts in:';
    cssClass = 'alert alert-info';
  }

  var h = Math.floor(diff / 3600);
  var m = Math.floor((diff % 3600) / 60);
  var s = diff % 60;
  var countdown = String(h).padStart(2,'0') + 'h '
                + String(m).padStart(2,'0') + 'm '
                + String(s).padStart(2,'0') + 's';

  el.className = cssClass;
  el.innerHTML =
    '<strong>' + label + '</strong> '
  + '<span style="font-family:monospace; font-size:1.1rem;">' + countdown + '</span>'
  + '&nbsp;<small class="opacity-75">(18:00 – 20:00 daily — 20% off everything!)</small>';
}

/* ============================================================
   3. LOAD PRODUCTS — tries server first, falls back to JSON
   ============================================================ */
function loadProducts() {
  var tableBody = document.getElementById('products-table-body');
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="8" class="text-center">⏳ Loading from server...</td></tr>';

  // Task 4: GET /api/products from Node.js server
  fetch('/api/products')
    .then(function(response) {
      if (!response.ok) throw new Error('Server error: ' + response.status);
      return response.json();
    })
    .then(function(products) {
      renderProductTable(products, tableBody);
    })
    .catch(function() {
      // Fallback: server not running — load from local JSON file
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'data/products.json', true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          renderProductTable(data.products, tableBody);
        } else {
          loadFallbackData(tableBody);
        }
      };
      xhr.onerror = function() { loadFallbackData(tableBody); };
      xhr.send();
    });
}

/* Render products array into the table body */
function renderProductTable(products, tableBody) {
  if (!products || products.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No products found.</td></tr>';
    return;
  }

  tableBody.innerHTML = '';

  for (var i = 0; i < products.length; i++) {
    var p = products[i];

    var stockBadge = p.stock > 20
      ? '<span class="badge bg-success">' + p.stock + '</span>'
      : p.stock > 5
        ? '<span class="badge bg-warning text-dark">' + p.stock + '</span>'
        : '<span class="badge bg-danger">' + p.stock + '</span>';

    var stars = '';
    for (var s = 0; s < 5; s++) {
      stars += (s < Math.round(p.rating || 0)) ? '★' : '☆';
    }

    tableBody.innerHTML +=
      '<tr>'
    + '<td>' + p.id + '</td>'
    + '<td><b>' + p.name + '</b></td>'
    + '<td><span class="badge bg-secondary">' + p.category + '</span></td>'
    + '<td style="color:var(--color-accent); font-weight:700;">$' + parseFloat(p.price).toFixed(2) + '</td>'
    + '<td>' + (p.supplier || '—') + '</td>'
    + '<td>' + stockBadge + '</td>'
    + '<td style="color:#f59e0b;">' + stars + ' <small>(' + (p.rating || 0) + ')</small></td>'
    + '<td>' + (p.warranty || '—') + '</td>'
    + '</tr>';
  }
}

/* Hard-coded fallback if both server and file fail */
function loadFallbackData(tableBody) {
  var fallback = [
    { id:1, name:"Sony WH-1000XM5",        category:"Audio",       price:349.99,  supplier:"Sony Electronics",  stock:42, rating:4.8, warranty:"2 Years" },
    { id:2, name:"Apple MacBook Pro 14\"",  category:"Laptops",     price:1999.99, supplier:"Apple Inc.",         stock:23, rating:4.9, warranty:"1 Year"  },
    { id:3, name:"iPhone 15 Pro",           category:"Smartphones", price:1099.99, supplier:"Apple Inc.",         stock:55, rating:4.7, warranty:"1 Year"  },
    { id:4, name:"Samsung Galaxy S24 Ultra",category:"Smartphones", price:1199.99, supplier:"Samsung Electronics",stock:48, rating:4.6, warranty:"1 Year"  },
    { id:5, name:"Sony PlayStation 5",      category:"Gaming",      price:499.99,  supplier:"Sony Electronics",  stock:35, rating:4.9, warranty:"1 Year"  }
  ];
  renderProductTable(fallback, tableBody);
}

/* ============================================================
   PAGE INIT — called by onload() on index.html
   ============================================================ */
function initPage() {
  // Clock
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // Happy hour
  updateHappyHour();
  setInterval(updateHappyHour, 1000);

  // Load products from server (Task 4)
  loadProducts();

  // Update navbar login status
  if (typeof initAuth === 'function') initAuth();
}
