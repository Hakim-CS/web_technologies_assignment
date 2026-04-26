/*
 * validation.js — TechNova Store
 * Form validation for add-item.html
 * Called directly from the form's submit event
 */

function validateAddItemForm() {
  var valid = true;

  var successAlert = document.getElementById('successAlert');
  var errorAlert   = document.getElementById('errorAlert');
  successAlert.style.display = 'none';
  errorAlert.style.display   = 'none';

  // --- Helper functions ---
  function setInvalid(fieldId, errorId) {
    var field = document.getElementById(fieldId);
    var err   = document.getElementById(errorId);
    if (field) field.classList.add('is-invalid');
    if (err)   err.style.display = 'block';
    valid = false;
  }

  function setValid(fieldId, errorId) {
    var field = document.getElementById(fieldId);
    var err   = document.getElementById(errorId);
    if (field) field.classList.remove('is-invalid');
    if (err)   err.style.display = 'none';
  }

  // --- 1. Product Name (required, min 2 chars) ---
  var name = document.getElementById('productName').value.trim();
  if (name.length < 2) {
    setInvalid('productName', 'productNameError');
    document.getElementById('productNameError').textContent = name === ''
      ? 'Product name is required.'
      : 'Name is too short (minimum 2 characters).';
  } else if (name.length > 100) {
    setInvalid('productName', 'productNameError');
    document.getElementById('productNameError').textContent = 'Name is too long (maximum 100 characters).';
  } else {
    setValid('productName', 'productNameError');
  }

  // --- 2. SKU (required) ---
  var sku = document.getElementById('productSKU').value.trim();
  if (sku === '') {
    setInvalid('productSKU', 'productSKUError');
    document.getElementById('productSKUError').textContent = 'SKU / Article number is required.';
  } else {
    setValid('productSKU', 'productSKUError');
  }

  // --- 3. Description (required, min 20 chars, max 1000) ---
  var desc = document.getElementById('productDescription').value.trim();
  if (desc === '') {
    setInvalid('productDescription', 'productDescriptionError');
    document.getElementById('productDescriptionError').textContent = 'Description is required.';
  } else if (desc.length < 20) {
    setInvalid('productDescription', 'productDescriptionError');
    document.getElementById('productDescriptionError').textContent
      = 'Description is too short (minimum 20 characters, currently ' + desc.length + ').';
  } else if (desc.length > 1000) {
    setInvalid('productDescription', 'productDescriptionError');
    document.getElementById('productDescriptionError').textContent = 'Description is too long (maximum 1000 characters).';
  } else {
    setValid('productDescription', 'productDescriptionError');
  }

  // --- 4. Price (required, > 0) ---
  var priceVal = document.getElementById('productPrice').value;
  var price    = parseFloat(priceVal);
  if (priceVal === '' || isNaN(price) || price <= 0) {
    setInvalid('productPrice', 'productPriceError');
    document.getElementById('productPriceError').textContent = 'Please enter a valid price greater than 0.';
  } else {
    setValid('productPrice', 'productPriceError');
  }

  // --- 5. Stock (required, >= 0, integer) ---
  var stockVal = document.getElementById('productStock').value;
  var stock    = parseInt(stockVal);
  if (stockVal === '' || isNaN(stock) || stock < 0) {
    setInvalid('productStock', 'productStockError');
    document.getElementById('productStockError').textContent = 'Please enter a valid stock quantity (0 or more).';
  } else {
    setValid('productStock', 'productStockError');
  }

  // --- 6. Category (required) ---
  var category = document.getElementById('productCategory').value;
  if (category === '') {
    setInvalid('productCategory', 'productCategoryError');
    document.getElementById('productCategoryError').textContent = 'Please select a category.';
  } else {
    setValid('productCategory', 'productCategoryError');
  }

  // --- 7. Supplier (required) ---
  var supplier = document.getElementById('productSupplier').value;
  if (supplier === '') {
    setInvalid('productSupplier', 'productSupplierError');
    document.getElementById('productSupplierError').textContent = 'Please select a supplier.';
  } else {
    setValid('productSupplier', 'productSupplierError');
  }

  // --- 8. Condition (radio — required) ---
  var condition = document.querySelector('input[name="condition"]:checked');
  var condError = document.getElementById('conditionError');
  if (!condition) {
    condError.style.display = 'block';
    condError.textContent   = 'Please select the product condition.';
    valid = false;
  } else {
    condError.style.display = 'none';
  }

  // --- 9. Availability (radio — required) ---
  var availability = document.querySelector('input[name="availability"]:checked');
  var availError   = document.getElementById('availabilityError');
  if (!availability) {
    availError.style.display = 'block';
    availError.textContent   = 'Please select availability status.';
    valid = false;
  } else {
    availError.style.display = 'none';
  }

  // --- 10. Date of Last Purchase (required) ---
  var date = document.getElementById('lastPurchaseDate').value;
  if (date === '') {
    setInvalid('lastPurchaseDate', 'lastPurchaseDateError');
    document.getElementById('lastPurchaseDateError').textContent = 'Please select the date of last purchase.';
  } else {
    setValid('lastPurchaseDate', 'lastPurchaseDateError');
  }

  // --- 11. Email (required, valid format) ---
  var email      = document.getElementById('contactEmail').value.trim();
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email === '') {
    setInvalid('contactEmail', 'contactEmailError');
    document.getElementById('contactEmailError').textContent = 'Supplier email is required.';
  } else if (!emailRegex.test(email)) {
    setInvalid('contactEmail', 'contactEmailError');
    document.getElementById('contactEmailError').textContent = 'Please enter a valid email address (e.g. name@domain.com).';
  } else {
    setValid('contactEmail', 'contactEmailError');
  }

  // --- 12. URL (optional, but if filled must start with http/https) ---
  var url    = document.getElementById('productURL').value.trim();
  var urlErr = document.getElementById('productURLError');
  if (url !== '' && !url.startsWith('http://') && !url.startsWith('https://')) {
    setInvalid('productURL', 'productURLError');
    document.getElementById('productURLError').textContent = 'URL must start with http:// or https://';
  } else {
    setValid('productURL', 'productURLError');
  }

  // --- 13. Terms checkbox (required) ---
  var terms     = document.getElementById('termsCheck').checked;
  var termsErr  = document.getElementById('termsError');
  if (!terms) {
    termsErr.style.display = 'block';
    termsErr.textContent   = 'You must agree to the Terms & Conditions to proceed.';
    valid = false;
  } else {
    termsErr.style.display = 'none';
  }

  // --- Result ---
  if (valid) {
    // Task 4: if onValidationSuccess() is defined on the page, call it (sends POST to server)
    // Otherwise fall back to local success display
    if (typeof onValidationSuccess === 'function') {
      onValidationSuccess();
    } else {
      successAlert.style.display = 'block';
      successAlert.classList.add('show');
      successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById('add-product-form').reset();
      var rv = document.getElementById('ratingValue');
      if (rv) rv.textContent = '3';
    }
  } else {
    errorAlert.style.display = 'block';
    errorAlert.classList.add('show');
    // Scroll to first invalid field
    var firstInvalid = document.querySelector('.is-invalid');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Clear error state when user starts typing / changing a field
function clearFieldError(fieldId, errorId) {
  var field = document.getElementById(fieldId);
  var err   = document.getElementById(errorId);
  if (field) field.classList.remove('is-invalid');
  if (err)   err.style.display = 'none';
}
