# ShopEZ - Modern E-Commerce Platform

ShopEZ is a full-stack e-commerce web application featuring a responsive design, customer reviews, order tracking, and a seller dashboard.

## Tech Stack
- **Frontend**: React, Tailwind CSS v3, React Router DOM, Axios, Lucide Icons
- **Backend**: Node.js, Express.js, JWT Auth, Mongoose (MongoDB)

---

## Setup Instructions

### 1. Configure MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database named `shopez`.
3. In Database Access, create a user with read/write privileges.
4. In Network Access, whitelist your IP address (or select `0.0.0.0/0` for testing).
5. Retrieve your application connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/shopez?retryWrites=true&w=majority`).
6. Open the file `server/.env` and replace the placeholder in `MONGO_URI` with your connection string:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/shopez?retryWrites=true&w=majority
   JWT_SECRET=shopez_secret_key_123456
   ```

### 2. Install Dependencies
Run the following command at the root of the project to install all dependencies for both frontend and backend:
```bash
npm run install-all
```

### 3. Seed the Database
Run the database seeder to create sample products and test accounts (customer and seller):
```bash
npm run seed
```

### 4. Start the Application
Start both the React client dev server and Node.js server concurrently:
```bash
npm start
```
- Frontend will run at: `http://localhost:5173`
- Backend API will run at: `http://localhost:5000`

---

## Pre-configured Test Accounts
After seeding, you can use these credentials to sign in:

* **Default Customer**:
  - Email: `customer@shopez.com`
  - Password: `password123`
* **Official Seller**:
  - Email: `seller@shopez.com`
  - Password: `password123`
