/**
 * JavaScript for Book Detail Page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get book ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (!bookId) {
        // Redirect to books page if no ID provided
        window.location.href = 'books.html';
        return;
    }
    
    // Load book details
    loadBookDetail(bookId);
    
    // Add event listeners for quantity buttons
    document.addEventListener('click', function(event) {
        if (event.target.id === 'decreaseQuantity') {
            const quantityInput = document.getElementById('quantity');
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        } else if (event.target.id === 'increaseQuantity') {
            const quantityInput = document.getElementById('quantity');
            const currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        }
    });
    
    // Load categories for the modal
    loadCategories();
});

/**
 * Load and display book details
 * @param {String} bookId - ID of the book to display
 */
async function loadBookDetail(bookId) {
    const bookDetailContainer = document.getElementById('bookDetail');
    
    try {
        // Fetch book data from API
        const book = await ApiService.getBookById(bookId);
        
        // Update page title and breadcrumb
        document.title = `${book.title} - BookShelf`;
        document.getElementById('bookTitleBreadcrumb').textContent = book.title;
        
        // Clear loading spinner
        bookDetailContainer.innerHTML = '';
        
        // Use template to create book detail
        const template = document.getElementById('bookDetailTemplate');
        const bookDetailContent = template.content.cloneNode(true);
        
        // Fill in book details
        bookDetailContent.querySelector('.book-cover-img').src = book.cover;
        bookDetailContent.querySelector('.book-cover-img').alt = book.title;
        bookDetailContent.querySelector('.book-title').textContent = book.title;
        bookDetailContent.querySelector('.book-author span').textContent = book.author;
        
        // Add categories
        const categoriesContainer = bookDetailContent.querySelector('.book-categories');
        categoriesContainer.innerHTML = `
            <span class="badge bg-secondary">${book.category}</span>
        `;
        
        // Add rating stars
        bookDetailContent.querySelector('.stars').innerHTML = generateStarRating(book.rating);
        
        // Price and availability
        bookDetailContent.querySelector('.book-price').textContent = `$${book.price.toFixed(2)}`;
        bookDetailContent.querySelector('.book-availability').textContent = book.availability;
        
        // Description
        bookDetailContent.querySelector('.book-description').innerHTML = `<p>${book.description}</p>`;
        
        // Book details
        bookDetailContent.querySelector('.book-isbn').textContent = book.isbn;
        bookDetailContent.querySelector('.book-publisher').textContent = book.publisher;
        bookDetailContent.querySelector('.book-publication-date').textContent = book.publicationDate;
        bookDetailContent.querySelector('.book-language').textContent = book.language;
        bookDetailContent.querySelector('.book-pages').textContent = book.pages;
        
        // Add event listener for "Add to Cart" button
        const addToCartBtn = bookDetailContent.querySelector('#addToCartBtn');
        addToCartBtn.addEventListener('click', function() {
            const quantity = parseInt(document.getElementById('quantity').value);
            addToCart(book, quantity);
        });
        
        // Append the populated template to the container
        bookDetailContainer.appendChild(bookDetailContent);
        
        // Load related books
        loadRelatedBooks(book.category, book.id);
    } catch (error) {
        console.error('Error loading book details:', error);
        bookDetailContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3>Error loading book details</h3>
                <p>Please try again later or <a href="books.html">browse all books</a>.</p>
            </div>
        `;
    }
}

/**
 * Load related books based on category
 * @param {String} category - Book category
 * @param {String} currentBookId - Current book ID to exclude from results
 */
async function loadRelatedBooks(category, currentBookId) {
    const relatedBooksContainer = document.getElementById('relatedBooks');
    
    try {
        // Fetch books in the same category
        const response = await ApiService.getBooks({ category: category }, 1, '');
        let relatedBooks = response.books.filter(book => book.id !== currentBookId);
        
        // Limit to 4 related books
        relatedBooks = relatedBooks.slice(0, 4);
        
        if (relatedBooks.length > 0) {
            relatedBooksContainer.innerHTML = '';
            
            // Create book cards for each related book
            relatedBooks.forEach(book => {
                const bookCard = createBookCard(book);
                relatedBooksContainer.appendChild(bookCard);
            });
        } else {
            relatedBooksContainer.innerHTML = '<p class="col-12">No related books found.</p>';
        }
    } catch (error) {
        console.error('Error loading related books:', error);
        relatedBooksContainer.innerHTML = '<p class="col-12">Failed to load related books.</p>';
    }
}

/**
 * Create a book card element for related books
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
        addToCart(book, 1);
    });
    
    return col;
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
 * @param {Number} quantity - Quantity to add
 */
function addToCart(book, quantity) {
    CartService.addItem(book, quantity);
    
    // Show toast notification
    showToast(`"${book.title}" has been added to your cart.`);
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