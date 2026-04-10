/*
 * main.js — TechNova Store
 * Handles:
 *   1. Live date & time display
 *   2. Happy Hour countdown
 *   3. JSON product data → HTML table (called on page load)
 */

/* ============================================================
   1. DATE & TIME
   ============================================================ */
function updateDateTime() {
  var now = new Date();

  // Format: Thursday, 10 April 2026  23:45:12
  var days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var months = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

  var dayName = days[now.getDay()];
  var day     = now.getDate();
  var month   = months[now.getMonth()];
  var year    = now.getFullYear();

  var hh = String(now.getHours()).padStart(2, '0');
  var mm = String(now.getMinutes()).padStart(2, '0');
  var ss = String(now.getSeconds()).padStart(2, '0');

  var dateStr = dayName + ", " + day + " " + month + " " + year;
  var timeStr = hh + ":" + mm + ":" + ss;

  var el = document.getElementById('live-datetime');
  if (el) {
    el.innerHTML = '<span id="date-part">📅 ' + dateStr + '</span>'
                 + ' &nbsp; <span id="time-part">🕐 ' + timeStr + '</span>';
  }
}

/* ============================================================
   2. HAPPY HOUR COUNTDOWN
   Happy Hour runs every day from 18:00 to 20:00
   ============================================================ */
function updateHappyHour() {
  var now = new Date();
  var el  = document.getElementById('happy-hour-countdown');
  if (!el) return;

  var currentHour   = now.getHours();
  var currentMin    = now.getMinutes();
  var currentSec    = now.getSeconds();

  // Total seconds elapsed since midnight
  var nowSeconds = currentHour * 3600 + currentMin * 60 + currentSec;

  var happyStart = 18 * 3600;  // 18:00:00
  var happyEnd   = 20 * 3600;  // 20:00:00

  var diff, label, cssClass;

  if (nowSeconds >= happyStart && nowSeconds < happyEnd) {
    // Currently IN happy hour — show time remaining
    diff     = happyEnd - nowSeconds;
    label    = "⏳ Happy Hour ends in:";
    cssClass = "alert alert-success";
  } else if (nowSeconds < happyStart) {
    // Before happy hour today — show time until start
    diff     = happyStart - nowSeconds;
    label    = "🔔 Happy Hour starts in:";
    cssClass = "alert alert-info";
  } else {
    // After 20:00 — show next day
    diff     = (24 * 3600 - nowSeconds) + happyStart;
    label    = "🔔 Next Happy Hour starts in:";
    cssClass = "alert alert-info";
  }

  var h = Math.floor(diff / 3600);
  var m = Math.floor((diff % 3600) / 60);
  var s = diff % 60;

  var countdown = String(h).padStart(2,'0') + "h "
                + String(m).padStart(2,'0') + "m "
                + String(s).padStart(2,'0') + "s";

  // Remove old Bootstrap alert classes and set new ones
  el.className = cssClass;
  el.innerHTML = '<strong>' + label + '</strong> '
               + '<span style="font-family:monospace; font-size:1.1rem;">' + countdown + '</span>'
               + ' &nbsp;<small class="opacity-75">(18:00 – 20:00 daily — 20% off everything!)</small>';
}

/* ============================================================
   3. LOAD JSON PRODUCTS → HTML TABLE
   Called by onload() on the page that has #products-table
   ============================================================ */
function loadProductsFromJSON() {
  var tableBody = document.getElementById('products-table-body');
  if (!tableBody) return;  // Only run if the table exists on this page

  // Fetch the JSON file
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'data/products.json', true);

  xhr.onload = function() {
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      renderProductTable(data.products, tableBody);
    } else {
      tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Failed to load product data.</td></tr>';
    }
  };

  xhr.onerror = function() {
    // Fallback: use inline data if fetch fails (e.g. opened as file://)
    var fallbackData = [
      { id:1, name:"Sony WH-1000XM5",       category:"Audio",       price:349.99,  supplier:"Sony Electronics",  stock:42, rating:4.8, warranty:"2 Years" },
      { id:2, name:"Apple MacBook Pro 14\"", category:"Laptops",     price:1999.99, supplier:"Apple Inc.",         stock:23, rating:4.9, warranty:"1 Year"  },
      { id:3, name:"iPhone 15 Pro",          category:"Smartphones", price:1099.99, supplier:"Apple Inc.",         stock:55, rating:4.7, warranty:"1 Year"  },
      { id:4, name:"Samsung Galaxy S24 Ultra",category:"Smartphones",price:1199.99, supplier:"Samsung Electronics",stock:48, rating:4.6, warranty:"1 Year"  },
      { id:5, name:"Sony PlayStation 5",     category:"Gaming",      price:499.99,  supplier:"Sony Electronics",  stock:35, rating:4.9, warranty:"1 Year"  },
      { id:6, name:"Dell XPS 15",            category:"Laptops",     price:1749.99, supplier:"Dell Technologies", stock:17, rating:4.5, warranty:"2 Years" },
      { id:7, name:"LG C3 55\" OLED TV",    category:"TVs",         price:999.99,  supplier:"LG Electronics",    stock:9,  rating:4.8, warranty:"2 Years" }
    ];
    renderProductTable(fallbackData, tableBody);
  };

  xhr.send();
}

function renderProductTable(products, tableBody) {
  tableBody.innerHTML = ''; // Clear existing rows

  for (var i = 0; i < products.length; i++) {
    var p = products[i];

    // Stock badge
    var stockBadge;
    if (p.stock > 20) {
      stockBadge = '<span class="badge bg-success">' + p.stock + '</span>';
    } else if (p.stock > 5) {
      stockBadge = '<span class="badge bg-warning text-dark">' + p.stock + '</span>';
    } else {
      stockBadge = '<span class="badge bg-danger">' + p.stock + '</span>';
    }

    // Star rating
    var stars = '';
    for (var s = 0; s < 5; s++) {
      stars += (s < Math.round(p.rating)) ? '★' : '☆';
    }

    var row = '<tr>'
      + '<td>' + p.id + '</td>'
      + '<td><b>' + p.name + '</b></td>'
      + '<td><span class="badge bg-secondary">' + p.category + '</span></td>'
      + '<td style="color:var(--color-accent); font-weight:700;">$' + p.price.toFixed(2) + '</td>'
      + '<td>' + p.supplier + '</td>'
      + '<td>' + stockBadge + '</td>'
      + '<td style="color:#f59e0b;">' + stars + ' <small>(' + p.rating + ')</small></td>'
      + '<td>' + p.warranty + '</td>'
      + '</tr>';

    tableBody.innerHTML += row;
  }
}

/* ============================================================
   PAGE INIT — called by onload() on index.html
   ============================================================ */
function initPage() {
  // Start live clock (updates every second)
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // Start happy hour countdown (updates every second)
  updateHappyHour();
  setInterval(updateHappyHour, 1000);

  // Load products from JSON into table
  loadProductsFromJSON();
}
