/**
 * JavaScript for Cart Page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load cart items
    loadCartItems();
    
    // Load categories for the modal
    loadCategories();
    
    // Event listeners for cart actions
    setupEventListeners();
});

/**
 * Setup event listeners for the cart page
 */
function setupEventListeners() {
    // Clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    clearCartBtn.addEventListener('click', function() {
        const confirmClear = confirm('Are you sure you want to clear your cart?');
        if (confirmClear) {
            clearCart();
        }
    });
    
    // Apply promo code button
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    applyPromoBtn.addEventListener('click', applyPromoCode);
    
    // Add event delegation for remove button and quantity changes
    document.addEventListener('click', function(event) {
        // Remove item button
        if (event.target.classList.contains('remove-item-btn')) {
            const bookId = event.target.getAttribute('data-book-id');
            showRemoveConfirmation(bookId);
        }
        
        // Quantity decrease button
        if (event.target.classList.contains('decrease-qty-btn')) {
            const bookId = event.target.getAttribute('data-book-id');
            decreaseQuantity(bookId);
        }
        
        // Quantity increase button
        if (event.target.classList.contains('increase-qty-btn')) {
            const bookId = event.target.getAttribute('data-book-id');
            increaseQuantity(bookId);
        }
    });
    
    // Confirm remove button in modal
    const confirmRemoveBtn = document.getElementById('confirmRemoveBtn');
    confirmRemoveBtn.addEventListener('click', function() {
        const bookId = this.getAttribute('data-book-id');
        removeCartItem(bookId);
        
        // Close the modal
        const removeItemModal = bootstrap.Modal.getInstance(document.getElementById('removeItemModal'));
        removeItemModal.hide();
    });
}

/**
 * Load and display cart items
 */
function loadCartItems() {
    const cartItems = CartService.getItems();
    const cartContent = document.getElementById('cartContent');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartItemsElement = document.getElementById('cartItems');
    
    // Show/hide appropriate elements based on cart status
    if (cartItems.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItemsContainer.style.display = 'none';
        return;
    } else {
        emptyCartMessage.style.display = 'none';
        cartItemsContainer.style.display = 'block';
    }
    
    // Clear existing items
    cartItemsElement.innerHTML = '';
    
    // Add each cart item to the table
    cartItems.forEach(item => {
        const itemRow = document.createElement('tr');
        
        itemRow.innerHTML = `
            <td>
                <a href="book-detail.html?id=${item.id}">
                    <img src="${item.cover}" alt="${item.title}" class="cart-item-image">
                </a>
            </td>
            <td class="text-start">
                <h5><a href="book-detail.html?id=${item.id}" class="text-decoration-none text-dark">${item.title}</a></h5>
                <p class="text-muted">by ${item.author}</p>
            </td>
            <td class="text-center">
                <div class="input-group cart-quantity">
                    <button class="btn btn-outline-secondary decrease-qty-btn" type="button" data-book-id="${item.id}">-</button>
                    <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
                    <button class="btn btn-outline-secondary increase-qty-btn" type="button" data-book-id="${item.id}">+</button>
                </div>
            </td>
            <td class="text-end">$${item.price.toFixed(2)}</td>
            <td class="text-end">$${(item.price * item.quantity).toFixed(2)}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-danger remove-item-btn" data-book-id="${item.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        cartItemsElement.appendChild(itemRow);
    });
    
    // Update order summary
    updateOrderSummary();
}

/**
 * Update the order summary with current prices
 */
function updateOrderSummary() {
    const orderTotal = CartService.calculateOrderTotal();
    
    // Update summary displays
    document.getElementById('subtotal').textContent = `$${orderTotal.subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `$${orderTotal.shipping.toFixed(2)}`;
    document.getElementById('totalPrice').textContent = `$${orderTotal.total.toFixed(2)}`;
    
    // Show discount if applicable
    const discountRow = document.getElementById('discountRow');
    if (orderTotal.discount > 0) {
        document.getElementById('discount').textContent = `-$${orderTotal.discount.toFixed(2)}`;
        discountRow.style.display = 'flex';
    } else {
        discountRow.style.display = 'none';
    }
    
    // Enable/disable checkout button based on cart status
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (CartService.getTotalItems() === 0) {
        checkoutBtn.classList.add('disabled');
    } else {
        checkoutBtn.classList.remove('disabled');
    }
}

/**
 * Apply a promo code to the order
 */
function applyPromoCode() {
    const promoCodeInput = document.getElementById('promoCode');
    const promoCode = promoCodeInput.value.trim();
    const promoMessage = document.getElementById('promoMessage');
    
    if (!promoCode) {
        promoMessage.innerHTML = '<div class="alert alert-warning mt-2">Please enter a promo code.</div>';
        return;
    }
    
    const result = CartService.applyPromoCode(promoCode);
    
    if (result.success) {
        promoMessage.innerHTML = '<div class="alert alert-success mt-2">Promo code applied successfully!</div>';
        updateOrderSummary();
    } else {
        promoMessage.innerHTML = '<div class="alert alert-danger mt-2">Invalid promo code. Please try again.</div>';
    }
}

/**
 * Show confirmation modal for removing an item
 * @param {String} bookId - ID of the book to remove
 */
function showRemoveConfirmation(bookId) {
    const confirmRemoveBtn = document.getElementById('confirmRemoveBtn');
    confirmRemoveBtn.setAttribute('data-book-id', bookId);
    
    // Show the modal
    const removeItemModal = new bootstrap.Modal(document.getElementById('removeItemModal'));
    removeItemModal.show();
}

/**
 * Remove an item from the cart
 * @param {String} bookId - ID of the book to remove
 */
function removeCartItem(bookId) {
    CartService.removeItem(bookId);
    loadCartItems();
}

/**
 * Clear the entire cart
 */
function clearCart() {
    CartService.clearCart();
    loadCartItems();
}

/**
 * Decrease the quantity of an item
 * @param {String} bookId - ID of the book to update
 */
function decreaseQuantity(bookId) {
    const cartItems = CartService.getItems();
    const item = cartItems.find(item => item.id === bookId);
    
    if (item && item.quantity > 1) {
        CartService.updateItemQuantity(bookId, item.quantity - 1);
        loadCartItems();
    }
}

/**
 * Increase the quantity of an item
 * @param {String} bookId - ID of the book to update
 */
function increaseQuantity(bookId) {
    const cartItems = CartService.getItems();
    const item = cartItems.find(item => item.id === bookId);
    
    if (item) {
        CartService.updateItemQuantity(bookId, item.quantity + 1);
        loadCartItems();
    }
}

/**
 * Load categories for the modal
 */
async function loadCategories() {
    const categoryModalListContainer = document.getElementById('categoryModalList');
    
    try {
        const categories = await ApiService.getCategories();
        
        // Clear any existing content
        categoryModalListContainer.innerHTML = '';
        
        // Add each category to the modal list
        categories.forEach(category => {
            const categoryItem = document.createElement('li');
            categoryItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            categoryItem.innerHTML = `
                <a href="books.html?category=${encodeURIComponent(category.name)}" class="text-decoration-none text-dark">
                    ${category.name}
                </a>
                <span class="badge bg-primary rounded-pill">${category.count}</span>
            `;
            
            categoryModalListContainer.appendChild(categoryItem);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        categoryModalListContainer.innerHTML = '<li class="list-group-item">Failed to load categories</li>';
    }
} 