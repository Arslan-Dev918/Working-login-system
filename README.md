# 🔐 Complete Login System (React 19 + Express + MySQL + JWT)

A full-stack, production-ready Authentication system built with **React 19, Vite, Express.js, MySQL (XAMPP/phpMyAdmin), bcrypt password hashing, and JSON Web Token (JWT)** session security, featuring comprehensive **Roman Urdu comments** throughout all codebase files.

---

## 🛠️ Tech Stack

### Frontend:
- **React 19**: Modern functional components with hooks (`useState`, `useEffect`)
- **Vite**: Ultra-fast frontend development server
- **Axios**: HTTP client with request interceptors for automatic JWT token injection
- **Lucide React**: Modern icon set
- **Tailwind CSS**: Glassmorphic dark gradient UI design

### Backend:
- **Node.js & Express.js**: RESTful API web server
- **MySQL2**: Parameterized queries to prevent SQL Injection
- **bcryptjs**: Password hashing (10 Salt rounds)
- **jsonwebtoken (JWT)**: Secure session token generation and verification middleware
- **cors & dotenv**: Cross-Origin Resource Sharing & Environment variables

### Database:
- **MySQL (XAMPP / phpMyAdmin)**: Relational database with `users` table schema

---

## 📂 Complete Project Structure

```text
login-system/
├── client/                     # Standalone Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx      # Navigation header with user badge & logout
│   │   ├── pages/
│   │   │   ├── Login.jsx       # Login form with show/hide password & remember me
│   │   │   ├── Register.jsx    # User registration with live password strength check
│   │   │   └── Dashboard.jsx   # Protected user dashboard area
│   │   ├── services/
│   │   │   └── api.js          # Axios API client setup
│   │   ├── App.jsx             # Main application component & auth router
│   │   └── main.jsx            # Client DOM entry point
│   ├── .env                    # Client environment configuration
│   ├── package.json            # Client dependencies
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Standalone Backend API Server
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification middleware
│   ├── routes/
│   │   └── auth.js             # Register, Login, Profile & Logout endpoints
│   ├── .env                    # Server environment variables
│   ├── db.js                   # MySQL database connection pool & query engine
│   ├── package.json            # Server dependencies
│   └── server.js               # Express application entry point
│
├── database/
│   └── login_system.sql        # MySQL database creation & initial seed script
│
├── README.md                   # Comprehensive project documentation
└── .env.example                # Sample environment template
```

---

## 🚀 Step-by-Step Installation & Setup Guide

### 1. Prerequisites Installation

#### A. Install Node.js:
1. Download Node.js (v18 or higher recommended) from [https://nodejs.org](https://nodejs.org).
2. Install Node.js following the setup wizard.
3. Verify installation in terminal:
   ```bash
   node -v
   npm -v
   ```

#### B. Install XAMPP:
1. Download XAMPP from [https://www.apachefriends.org](https://www.apachefriends.org).
2. Install XAMPP and open **XAMPP Control Panel**.
3. Click **Start** next to **Apache** and **MySQL**.

---

### 2. Database Import (phpMyAdmin)

1. Open your web browser and go to `http://localhost/phpmyadmin`.
2. Click on **Import** in the top navigation bar.
3. Click **Choose File** and select `database/login_system.sql` from this project folder.
4. Click **Go** at the bottom of the page.
5. Verify that `login_system` database and `users` table are created.

Alternatively, execute the following command in MySQL CLI:
```sql
CREATE DATABASE IF NOT EXISTS login_system;
USE login_system;
```

---

### 3. Backend Setup & Run

1. Open a terminal window and navigate to the `server` directory (or root directory):
   ```bash
   cd server
   npm install
   ```
2. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will run at `http://localhost:5000` (or `http://localhost:3000` in full-stack dev mode).*

---

### 4. Frontend Setup & Run

1. Open a **second** terminal window and navigate to the `client` directory (or root):
   ```bash
   cd client
   npm install
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
3. Open your browser at `http://localhost:3000`.

---

## 🔑 Demo Account Credentials

A sample demo account is pre-configured in the database script and auto-fill button:

- **Email**: `ahmed@example.com`
- **Password**: `Password123!`

---

## 🌐 API Endpoints Specification

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/register` | Register a new user account | ❌ No |
| **POST** | `/api/login` | Authenticate user & return JWT token | ❌ No |
| **GET** | `/api/profile` | Get logged-in user details | ✅ Yes (Bearer Token) |
| **POST** | `/api/logout` | Terminate active user session | ❌ No |

---

## 📝 Roman Urdu Comments Example

All key backend and frontend blocks contain clear comments in Roman Urdu:

```javascript
// Database se connection establish kar rahe hain
const pool = mysql.createPool({ ... });

// Password ko hash kar rahe hain security ke liye
const hashedPassword = await bcrypt.hash(password, 10);

// JWT token generate kar rahe hain (24h validity)
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

// User ka data database mein save kar rahe hain
await executeQuery('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
```

---

## 🛠️ Troubleshooting

1. **MySQL Connection Error (`ECONNREFUSED` or `Access denied`)**:
   - Ensure MySQL is running in XAMPP Control Panel.
   - Check `server/.env` credentials (`DB_USER=root`, `DB_PASSWORD=`).
2. **CORS Error**:
   - Verify `cors()` middleware is mounted before routes in `server.js`.
3. **Invalid Token / 401 Unauthorized**:
   - Clear browser `localStorage` and perform a fresh login.

---

## 📜 License

Apache-2.0 / MIT - Open Source & Free to use for educational and commercial applications.
