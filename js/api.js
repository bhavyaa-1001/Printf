/**
 * API Service for BookShelf
 * Handles all communication with the Ruby backend
 */
const API_BASE_URL = 'http://localhost:4567'; // Change this to your Ruby backend URL when deployed

const ApiService = {
    /**
     * Fetch featured books for the homepage
     * @returns {Promise<Array>} Array of featured book objects
     */
    getFeaturedBooks: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/books/featured`);
            return await this._handleResponse(response);
        } catch (error) {
            console.error('Error fetching featured books:', error);
            // For now, return mock data if API is not available
            return this._getMockFeaturedBooks();
        }
    },

    /**
     * Fetch all books with optional filters
     * @param {Object} filters - Filter options (category, price, search, etc.)
     * @param {Number} page - Page number for pagination
     * @param {String} sort - Sort option
     * @returns {Promise<Object>} Object with books array and pagination info
     */
    getBooks: async function(filters = {}, page = 1, sort = '') {
        try {
            let url = `${API_BASE_URL}/api/books?page=${page}`;
            
            if (filters.category && filters.category !== 'all') {
                url += `&category=${filters.category}`;
            }
            
            if (filters.priceMax) {
                url += `&price_max=${filters.priceMax}`;
            }
            
            if (filters.search) {
                url += `&search=${encodeURIComponent(filters.search)}`;
            }
            
            if (sort) {
                url += `&sort=${sort}`;
            }
            
            const response = await fetch(url);
            return await this._handleResponse(response);
        } catch (error) {
            console.error('Error fetching books:', error);
            // Return mock data if API is not available
            return this._getMockBooks(filters, page, sort);
        }
    },

    /**
     * Fetch a single book by ID
     * @param {String} id - Book ID
     * @returns {Promise<Object>} Book object
     */
    getBookById: async function(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/books/${id}`);
            return await this._handleResponse(response);
        } catch (error) {
            console.error(`Error fetching book with ID ${id}:`, error);
            // Return mock data if API is not available
            return this._getMockBookById(id);
        }
    },

    /**
     * Fetch all categories
     * @returns {Promise<Array>} Array of category objects
     */
    getCategories: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/categories`);
            return await this._handleResponse(response);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Return mock data if API is not available
            return this._getMockCategories();
        }
    },

    /**
     * Submit an order
     * @param {Object} orderData - Order data including customer info and cart items
     * @returns {Promise<Object>} Order confirmation object
     */
    submitOrder: async function(orderData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            return await this._handleResponse(response);
        } catch (error) {
            console.error('Error submitting order:', error);
            // Return mock response if API is not available
            return {
                success: true,
                orderId: this._generateOrderId(),
                message: 'Order placed successfully!'
            };
        }
    },

    /**
     * Helper method to handle API responses
     * @private
     */
    _handleResponse: async function(response) {
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    },

    /**
     * Generate a random order ID (for mock data only)
     * @private
     */
    _generateOrderId: function() {
        return 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    },

    // Mock data methods for development without backend
    
    /**
     * Get mock featured books
     * @private
     */
    _getMockFeaturedBooks: function() {
        return [
            {
                id: '1',
                title: 'To Kill a Mockingbird',
                author: 'Harper Lee',
                price: 12.99,
                cover: 'https://source.unsplash.com/random/800x1200?book',
                category: 'Fiction',
                rating: 4.8
            },
            {
                id: '2',
                title: '1984',
                author: 'George Orwell',
                price: 10.99,
                cover: 'https://source.unsplash.com/random/800x1200?novel',
                category: 'Science Fiction',
                rating: 4.7
            },
            {
                id: '3',
                title: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                price: 9.99,
                cover: 'https://source.unsplash.com/random/800x1200?novel,classic',
                category: 'Classic',
                rating: 4.5
            },
            {
                id: '4',
                title: 'Pride and Prejudice',
                author: 'Jane Austen',
                price: 8.99,
                cover: 'https://source.unsplash.com/random/800x1200?romance',
                category: 'Romance',
                rating: 4.6
            }
        ];
    },

    /**
     * Get mock books list with filtering and pagination
     * @private
     */
    _getMockBooks: function(filters = {}, page = 1, sort = '') {
        // Generate 20 mock books
        const allBooks = [];
        const categories = ['Fiction', 'Science Fiction', 'Mystery', 'Romance', 'Biography', 'Self-Help', 'History', 'Fantasy'];
        
        for (let i = 1; i <= 50; i++) {
            const categoryIndex = (i % categories.length);
            
            allBooks.push({
                id: i.toString(),
                title: `Book Title ${i}`,
                author: `Author ${Math.floor(i / 3) + 1}`,
                price: Math.floor(Math.random() * 30) + 5 + 0.99,
                cover: `https://source.unsplash.com/random/800x1200?book,${i}`,
                category: categories[categoryIndex],
                rating: (Math.floor(Math.random() * 10) + 30) / 10
            });
        }
        
        // Apply filters
        let filteredBooks = [...allBooks];
        
        if (filters.category && filters.category !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.category === filters.category);
        }
        
        if (filters.priceMax) {
            filteredBooks = filteredBooks.filter(book => book.price <= parseFloat(filters.priceMax));
        }
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(searchTerm) || 
                book.author.toLowerCase().includes(searchTerm)
            );
        }
        
        // Apply sorting
        if (sort) {
            switch (sort) {
                case 'title':
                    filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'title-desc':
                    filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
                    break;
                case 'price-asc':
                    filteredBooks.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    filteredBooks.sort((a, b) => b.price - a.price);
                    break;
                default:
                    break;
            }
        }
        
        // Pagination
        const perPage = 12;
        const totalPages = Math.ceil(filteredBooks.length / perPage);
        const startIndex = (page - 1) * perPage;
        const paginatedBooks = filteredBooks.slice(startIndex, startIndex + perPage);
        
        return {
            books: paginatedBooks,
            pagination: {
                page: page,
                perPage: perPage,
                totalItems: filteredBooks.length,
                totalPages: totalPages
            }
        };
    },

    /**
     * Get mock book details by ID
     * @private
     */
    _getMockBookById: function(id) {
        const mockBooks = this._getMockBooks().books;
        let book = mockBooks.find(book => book.id === id);
        
        if (!book) {
            book = {
                id: id,
                title: `Detailed Book ${id}`,
                author: `Author Name for Book ${id}`,
                price: 14.99,
                cover: `https://source.unsplash.com/random/800x1200?book,${id}`,
                category: 'Fiction',
                rating: 4.5,
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                isbn: `978-1-23456-${id.padStart(3, '0')}-0`,
                publisher: 'BookShelf Publishing',
                publicationDate: '2023-01-15',
                language: 'English',
                pages: 320,
                availability: 'In Stock'
            };
        } else {
            // Add extra details for the book detail page
            book.description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
            book.isbn = `978-1-23456-${id.padStart(3, '0')}-0`;
            book.publisher = 'BookShelf Publishing';
            book.publicationDate = '2023-01-15';
            book.language = 'English';
            book.pages = 320;
            book.availability = 'In Stock';
        }
        
        return book;
    },

    /**
     * Get mock categories
     * @private
     */
    _getMockCategories: function() {
        return [
            { id: '1', name: 'Fiction', count: 25 },
            { id: '2', name: 'Science Fiction', count: 18 },
            { id: '3', name: 'Mystery', count: 15 },
            { id: '4', name: 'Romance', count: 12 },
            { id: '5', name: 'Biography', count: 10 },
            { id: '6', name: 'Self-Help', count: 8 },
            { id: '7', name: 'History', count: 14 },
            { id: '8', name: 'Fantasy', count: 20 }
        ];
    }
};

// Export for use in other files
window.ApiService = ApiService; 