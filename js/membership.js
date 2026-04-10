/*
 * membership.js — TechNova Store
 * Calculates membership fee based on selected package and number of members
 */

// Membership package prices (per person)
var PACKAGES = {
  monthly:   { label: "Monthly",   pricePerPerson: 4.99,  discount: 0 },
  quarterly: { label: "Quarterly", pricePerPerson: 12.99, discount: 5  },
  yearly:    { label: "Yearly",    pricePerPerson: 39.99, discount: 20 }
};

// Benefits per package
var BENEFITS = {
  monthly: [
    "5% discount on all purchases",
    "Early access to sales",
    "Monthly newsletter"
  ],
  quarterly: [
    "10% discount on all purchases",
    "5% extra discount (quarterly bonus)",
    "Priority customer support",
    "Exclusive deals every quarter"
  ],
  yearly: [
    "20% discount on all purchases",
    "20% extra loyalty discount",
    "Free shipping on all orders",
    "VIP support line",
    "Birthday bonus voucher",
    "Early access to new products"
  ]
};

function calculateMembership() {
  // Get inputs
  var packageKey = document.getElementById('memberPackage').value;
  var members    = parseInt(document.getElementById('memberCount').value);
  var name       = document.getElementById('memberName').value.trim();
  var email      = document.getElementById('memberEmail').value.trim();

  var resultDiv = document.getElementById('membership-result');
  var errorDiv  = document.getElementById('membership-error');

  // Hide previous results
  resultDiv.style.display = 'none';
  errorDiv.style.display  = 'none';

  // --- Validation ---
  var errors = [];

  if (name === '') errors.push('Full name is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email address is required.');
  if (!packageKey || !PACKAGES[packageKey]) errors.push('Please select a membership package.');
  if (isNaN(members) || members < 1) errors.push('Number of members must be at least 1.');
  if (members > 50) errors.push('Maximum 50 members per account.');

  if (errors.length > 0) {
    errorDiv.style.display = 'block';
    errorDiv.innerHTML = '<strong>Please fix the following:</strong><ul class="mb-0 mt-1">'
      + errors.map(function(e){ return '<li>' + e + '</li>'; }).join('')
      + '</ul>';
    return;
  }

  // --- Calculate ---
  var pkg           = PACKAGES[packageKey];
  var baseTotal     = pkg.pricePerPerson * members;
  var discountAmt   = (baseTotal * pkg.discount) / 100;
  var finalTotal    = baseTotal - discountAmt;

  // Build benefits list HTML
  var benefitItems = BENEFITS[packageKey].map(function(b){
    return '<li>✔ ' + b + '</li>';
  }).join('');

  // Build result HTML
  resultDiv.style.display = 'block';
  resultDiv.innerHTML =
    '<div class="alert alert-success mb-3">'
    + '✅ <strong>Membership calculated successfully!</strong>'
    + '</div>'

    + '<div class="row g-3">'

    + '<div class="col-md-6">'
    + '<div class="card p-3 h-100">'
    + '<h5 class="text-white mb-3">📋 Summary for <em>' + name + '</em></h5>'
    + '<table class="table table-bordered table-sm mb-0">'
    + '<tbody>'
    + '<tr><td>Package</td><td><strong>' + pkg.label + '</strong></td></tr>'
    + '<tr><td>Members</td><td>' + members + '</td></tr>'
    + '<tr><td>Price per person</td><td>$' + pkg.pricePerPerson.toFixed(2) + '</td></tr>'
    + '<tr><td>Base total</td><td>$' + baseTotal.toFixed(2) + '</td></tr>'
    + '<tr><td>Discount (' + pkg.discount + '%)</td><td class="text-success">-$' + discountAmt.toFixed(2) + '</td></tr>'
    + '<tr style="font-size:1.1rem;"><td><strong>Final Price</strong></td><td><strong style="color:var(--color-accent);">$' + finalTotal.toFixed(2) + '</strong></td></tr>'
    + '</tbody>'
    + '</table>'
    + '</div>'
    + '</div>'

    + '<div class="col-md-6">'
    + '<div class="card p-3 h-100">'
    + '<h5 class="text-white mb-3">🎁 ' + pkg.label + ' Benefits</h5>'
    + '<ul style="list-style:none; padding:0; color:var(--color-text);">' + benefitItems + '</ul>'
    + '</div>'
    + '</div>'

    + '</div>';

  resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
