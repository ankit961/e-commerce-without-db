let ITEM_CATALOG = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let discount = { code: null, amount: 0, percentage: 0 };

// DOM elements
const cartItemsContainer = document.getElementById('cartItemsContainer');
const itemCount = document.getElementById('itemCount');
const subtotal = document.getElementById('subtotal');
const totalAmount = document.getElementById('totalAmount');
const discountContainer = document.getElementById('discountContainer');
const discountAmount = document.getElementById('discountAmount');
const discountCode = document.getElementById('discountCode');
const applyDiscount = document.getElementById('applyDiscount');
const discountMessage = document.getElementById('discountMessage');
const discountForm = document.getElementById('discountForm');
const checkoutButton = document.getElementById('checkoutButton');

// Fetch product catalog from backend
function fetchProducts() {
  fetch('http://localhost:5000/items')
    .then(res => res.json())
    .then(data => {
      ITEM_CATALOG = data;
      renderCart();
    })
    .catch(err => {
      console.error("❌ Failed to fetch products:", err);
    });
}

// Render cart UI
function renderCart() {
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="p-6 text-center text-gray-500">
        <i class="fas fa-shopping-cart text-4xl mb-2 text-gray-300"></i>
        <p>Your cart is empty</p>
      </div>`;
    itemCount.textContent = '0';
    subtotal.textContent = '$0.00';
    totalAmount.textContent = '$0.00';
    checkoutButton.disabled = true;
    discountContainer.classList.add('hidden');
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => {
    const product = ITEM_CATALOG.find(p => p.id === item.id);
    return `
      <div class="fade-in p-4 flex items-start">
        <div class="w-20 h-20 bg-gray-100 rounded-md overflow-hidden mr-4 flex-shrink-0">
          <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
        </div>
        <div class="flex-1">
          <h4 class="font-medium text-gray-800">${product.name}</h4>
          <p class="text-sm text-gray-500">$${product.price.toFixed(2)}</p>
          <div class="mt-2 flex items-center">
            <div class="flex items-center border border-gray-300 rounded-md">
              <button class="quantity-btn px-2 py-1 text-gray-600 hover:bg-gray-100" data-id="${product.id}" data-action="decrease">
                <i class="fas fa-minus text-xs"></i>
              </button>
              <span class="w-8 text-center text-sm quantity">${item.quantity}</span>
              <button class="quantity-btn px-2 py-1 text-gray-600 hover:bg-gray-100" data-id="${product.id}" data-action="increase">
                <i class="fas fa-plus text-xs"></i>
              </button>
            </div>
            <button class="ml-4 text-red-500 hover:text-red-700 text-sm remove-item" data-id="${product.id}">
              <i class="fas fa-trash-alt mr-1"></i> Remove
            </button>
          </div>
        </div>
        <div class="font-medium text-gray-800">$${(product.price * item.quantity).toFixed(2)}</div>
      </div>
    `;
  }).join('');

  updateTotals();
  checkoutButton.disabled = false;
}

// Update subtotal/total
function updateTotals() {
  const itemTotal = cart.reduce((sum, item) => {
    const product = ITEM_CATALOG.find(p => p.id === item.id);
    return sum + (product.price * item.quantity);
  }, 0);

  const discountValue = discount.percentage ? itemTotal * discount.percentage : 0;
  const total = itemTotal - discountValue;

  itemCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  subtotal.textContent = `$${itemTotal.toFixed(2)}`;

  if (discount.percentage > 0) {
    discountContainer.classList.remove('hidden');
    discountAmount.textContent = `-$${discountValue.toFixed(2)}`;
  } else {
    discountContainer.classList.add('hidden');
  }

  totalAmount.textContent = `$${total.toFixed(2)}`;
}

// LocalStorage helpers
function updateLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateQuantity(productId, action) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    if (action === 'increase') item.quantity += 1;
    else if (action === 'decrease' && item.quantity > 1) item.quantity -= 1;
    updateLocalStorage();
    renderCart();
  }
}

function removeItem(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateLocalStorage();
  renderCart();
  if (cart.length === 0) {
    discount = { code: null, amount: 0, percentage: 0 };
    discountCode.value = '';
    discountMessage.classList.add('hidden');
    discountForm.classList.remove('discount-applied');
  }
}

// Apply discount code by checking admin stats
function applyDiscountCode() {
    const code = discountCode.value.trim();
  
    if (!code) {
      discountMessage.textContent = 'Please enter a discount code';
      discountMessage.classList.remove('hidden');
      discountMessage.classList.remove('text-green-600');
      discountMessage.classList.add('text-red-500');
      return;
    }
  
    // ✅ Check with backend if code is valid
    fetch('/validate-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        // ✅ Valid coupon — apply
        discount = {
          code,
          percentage: 0.10, // static 10%
          amount: 0
        };
        discountMessage.textContent = 'Discount applied: 10% off';
        discountMessage.classList.remove('text-red-500');
        discountMessage.classList.add('text-green-600');
        discountMessage.classList.remove('hidden');
        discountForm.classList.add('discount-applied');
        updateTotals();
      } else {
        // ❌ Invalid coupon — reset everything
        discount = { code: null, percentage: 0, amount: 0 };
        discountCode.value = '';
        discountMessage.textContent = 'Invalid or expired discount code';
        discountMessage.classList.remove('text-green-600');
        discountMessage.classList.add('text-red-500');
        discountMessage.classList.remove('hidden');
        discountForm.classList.remove('discount-applied');
        updateTotals();
      }
    })
    .catch(err => {
      console.error('❌ Error validating coupon:', err);
      alert('Something went wrong validating your discount code.');
    });
  }
  
// Checkout request with error handling
function checkout() {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
  
    fetch('http://localhost:5000/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'user1',
        discount_code: discount.code || null,
        cart: cart  // 🆕 send full cart to backend
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || 'Checkout failed'); });
        }
        return res.json();
      })
      .then(data => {
        alert(`Order placed!\nTotal Paid: $${data.total.toFixed(2)}`);
        cart = [];
        discount = { code: null, amount: 0, percentage: 0 };
        updateLocalStorage();
        renderCart();
      })
      .catch(err => {
        console.error("Checkout error", err);
        alert(`Checkout failed: ${err.message}`);
      });
  }
  

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();

  document.addEventListener('click', e => {
    if (e.target.classList.contains('quantity-btn') || e.target.closest('.quantity-btn')) {
      const button = e.target.closest('.quantity-btn');
      const productId = parseInt(button.dataset.id);
      const action = button.dataset.action;
      updateQuantity(productId, action);
    }

    if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
      const button = e.target.closest('.remove-item');
      const productId = parseInt(button.dataset.id);
      removeItem(productId);
    }
  });

  applyDiscount.addEventListener('click', applyDiscountCode);
  discountCode.addEventListener('keypress', e => {
    if (e.key === 'Enter') applyDiscountCode();
  });

  checkoutButton.addEventListener('click', checkout);
});
