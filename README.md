# BookShelf - Online Bookstore

A responsive online bookstore application built with HTML, JavaScript, Bootstrap, and Ruby backend.

## Features

- Browse featured books on the homepage
- Search and filter books by category and price
- View detailed book information
- Add books to shopping cart
- Checkout system
- Responsive design works on mobile and desktop

## Technical Stack

- **Frontend**: HTML, JavaScript, Bootstrap
- **Backend**: Ruby with Sinatra
- **API**: RESTful JSON API

## Project Structure

```
/
├── index.html              # Homepage
├── books.html              # Books listing page
├── book-detail.html        # Book detail page
├── cart.html               # Shopping cart
├── checkout.html           # Checkout page
├── css/
│   └── styles.css          # Custom CSS styles
├── js/
│   ├── api.js              # API service for communicating with backend
│   ├── cart.js             # Cart management
│   ├── main.js             # Homepage functionality
│   ├── books.js            # Books listing page functionality
│   ├── book-detail.js      # Book detail page functionality
│   ├── cart-page.js        # Cart page functionality
│   └── checkout.js         # Checkout page functionality
├── app.rb                  # Ruby backend application
├── Gemfile                 # Ruby dependencies
├── config.ru               # Rack configuration for deployment
└── README.md               # This file
```

## Running the Application

### Frontend

The frontend is built with static HTML, CSS, and JavaScript, so it can be served from any web server. For development, you can use a simple local server:

#### Using Python:

```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

Then open http://localhost:8000 in your browser.

### Backend (Ruby)

1. Install Ruby (if not already installed)
2. Install Bundler: `gem install bundler`
3. Install dependencies: `bundle install`
4. Run the server: `bundle exec ruby app.rb`

The Ruby backend will run on http://localhost:4567 by default.

## Deployment

### Frontend Deployment

The frontend can be deployed to:
- GitHub Pages
- Vercel
- Netlify
- Any static web hosting service

### Backend Deployment

The Ruby backend can be deployed to:
- Heroku
- Railway
- Any server supporting Ruby applications

## API Endpoints

- `GET /api/books/featured` - Get featured books
- `GET /api/books` - Get all books with filtering, sorting, and pagination
- `GET /api/books/:id` - Get a specific book by ID
- `GET /api/categories` - Get all categories
- `POST /api/orders` - Submit a new order 