# Qwipo-Assignment - Customer Records CRUD App

This is a **full-stack Customer Management System** built as part of the Qwipo assignment.  
It provides functionality to **create, read, update, and delete (CRUD)** customer records with a responsive React frontend and a Node.js + SQLite backend.

---

## 🚀 Features
- ➕ Add new customers  
- 📋 View all customers in a list/table  
- ✏️ Update existing customer details  
- ❌ Delete customer records  
- 👀 View customer detail page  
- 📱 Fully responsive UI (desktop & mobile)  
- 🔔 Toast notifications for user feedback  

---

## 🛠 Tech Stack

**Frontend (client)**
- React (Vite)  
- React Router  
- React Toastify  
- Custom responsive CSS  

**Backend (server)**
- Node.js + Express.js  
- SQLite (better-sqlite3)  
- dotenv  

---

## Base URL: [https://qwipo-assignment-1-ad8u.onrender.com]


| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| GET    | `/api/customers`     | Get all customers           |
| GET    | `/api/customers/:id` | Get a single customer by ID |
| POST   | `/api/customers`     | Create a new customer       |
| PUT    | `/api/customers/:id` | Update a customer by ID     |
| DELETE | `/api/customers/:id` | Delete a customer by ID     |





