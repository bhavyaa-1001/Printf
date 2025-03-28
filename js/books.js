/**
 * JavaScript for Books Listing Page
 */
// Store current state
const state = {
    currentPage: 1,
    currentSort: '',
    currentFilters: {
        category: 'all',
        priceMax: 100
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Set initial filters from URL parameters
    if (urlParams.has('category')) {
        state.currentFilters.category = urlParams.get('category');
    }
    
    if (urlParams.has('search')) {
        state.currentFilters.search = urlParams.get('search');
        document.getElementById('searchInput').value = state.currentFilters.search;
    }
    
    // Load categories for filter sidebar
    loadCategories();
    
    // Load books with initial filters
    loadBooks();
    
    // Add event listeners
    setupEventListeners();
});

/**
 * Setup all event listeners for the page
 */
function setupEventListeners() {
    // Search form
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', handleSearch);
    
    // Price range slider
    const priceRange = document.getElementById('priceRange');
    const priceRangeValue = document.getElementById('priceRangeValue');
    
    priceRange.addEventListener('input', function() {
        priceRangeValue.textContent = this.value;
    });
    
    // Apply filters button
    const applyFiltersBtn = document.getElementById('applyFilters');
    applyFiltersBtn.addEventListener('click', applyFilters);
    
    // Reset filters button
    const resetFiltersBtn = document.getElementById('resetFilters');
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    // Sort options
    const sortOptions = document.querySelectorAll('.sort-option');
    sortOptions.forEach(option => {
        option.addEventListener('click', function() {
            const sortValue = this.getAttribute('data-sort');
            sortBooks(sortValue);
        });
    });
}

/**
 * Load and display categories for the filter sidebar
 */
async function loadCategories() {
    const categoryFiltersContainer = document.getElementById('categoryFilters');
    const categoryModalListContainer = document.getElementById('categoryModalList');
    
    try {
        const categories = await ApiService.getCategories();
        
        // Clear initial content (keeping the "All Categories" option)
        const allCategoriesCheckbox = document.getElementById('allCategories');
        categoryFiltersContainer.innerHTML = '';
        categoryFiltersContainer.appendChild(allCategoriesCheckbox.parentNode.cloneNode(true));
        categoryModalListContainer.innerHTML = '';
        
        // Add event listener to "All Categories" option
        document.getElementById('allCategories').addEventListener('change', function() {
            if (this.checked) {
                // Uncheck all other category filters
                document.querySelectorAll('.category-filter:not(#allCategories)').forEach(checkbox => {
                    checkbox.checked = false;
                });
            }
        });
        
        // Add category filters
        categories.forEach(category => {
            // Add to sidebar filters
            const categoryFilter = document.createElement('div');
            categoryFilter.className = 'form-check';
            categoryFilter.innerHTML = `
                <input class="form-check-input category-filter" type="checkbox" value="${category.name}" id="category-${category.id}">
                <label class="form-check-label" for="category-${category.id}">
                    ${category.name} <span class="text-muted">(${category.count})</span>
                </label>
            `;
            
            categoryFiltersContainer.appendChild(categoryFilter);
            
            // Add event listener to category checkbox
            const checkbox = categoryFilter.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    // Uncheck "All Categories" if a specific category is selected
                    document.getElementById('allCategories').checked = false;
                }
            });
            
            // Add to modal list
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
        
        // Check the current category filter
        if (state.currentFilters.category !== 'all') {
            const categoryCheckbox = document.querySelector(`.category-filter[value="${state.currentFilters.category}"]`);
            if (categoryCheckbox) {
                categoryCheckbox.checked = true;
                document.getElementById('allCategories').checked = false;
            }
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        categoryFiltersContainer.innerHTML = '<p class="text-danger">Failed to load categories</p>';
        categoryModalListContainer.innerHTML = '<li class="list-group-item">Failed to load categories</li>';
    }
}

/**
 * Load and display books with current filters and pagination
 */
