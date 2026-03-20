# BooksHaven – Library Management System

BooksHaven is a web-based Library Management System designed to simplify and modernize the process of managing books and borrowing activities. The platform allows students to browse the library catalogue, view book details, and borrow or return books, while administrators can manage books, users, and borrowing records through an admin dashboard.

This project was developed as part of a university coursework to demonstrate full-stack web development, database design, RESTful APIs, and accessible user interface design.

---

## Features

### User Features

* User registration and login (session-based authentication)
* Browse the book catalogue + search/filter
* View detailed book information
* Borrow and return books
* View current borrowed books (Current / History)

### Admin Features

* Add, edit, and delete books
* Manage users
* Track borrowing records
* View borrowing history

---

## 🛠 Tech Stack

Frontend

* React
* Vite

Backend

* Django
* Django REST Framework

Database

* SQLite (local development)
* PostgreSQL (deployment/production)
---

## Project Structure

```
BooksHaven/
├── 📁 frontend/                          # React frontend application
│   ├── src/
│   │   ├── 📁 assets/                    # Static assets
│   │   │   ├── BooksHavenLogo.png
│   │   │   └── book_banner.png
│   │   │
│   │   ├── 📁 components/                # Reusable React components
│   │   │   ├── AdminNavbar.jsx           # Admin navigation bar
│   │   │   ├── AdminRoute.jsx            # Protected admin route component
│   │   │   ├── BookCard.jsx              # Book grid display component
│   │   │   ├── BookCatagoryList.jsx      # Category filter buttons
│   │   │   ├── ConfirmationDialog.jsx    # Reusable confirmation modal
│   │   │   ├── EditBookModal.jsx         # Edit book form modal
│   │   │   ├── EditUserModal.jsx         # Edit user form modal
│   │   │   ├── AddNewBookModal.jsx       # Add book form modal
│   │   │   ├── AddUserModal.jsx          # Add user form modal
│   │   │   ├── BorrowBookModal.jsx       # Borrow book modal
│   │   │   ├── BorrowedBookList.jsx      # Display borrowed books list
│   │   │   ├── Navbar.jsx                # User navigation bar
│   │   │   ├── ProtectedRoute.jsx        # Protected user route component
│   │   │   ├── ReturnBookModal.jsx       # Return book modal
│   │   │   ├── SearchBar.jsx             # Search input component
│   │   │   ├── Spinner.jsx               # Loading spinner
│   │   │   └── UserSearchBar.jsx         # User search component
│   │   │
│   │   ├── 📁 context/                   # Context API state management
│   │   │   ├── BookContext.jsx           # Book state and filtering logic
│   │   │   └── UserContext.jsx           # User authentication state
│   │   │
│   │   ├── 📁 pages/                     # Page components (full page views)
│   │   │   ├── AdminLogin.jsx            # Admin login page
│   │   │   ├── AdminManageUsers.jsx      # User management page
│   │   │   ├── AdminPanel.jsx            # Book management dashboard
│   │   │   ├── BookCatalogue.jsx         # Browse all books page
│   │   │   ├── BookDetail.jsx            # Single book detail page
│   │   │   ├── Dashboard.jsx             # User home page
│   │   │   ├── Login.jsx                 # User login page
│   │   │   ├── MyBorrowings.jsx          # User borrowing history page
│   │   │   └── Signup.jsx                # User registration page
│   │   │
│   │   ├── 📁 api/                       # API service calls
│   │   │   └── bookservice.js            # Book API endpoints
│   │   │
│   │   ├── App.jsx                       # Main app component with routing
│   │   ├── main.jsx                      # React entry point
│   │   └── index.css                     # Global styles
│   │
│   ├── public/
│   │   ├── index.html
│   │   └── vite.svg
│   │
│   ├── package.json                      # Frontend dependencies
│   ├── vite.config.js                    # Vite configuration
│   ├── tailwind.config.js                # Tailwind CSS configuration
│   └── postcss.config.js                 # PostCSS configuration
│
├── 📁 backend/                           # Django backend application
│   ├── BooksHaven/                       # Main Django project
│   │   ├── settings.py                   # Django settings
│   │   ├── urls.py                       # Main URL routing
│   │   ├── wsgi.py                       # WSGI configuration
│   │   └── asgi.py                       # ASGI configuration
│   │
│   ├── 📁 books/                         # Books app
│   │   ├── migrations/                   # Database migrations
│   │   ├── __init__.py
│   │   ├── admin.py                      # Django admin configuration
│   │   ├── apps.py                       # App configuration
│   │   ├── models.py                     # Book model definition
│   │   ├── serializers.py                # DRF serializers
│   │   ├── urls.py                       # Books app URL routing
│   │   ├── views.py                      # Book API views
│   │   └── 📁 tests/            
│   │       ├── __init__.py
│   │       ├── test_admin_permissions.py # Unit tests
│   │       └── test_loans.py
│   │
│   ├── 📁 library_backend/               # Library loans app
│   │   ├── migrations/                   # Database migrations
│   │   ├── __init__.py
│   │   ├── admin.py                      # Django admin configuration
│   │   ├── apps.py                       # App configuration
│   │   ├── models.py                     # Loan and related models
│   │   ├── serializers.py                # DRF serializers
│   │   ├── urls.py                       # Loans app URL routing
│   │   ├── views.py                      # Loan API views
│   │   └── tests.py                      # Unit tests
│   │
│   ├── 📁 users/                         # Users/Authentication app
│   │   ├── migrations/                   # Database migrations
│   │   ├── __init__.py
│   │   ├── admin.py                      # Django admin configuration
│   │   ├── apps.py                       # App configuration
│   │   ├── models.py                     # User profile model
│   │   ├── serializers.py                # DRF serializers
│   │   ├── urls.py                       # Users app URL routing
│   │   ├── views.py                      # User API views
│   │   └── tests.py                      # Unit tests
│   │
│   ├── 📁 media/                         # Uploaded files (book covers)
│   │   └── books/                        # Book cover images storage
│   │       ├── ebook_covers/
│   │       ├── Harry_potter_series/
│   │       ├── clean_code_*.jpg
│   │       └── [other book covers]
│   │
│   ├── manage.py                         # Django management command
│   ├── requirements.txt                  # Python dependencies
│   └── db.sqlite3                        # SQLite database (development)
│
├── 📄 .gitignore                         # Git ignore rules
├── 📄 README.md                          # This file
└── 📄 package.json                       # Root package configuration
```

---

## Installation

### Clone the repository

```
git clone https://github.com/PranayShelar26/BooksHaven.git
cd BooksHaven
```

---

### Setup Backend

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

### Setup Frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## System Architecture

React (Frontend)
⬇
Django REST API
⬇
SQLite / PostgreSQL Database

---

## Accessibility

The interface follows selected **WCAG 2.2 accessibility guidelines**, including:

* Proper color contrast
* Accessible form labels
* Keyboard navigation
* Focus indicators

---

## Contributors

* **Pranay Prakash Shelar** 
* **Bo Peng** 
* **Chenhao Yu** 

---

##  License

This project was developed for educational purposes as part of a university coursework.
