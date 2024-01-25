# Grocery Management System

The Grocery Management System is a simple web application built with Node.js and Express that allows users to manage grocery items, perform CRUD operations, and book items from the inventory.

## Features

- Admin can add, view, update, and remove grocery items.
- Admin can manage the inventory of each item.
- Users can view the available grocery items.
- Users can book grocery items, and the system updates the inventory accordingly.

## Getting Started

To run this project locally, follow these steps:

### Prerequisites

- Node.js and npm installed on your machine.

### Installation

1. Clone the repository:

Navigate to the project directory:
cd qp-assessment
Install dependencies:
npm install
2 .Start the application:
npm start
The application will be running at http://localhost:3000.

Usage
As an admin, you can perform CRUD operations on grocery items.
As a user, you can view available grocery items and book them.
API Endpoints
Admin Endpoints:

POST /admin/addGroceryItem
GET /admin/viewGroceryItems
DELETE /admin/removeGroceryItem/:itemId
PUT /admin/updateGroceryItem/:itemId
PUT /admin/manageInventory/:itemId
User Endpoints:

GET /user/viewGroceryItems
POST /user/bookGroceryItems
Authentication:

POST /auth/login