async function loadBooks() {
    const booksGrid = document.getElementById('booksGrid');
    
    try {
        // Show loading spinner
        booksGrid.innerHTML = `
            <div class="text-center w-100">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        
        // Fetch books with current state
        const response = await ApiService.getBooks(
            state.currentFilters,
            state.currentPage,
            state.currentSort
        );
        
        const books = response.books;
        const pagination = response.pagination;
        
        // Clear loading spinner
        booksGrid.innerHTML = '';
        
        // Create book cards
        if (books.length > 0) {
            books.forEach(book => {
                const bookCard = createBookCard(book);
                booksGrid.appendChild(bookCard);
            });
            
            // Update pagination
            updatePagination(pagination);
        } else {
            booksGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <h3>No books found</h3>
                    <p>Try changing your search criteria or filters.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading books:', error);
        booksGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3>Error loading books</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

/**
 * Create a book card element for the grid
 * @param {Object} book - Book object
 * @returns {HTMLElement} Book card element
 */
function createBookCard(book) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 mb-4';
    
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
                <div class="d-grid">
                    <button class="btn btn-primary add-to-cart-btn" data-book-id="${book.id}">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listener for add to cart button
    const addToCartBtn = col.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', function() {
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
 * Update pagination controls
 * @param {Object} pagination - Pagination information
 */
function updatePagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';
    
    if (pagination.totalPages <= 1) {
        return;
    }
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${pagination.page === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    
    if (pagination.page > 1) {
        prevLi.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            changePage(pagination.page - 1);
        });
    }
    
    paginationContainer.appendChild(prevLi);
    
    // Page numbers
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.totalPages, pagination.page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === pagination.page ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        
        if (i !== pagination.page) {
            pageLi.querySelector('a').addEventListener('click', function(e) {
                e.preventDefault();
                changePage(i);
            });
        }
        
        paginationContainer.appendChild(pageLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    
    if (pagination.page < pagination.totalPages) {
        nextLi.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            changePage(pagination.page + 1);
        });
    }
    
    paginationContainer.appendChild(nextLi);
}

/**
 * Change the current page and reload books
 * @param {Number} page - Page number to change to
 */
function changePage(page) {
    state.currentPage = page;
    window.scrollTo(0, 0);
    loadBooks();
}

/**
 * Sort books by the specified sort option
 * @param {String} sortOption - Sort option
 */
function sortBooks(sortOption) {
    state.currentSort = sortOption;
    state.currentPage = 1;
    
    // Update sort dropdown button text
    const sortDropdown = document.getElementById('sortDropdown');
    const selectedOption = document.querySelector(`.sort-option[data-sort="${sortOption}"]`);
    
    if (selectedOption) {
        sortDropdown.textContent = selectedOption.textContent;
    }
    
    loadBooks();
}

/**
 * Apply filters from the filter form
 */
function applyFilters() {
    // Get category filters
    const allCategoriesCheckbox = document.getElementById('allCategories');
    const categoryCheckboxes = document.querySelectorAll('.category-filter:not(#allCategories):checked');
    
    if (allCategoriesCheckbox.checked || categoryCheckboxes.length === 0) {
        state.currentFilters.category = 'all';
    } else {
        // Get first selected category (for simplicity in this version)
        state.currentFilters.category = categoryCheckboxes[0].value;
    }
    
    // Get price range
    state.currentFilters.priceMax = document.getElementById('priceRange').value;
    
    // Reset to first page
    state.currentPage = 1;
    
    // Load books with new filters
    loadBooks();
}

/**
 * Reset all filters to default values
 */
function resetFilters() {
    // Reset category filters
    document.getElementById('allCategories').checked = true;
    document.querySelectorAll('.category-filter:not(#allCategories)').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset price range
    const priceRange = document.getElementById('priceRange');
    priceRange.value = 100;
    document.getElementById('priceRangeValue').textContent = '100';
    
    // Reset state
    state.currentFilters = {
        category: 'all',
        priceMax: 100
    };
    state.currentPage = 1;
    
    // Remove search query if present
    if (state.currentFilters.search) {
        delete state.currentFilters.search;
        document.getElementById('searchInput').value = '';
    }
    
    // Load books with reset filters
    loadBooks();
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
        state.currentFilters.search = searchTerm;
    } else {
        delete state.currentFilters.search;
    }
    
    state.currentPage = 1;
    loadBooks();
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