/**
 * Main JavaScript for BookShelf Homepage
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load featured books
    loadFeaturedBooks();
    
    // Load categories
    loadCategories();
    
    // Add event listener for search form
    const searchForm = document.querySelector('form[role="search"]');
    searchForm.addEventListener('submit', handleSearch);
});

/**
 * Load and display featured books on the homepage
 */
async function loadFeaturedBooks() {
    const featuredBooksContainer = document.getElementById('featuredBooks');
    
    try {
        const featuredBooks = await ApiService.getFeaturedBooks();
        
        // Clear loading spinner
        featuredBooksContainer.innerHTML = '';
        
        // Create book cards for each featured book
        featuredBooks.forEach(book => {
            const bookCard = createBookCard(book);
            featuredBooksContainer.appendChild(bookCard);
        });
    } catch (error) {
        console.error('Error loading featured books:', error);
        featuredBooksContainer.innerHTML = '<div class="col-12 text-center"><p>Failed to load featured books. Please try again later.</p></div>';
    }
}

/**
 * Load and display categories on the homepage
 */
async function loadCategories() {
    const categoriesListContainer = document.getElementById('categoriesList');
    const categoryModalListContainer = document.getElementById('categoryModalList');
    
    try {
        const categories = await ApiService.getCategories();
        
        // Clear any existing content
        categoriesListContainer.innerHTML = '';
        categoryModalListContainer.innerHTML = '';
        
        // Create category cards for the homepage
        categories.forEach(category => {
            const categoryCol = document.createElement('div');
            categoryCol.className = 'col-md-3 col-sm-6 mb-4';
            
            categoryCol.innerHTML = `
                <a href="books.html?category=${encodeURIComponent(category.name)}" class="text-decoration-none">
                    <div class="category-card">
                        <div class="overlay">
                            <h3>${category.name}</h3>
                        </div>
                    </div>
                </a>
            `;
            
            categoriesListContainer.appendChild(categoryCol);
            
            // Add category to modal list
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
        categoriesListContainer.innerHTML = '<div class="col-12 text-center"><p>Failed to load categories. Please try again later.</p></div>';
        categoryModalListContainer.innerHTML = '<li class="list-group-item">Failed to load categories. Please try again later.</li>';
    }
}

/**
 * Create a book card element for displaying a book
 * @param {Object} book - Book object
 * @returns {HTMLElement} Book card element
 */
function createBookCard(book) {
    const col = document.createElement('div');
    col.className = 'col-md-3 col-sm-6 mb-4';
    
    col.innerHTML = `
        <div class="card book-card h-100">
            <div class="book-cover">
                <a href="book-detail.html?id=${book.id}">
                    <img src="${book.cover}" class="card-img-top" alt="${book.title}">
                </a>
            </div>
            <div class="card-body">
                <h5 class="book-title">
                    <a href="book-detail.html?id=${book.id}" class="text-decoration-none text-dark">${book.title}</a>
                </h5>
                <p class="book-author">by ${book.author}</p>
                <div class="book-rating">
                    <div class="stars">
                        ${generateStarRating(book.rating)}
                    </div>
                </div>
                <p class="book-price">$${book.price.toFixed(2)}</p>
                <button class="btn btn-sm btn-primary add-to-cart-btn" data-book-id="${book.id}">Add to Cart</button>
            </div>
        </div>
    `;
    
    // Add event listener for add to cart button
    const addToCartBtn = col.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', function(event) {
        event.preventDefault();
        addToCart(book);
    });
    
    return col;
}

/**
 * Generate HTML for star rating display
 * @param {Number} rating - Rating value (0-5)
 * @returns {String} Star rating HTML
 */
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="bi bi-star-fill"></i>';
    }
    
    // Half star
    if (halfStar) {
        starsHtml += '<i class="bi bi-star-half"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="bi bi-star"></i>';
    }
    
    return starsHtml;
}

/**
 * Add a book to the cart
 * @param {Object} book - Book object to add
 */
function addToCart(book) {
    CartService.addItem(book, 1);
    
    // Show toast notification
    showToast(`"${book.title}" has been added to your cart.`);
}

/**
 * Handle the search form submission
 * @param {Event} event - Form submit event
 */
function handleSearch(event) {
    event.preventDefault();
    
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        window.location.href = `books.html?search=${encodeURIComponent(searchTerm)}`;
    }
}

/**
 * Show a toast notification
 * @param {String} message - Message to display
 */
function showToast(message) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toastId = 'toast-' + Date.now();
    const toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.id = toastId;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">BookShelf</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    toastContainer.appendChild(toastEl);
    
    // Initialize and show the toast
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    
    // Remove toast element after it's hidden
    toastEl.addEventListener('hidden.bs.toast', function() {
        toastEl.remove();
    });
}