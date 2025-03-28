require 'sinatra'
require 'sinatra/json'
require 'sinatra/cross_origin'
require 'json'

# Enable CORS
configure do
  enable :cross_origin
end

before do
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
end

options '*' do
  response.headers['Allow'] = 'GET, POST, OPTIONS'
  200
end

# Sample book data for demonstration
def load_books
  [
    {
      id: '1',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      price: 12.99,
      cover: 'https://source.unsplash.com/random/800x1200?book',
      category: 'Fiction',
      rating: 4.8,
      description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. "To Kill A Mockingbird" became both an instant bestseller and a critical success when it was first published in 1960.',
      isbn: '978-0-06-112008-4',
      publisher: 'HarperCollins',
      publicationDate: '1960-07-11',
      language: 'English',
      pages: 336,
      availability: 'In Stock'
    },
    {
      id: '2',
      title: '1984',
      author: 'George Orwell',
      price: 10.99,
      cover: 'https://source.unsplash.com/random/800x1200?novel',
      category: 'Science Fiction',
      rating: 4.7,
      description: 'Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.',
      isbn: '978-0-452-28423-4',
      publisher: 'Penguin Books',
      publicationDate: '1949-06-08',
      language: 'English',
      pages: 328,
      availability: 'In Stock'
    },
    {
      id: '3',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      price: 9.99,
      cover: 'https://source.unsplash.com/random/800x1200?novel,classic',
      category: 'Classic',
      rating: 4.5,
      description: 'The Great Gatsby, F. Scott Fitzgerald\'s third book, stands as the supreme achievement of his career. This exemplary novel of the Jazz Age has been acclaimed by generations of readers.',
      isbn: '978-0-7432-7356-5',
      publisher: 'Scribner',
      publicationDate: '1925-04-10',
      language: 'English',
      pages: 180,
      availability: 'In Stock'
    },
    {
      id: '4',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      price: 8.99,
      cover: 'https://source.unsplash.com/random/800x1200?romance',
      category: 'Romance',
      rating: 4.6,
      description: 'One of the most popular novels in English literature, Jane Austen\'s Pride and Prejudice has charmed readers since its publication with the story of the witty Elizabeth Bennet and her prideful suitor, Mr. Darcy.',
      isbn: '978-0-14-143951-8',
      publisher: 'Penguin Classics',
      publicationDate: '1813-01-28',
      language: 'English',
      pages: 432,
      availability: 'In Stock'
    }
  ]
end

# Generate additional books for demonstration
def generate_books(count = 50)
  categories = ['Fiction', 'Science Fiction', 'Mystery', 'Romance', 'Biography', 'Self-Help', 'History', 'Fantasy']
  base_books = load_books
  
  additional_books = []
  (5..count).each do |i|
    category_index = (i % categories.length)
    
    additional_books << {
      id: i.to_s,
      title: "Book Title #{i}",
      author: "Author #{(i / 3) + 1}",
      price: (rand(30) + 5 + 0.99).round(2),
      cover: "https://source.unsplash.com/random/800x1200?book,#{i}",
      category: categories[category_index],
      rating: ((rand(10) + 30) / 10.0).round(1),
      description: "This is a sample description for Book #{i}. It contains information about the plot, characters, and themes of the book.",
      isbn: "978-1-23456-#{i.to_s.rjust(3, '0')}-0",
      publisher: 'BookShelf Publishing',
      publicationDate: '2023-01-15',
      language: 'English',
      pages: 300 + rand(200),
      availability: 'In Stock'
    }
  end
  
  base_books + additional_books
end

# Get all books (with filters, sorting, and pagination)
get '/api/books' do
  books = generate_books
  
  # Apply category filter
  if params[:category] && params[:category] != 'all'
    books = books.select { |book| book[:category] == params[:category] }
  end
  
  # Apply price filter
  if params[:price_max]
    max_price = params[:price_max].to_f
    books = books.select { |book| book[:price] <= max_price }
  end
  
  # Apply search filter
  if params[:search]
    search_term = params[:search].downcase
    books = books.select do |book|
      book[:title].downcase.include?(search_term) || 
      book[:author].downcase.include?(search_term)
    end
  end
  
  # Apply sorting
  case params[:sort]
  when 'title'
    books.sort_by! { |book| book[:title] }
  when 'title-desc'
    books.sort_by! { |book| book[:title] }.reverse!
  when 'price-asc'
    books.sort_by! { |book| book[:price] }
  when 'price-desc'
    books.sort_by! { |book| book[:price] }.reverse!
  end
  
  page = (params[:page] || 1).to_i
  per_page = 12
  total_items = books.length
  total_pages = (total_items.to_f / per_page).ceil
  
  start_index = (page - 1) * per_page
  paginated_books = books[start_index, per_page] || []
  
  json({
    books: paginated_books,
    pagination: {
      page: page,
      perPage: per_page,
      totalItems: total_items,
      totalPages: total_pages
    }
  })
end

# Get featured books
get '/api/books/featured' do
  featured_books = load_books
  json(featured_books)
end

# Get a specific book by ID
get '/api/books/:id' do
  books = generate_books
  book = books.find { |b| b[:id] == params[:id] }
  
  if book
    json(book)
  else
    status 404
    json({ error: 'Book not found' })
  end
end

# Get all categories
get '/api/categories' do
  categories = [
    { id: '1', name: 'Fiction', count: 25 },
    { id: '2', name: 'Science Fiction', count: 18 },
    { id: '3', name: 'Mystery', count: 15 },
    { id: '4', name: 'Romance', count: 12 },
    { id: '5', name: 'Biography', count: 10 },
    { id: '6', name: 'Self-Help', count: 8 },
    { id: '7', name: 'History', count: 14 },
    { id: '8', name: 'Fantasy', count: 20 }
  ]
  
  json(categories)
end

# Create a new order
post '/api/orders' do
  # Parse request body
  request_payload = JSON.parse(request.body.read, symbolize_names: true)
  
  # In a real application, we would validate and store the order in a database
  # For demonstration, we'll just return a success response
  order_id = "ORD-#{Time.now.to_i}-#{rand(1000..9999)}"
  
  json({
    success: true,
    orderId: order_id,
    message: 'Order placed successfully'
  })
end

# Default route
get '/' do
  'BookShelf API is running!'
end 