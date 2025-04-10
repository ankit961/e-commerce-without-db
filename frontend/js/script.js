let ITEM_CATALOG = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const productGrid = document.getElementById('productGrid');
const cartButton = document.getElementById('cartButton');
const cartDropdown = document.getElementById('cartDropdown');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Fetch items from backend
function fetchProducts() {
  fetch('http://localhost:5000/items')
    .then(res => res.json())
    .then(data => {
      ITEM_CATALOG = data;
      renderProducts();
      renderCart();
    })
    .catch(err => {
      console.error('Failed to fetch products:', err);
    });
}

// Render product cards
function renderProducts() {
  productGrid.innerHTML = ITEM_CATALOG.map(product => `
    <div class="product-card bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
      <div class="h-48 overflow-hidden">
        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
      </div>
      <div class="p-4">
        <h3 class="font-medium text-gray-800 mb-1">${product.name}</h3>
        <p class="text-indigo-600 font-bold mb-3">$${product.price.toFixed(2)}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center border border-gray-300 rounded-md">
            <button class="quantity-btn px-3 py-1 text-gray-600 hover:bg-gray-100" data-id="${product.id}" data-action="decrease">-</button>
            <input type="number" min="1" value="1" class="w-12 text-center border-x border-gray-300 py-1 quantity-input" data-id="${product.id}">
            <button class="quantity-btn px-3 py-1 text-gray-600 hover:bg-gray-100" data-id="${product.id}" data-action="increase">+</button>
          </div>
          <button class="add-to-cart-btn bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 transition-colors" data-id="${product.id}">
            Add
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Render cart items in dropdown
function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-gray-500 text-sm py-4 text-center">Your cart is empty</p>';
    cartTotal.textContent = '$0.00';
    cartBadge.classList.add('hidden');
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const product = ITEM_CATALOG.find(p => p.id === item.id);
    return `
      <div class="flex items-center py-2 border-b border-gray-100">
        <div class="w-12 h-12 bg-gray-100 rounded-md overflow-hidden mr-3">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-medium text-gray-800">${product.name}</h4>
          <p class="text-xs text-gray-500">$${product.price.toFixed(2)} × ${item.quantity}</p>
        </div>
        <div class="text-sm font-medium text-gray-800">
          $${(product.price * item.quantity).toFixed(2)}
        </div>
        <button class="ml-2 text-gray-400 hover:text-red-500 remove-item" data-id="${product.id}">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  }).join('');

  const total = cart.reduce((sum, item) => {
    const product = ITEM_CATALOG.find(p => p.id === item.id);
    return sum + (product.price * item.quantity);
  }, 0);

  cartTotal.textContent = `$${total.toFixed(2)}`;
  updateCartBadge();
}

// Update cart badge
function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems;
  cartBadge.classList.toggle('hidden', totalItems === 0);
}

// Show toast
function showToast(message) {
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Add to cart logic (sync with backend + local)
function addToCart(productId, quantity) {
  const backendItemId = `item${productId}`;

  fetch('http://localhost:5000/add-to-cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'user1',
      item_id: backendItemId,
      quantity: quantity
    })
  })
  .then(response => response.json())
  .then(() => {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ id: productId, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    showToast('Item added to cart!');
    cartButton.classList.add('animate-pulse-once');
    setTimeout(() => cartButton.classList.remove('animate-pulse-once'), 500);
  })
  .catch(() => showToast('Failed to add item to cart'));
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  showToast('Item removed from cart');
}

// === Event Listeners ===
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts(); // fetch items and render

  cartButton.addEventListener('click', () => cartDropdown.classList.toggle('hidden'));

  document.addEventListener('click', e => {
    if (!cartButton.contains(e.target) && !cartDropdown.contains(e.target)) {
      cartDropdown.classList.add('hidden');
    }

    // Quantity buttons
    if (e.target.classList.contains('quantity-btn')) {
      const productId = parseInt(e.target.dataset.id);
      const action = e.target.dataset.action;
      const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
      let quantity = parseInt(input.value);
      quantity = (action === 'increase') ? quantity + 1 : Math.max(1, quantity - 1);
      input.value = quantity;
    }

    // Add to cart
    if (e.target.classList.contains('add-to-cart-btn')) {
      const productId = parseInt(e.target.dataset.id);
      const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
      const quantity = parseInt(input.value);
      addToCart(productId, quantity);
    }

    // Remove from cart
    if (e.target.closest('.remove-item')) {
      const productId = parseInt(e.target.closest('.remove-item').dataset.id);
      removeFromCart(productId);
    }
  });

  // Restrict input to numbers only
  document.addEventListener('input', e => {
    if (e.target.classList.contains('quantity-input')) {
      e.target.value = e.target.value.replace(/[^0-9]/g, '') || '1';
    }
  });
});
