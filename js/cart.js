/**
 * Cart Service for BookShelf
 * Handles all shopping cart functionality
 */
const CartService = {
    /**
     * Get the current cart items
     * @returns {Array} Array of cart items
     */
    getItems: function() {
        const cartItems = localStorage.getItem('bookshelf_cart');
        return cartItems ? JSON.parse(cartItems) : [];
    },
    
    /**
     * Add an item to the cart
     * @param {Object} book - Book object to add
     * @param {Number} quantity - Quantity to add
     * @returns {Object} Updated cart
     */
    addItem: function(book, quantity = 1) {
        const cart = this.getItems();
        const existingItemIndex = cart.findIndex(item => item.id === book.id);
        
        if (existingItemIndex !== -1) {
            // Item already exists, update quantity
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.push({
                id: book.id,
                title: book.title,
                author: book.author,
                price: book.price,
                cover: book.cover,
                quantity: quantity
            });
        }
        
        this._saveCart(cart);
        this._updateCartCount();
        
        return cart;
    },
    
    /**
     * Update an item's quantity in the cart
     * @param {String} bookId - ID of the book to update
     * @param {Number} quantity - New quantity
     * @returns {Object} Updated cart
     */
    updateItemQuantity: function(bookId, quantity) {
        const cart = this.getItems();
        const itemIndex = cart.findIndex(item => item.id === bookId);
        
        if (itemIndex !== -1) {
            if (quantity <= 0) {
                // Remove item if quantity is 0 or negative
                return this.removeItem(bookId);
            } else {
                cart[itemIndex].quantity = quantity;
                this._saveCart(cart);
                this._updateCartCount();
            }
        }
        
        return cart;
    },
    
    /**
     * Remove an item from the cart
     * @param {String} bookId - ID of the book to remove
     * @returns {Object} Updated cart
     */
    removeItem: function(bookId) {
        let cart = this.getItems();
        cart = cart.filter(item => item.id !== bookId);
        
        this._saveCart(cart);
        this._updateCartCount();
        
        return cart;
    },
    
    /**
     * Clear the cart
     * @returns {Object} Empty cart
     */
    clearCart: function() {
        this._saveCart([]);
        this._updateCartCount();
        
        return [];
    },
    
    /**
     * Get the total number of items in the cart
     * @returns {Number} Total items count
     */
    getTotalItems: function() {
        const cart = this.getItems();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },
    
    /**
     * Get the subtotal price of all items in the cart
     * @returns {Number} Subtotal price
     */
    getSubtotal: function() {
        const cart = this.getItems();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    /**
     * Apply a promo code to the order
     * @param {String} code - Promo code
     * @returns {Object} Discount information or error
     */
    applyPromoCode: function(code) {
        // Mock promo codes for now
        const validCodes = {
            'WELCOME10': { type: 'percentage', value: 10 },
            'SAVE20': { type: 'percentage', value: 20 },
            'FREESHIP': { type: 'shipping', value: 100 }
        };
        
        if (validCodes[code]) {
            localStorage.setItem('bookshelf_promo', JSON.stringify({
                code: code,
                discount: validCodes[code]
            }));
            
            return {
                success: true,
                discount: validCodes[code]
            };
        }
        
        return {
            success: false,
            message: 'Invalid promo code'
        };
    },
    
    /**
     * Get the active promo code if any
     * @returns {Object|null} Active promo information
     */
    getActivePromo: function() {
        const promo = localStorage.getItem('bookshelf_promo');
        return promo ? JSON.parse(promo) : null;
    },
    
    /**
     * Calculate the total price including shipping and discounts
     * @param {Number} shippingCost - Cost of shipping
     * @returns {Object} Total order information
     */
    calculateOrderTotal: function(shippingCost = 5.99) {
        const subtotal = this.getSubtotal();
        const promo = this.getActivePromo();
        let discount = 0;
        let shipping = shippingCost;
        
        if (promo) {
            if (promo.discount.type === 'percentage') {
                discount = subtotal * (promo.discount.value / 100);
            } else if (promo.discount.type === 'shipping') {
                shipping = shipping * (1 - promo.discount.value / 100);
            }
        }
        
        const total = subtotal - discount + shipping;
        
        return {
            subtotal: subtotal,
            discount: discount,
            shipping: shipping,
            total: total
        };
    },
    
    /**
     * Save the cart to localStorage
     * @private
     */
    _saveCart: function(cart) {
        localStorage.setItem('bookshelf_cart', JSON.stringify(cart));
    },
    
    /**
     * Update the cart count displayed in the UI
     * @private
     */
    _updateCartCount: function() {
        const cartCount = this.getTotalItems();
        const cartCountElements = document.querySelectorAll('#cartCount');
        
        cartCountElements.forEach(element => {
            element.textContent = cartCount;
            element.style.display = cartCount > 0 ? 'inline-block' : 'none';
        });
    }
};

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    CartService._updateCartCount();
});

// Export for use in other files
window.CartService = CartService; 