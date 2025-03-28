/**
 * JavaScript for Checkout Page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load order summary
    loadOrderSummary();
    
    // Load categories for the modal
    loadCategories();
    
    // Setup event listeners
    setupEventListeners();
    
    // Toggle credit card details when payment method changes
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', togglePaymentDetails);
    });
});

/**
 * Setup event listeners for the page
 */
function setupEventListeners() {
    // Place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    placeOrderBtn.addEventListener('click', placeOrder);
    
    // Save shipping info checkbox
    const saveInfoCheckbox = document.getElementById('saveInfo');
    saveInfoCheckbox.addEventListener('change', function() {
        if (this.checked) {
            // This would save the info in localStorage or similar in a real app
            console.log('Shipping info will be saved');
        }
    });
    
    // Load saved info if available (commented out for this demo)
    /*
    if (localStorage.getItem('bookshelf_shipping_info')) {
        const savedInfo = JSON.parse(localStorage.getItem('bookshelf_shipping_info'));
        
        // Fill in the form fields with saved info
        document.getElementById('firstName').value = savedInfo.firstName || '';
        document.getElementById('lastName').value = savedInfo.lastName || '';
        // ... etc for all fields
    }
    */
}

/**
 * Load and display order summary
 */
function loadOrderSummary() {
    const cartItems = CartService.getItems();
    const orderItemsContainer = document.getElementById('orderItems');
    
    // Redirect to cart page if cart is empty
    if (cartItems.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    // Clear existing items
    orderItemsContainer.innerHTML = '';
    
    // Add each item to the summary
    cartItems.forEach(item => {
        const itemElement = document.createElement('li');
        itemElement.className = 'list-group-item d-flex justify-content-between lh-sm';
        
        itemElement.innerHTML = `
            <div>
                <h6 class="my-0">${item.title}</h6>
                <small class="text-muted">Quantity: ${item.quantity}</small>
            </div>
            <span class="text-muted">$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        
        orderItemsContainer.appendChild(itemElement);
    });
    
    // Update order totals
    updateOrderTotals();
}

/**
 * Update order total amounts
 */
function updateOrderTotals() {
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
}

/**
 * Toggle payment details based on selected payment method
 */
function togglePaymentDetails() {
    const creditCardDetails = document.getElementById('creditCardDetails');
    const creditCardRadio = document.getElementById('creditCard');
    
    if (creditCardRadio.checked) {
        creditCardDetails.style.display = 'block';
    } else {
        creditCardDetails.style.display = 'none';
    }
}

/**
 * Handle the order placement
 */
async function placeOrder() {
    // Validate the form
    if (!validateCheckoutForm()) {
        return;
    }
    
    // Get form data
    const formData = getFormData();
    
    // Get cart items
    const cartItems = CartService.getItems();
    const orderTotal = CartService.calculateOrderTotal();
    
    // Create order object
    const order = {
        customer: formData,
        items: cartItems,
        totals: orderTotal,
        paymentMethod: document.getElementById('creditCard').checked ? 'credit_card' : 'paypal',
        orderDate: new Date().toISOString()
    };
    
    try {
        // Disable the button and show loading state
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
        
        // Submit order to API
        const response = await ApiService.submitOrder(order);
        
        if (response.success) {
            // Save shipping info if checkbox is checked
            if (document.getElementById('saveInfo').checked) {
                localStorage.setItem('bookshelf_shipping_info', JSON.stringify(formData));
            }
            
            // Clear the cart
            CartService.clearCart();
            
            // Show confirmation with order details
            showOrderConfirmation(response.orderId, formData.email);
        } else {
            // Show error
            alert('There was an error processing your order. Please try again.');
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = 'Place Order';
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('There was an error processing your order. Please try again.');
        
        // Re-enable the button
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = 'Place Order';
    }
}

/**
 * Validate the checkout form
 * @returns {Boolean} Whether the form is valid
 */
function validateCheckoutForm() {
    // Get form elements
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    const city = document.getElementById('city');
    const state = document.getElementById('state');
    const zipCode = document.getElementById('zipCode');
    
    let isValid = true;
    
    // Validate required fields
    [firstName, lastName, email, phone, address, city, state, zipCode].forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() && !emailRegex.test(email.value)) {
        email.classList.add('is-invalid');
        isValid = false;
    }
    
    // Validate credit card details if credit card is selected
    if (document.getElementById('creditCard').checked) {
        const cardName = document.getElementById('cardName');
        const cardNumber = document.getElementById('cardNumber');
        const expiration = document.getElementById('expiration');
        const cvv = document.getElementById('cvv');
        
        [cardName, cardNumber, expiration, cvv].forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        // Validate card number format (simple validation)
        const cardNumberRegex = /^\d{13,19}$/;
        if (cardNumber.value.trim().replace(/\s/g, '') && !cardNumberRegex.test(cardNumber.value.trim().replace(/\s/g, ''))) {
            cardNumber.classList.add('is-invalid');
            isValid = false;
        }
        
        // Validate expiration date format (MM/YY)
        const expirationRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (expiration.value.trim() && !expirationRegex.test(expiration.value)) {
            expiration.classList.add('is-invalid');
            isValid = false;
        }
        
        // Validate CVV (3-4 digits)
        const cvvRegex = /^[0-9]{3,4}$/;
        if (cvv.value.trim() && !cvvRegex.test(cvv.value)) {
            cvv.classList.add('is-invalid');
            isValid = false;
        }
    }
    
    if (!isValid) {
        alert('Please fill in all required fields correctly.');
    }
    
    return isValid;
}

/**
 * Get form data from the checkout form
 * @returns {Object} Form data object
 */
function getFormData() {
    return {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value
    };
}

/**
 * Show order confirmation modal
 * @param {String} orderId - Order ID
 * @param {String} email - Customer email
 */
function showOrderConfirmation(orderId, email) {
    // Update confirmation details
    document.getElementById('orderNumber').textContent = orderId;
    document.getElementById('confirmationEmail').textContent = email;
    
    // Show the modal
    const orderConfirmationModal = new bootstrap.Modal(document.getElementById('orderConfirmationModal'));
    orderConfirmationModal.show();
    
    // Add event listener to redirect after modal is closed
    document.getElementById('orderConfirmationModal').addEventListener('hidden.bs.modal', function() {
        window.location.href = 'index.html';
    });
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