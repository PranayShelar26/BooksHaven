# 📚 BooksHaven – Library Management System

BooksHaven is a web-based Library Management System designed to simplify and modernize the process of managing books and borrowing activities. The platform allows students to browse the library catalogue, view book details, and borrow or return books, while administrators can manage books, users, and borrowing records through an admin dashboard.

This project was developed as part of a university coursework to demonstrate full-stack web development, database design, RESTful APIs, and accessible user interface design.

---

## 🚀 Features

### User Features

* User registration and login
* Browse the book catalogue
* View detailed book information
* Borrow and return books
* View current borrowed books

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

* SQLite / PostgreSQL

External API

* Google Books API (for book metadata)

---

## 🏗 Project Structure

```
BooksHaven
│
├── backend
│   ├── library_backend
│   ├── books
│   └── manage.py
│
├── frontend
│   ├── src
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### 1️⃣ Clone the repository

```
git clone https://github.com/PranayShelar26/BooksHaven.git
cd BooksHaven
```

---

### 2️⃣ Setup Backend

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

### 3️⃣ Setup Frontend

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

## 📊 System Architecture

React (Frontend)
⬇
Django REST API
⬇
SQLite / PostgreSQL Database

---

## ♿ Accessibility

The interface follows selected **WCAG 2.2 accessibility guidelines**, including:

* Proper color contrast
* Accessible form labels
* Keyboard navigation
* Focus indicators

---

## 👨‍💻 Contributors

* **Pranay Prakash Shelar** – Wireframes & Accessibility Plan
* **Bo Peng** – System Architecture & ER Diagram
* **Chenhao Yu** – Overview, User Stories, and Documentation

---

## 📄 License

This project was developed for educational purposes as part of a university coursework.
