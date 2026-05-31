# 🎓 Classic Examination Portal

A secure, full-stack online examination portal for colleges and universities.

---

## 📁 Project Structure

```
Test_portal/
├── backend/     — Node.js + Express REST API
└── frontend/    — React.js + Vite frontend
```

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React.js, Vite, Framer Motion       |
| Styling     | Vanilla CSS (custom design system)  |
| Backend     | Node.js, Express.js                 |
| Database    | PostgreSQL                          |
| Auth        | JWT (8h expiry) + bcrypt            |
| Security    | Helmet, CORS, Rate Limiting         |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL 14+

---

### 1. Database Setup

Open **pgAdmin** or **psql** and run:

```sql
CREATE DATABASE exam_portal;
```

Then run the schema:
```bash
psql -U postgres -d exam_portal -f backend/models/schema.sql
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `backend/.env` — update your PostgreSQL password:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/exam_portal
JWT_SECRET=classic_exam_portal_super_secret_jwt_key_2024
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

On first startup, the default admin account is auto-created:
- **User ID:** `MGMT001`
- **Password:** `Admin@1234`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 👤 User Roles & Login Flow

| Role       | Created By  | Default Login          |
|------------|-------------|------------------------|
| Management | Auto-seeded | MGMT001 / Admin@1234   |
| Staff      | Management  | Created via portal     |
| Student    | Staff       | Created via portal     |

> ⚠️ All users must change their password on **first login**.

---

## 🔗 API Endpoints

| Route                             | Method | Auth        | Description              |
|-----------------------------------|--------|-------------|--------------------------|
| `/api/auth/login`                 | POST   | Public      | Login all roles          |
| `/api/auth/change-password`       | POST   | Any role    | Change password          |
| `/api/management/stats`           | GET    | Management  | Dashboard stats          |
| `/api/management/create-staff`    | POST   | Management  | Create staff account     |
| `/api/management/staff`           | GET    | Management  | List all staff           |
| `/api/management/students`        | GET    | Management  | List all students        |
| `/api/staff/create-test`          | POST   | Staff       | Create exam              |
| `/api/staff/tests`                | GET    | Staff       | List my tests            |
| `/api/staff/tests/:id/questions`  | POST   | Staff       | Add question             |
| `/api/staff/tests/:id/enroll`     | POST   | Staff       | Enroll students          |
| `/api/staff/results/:id`          | GET    | Staff       | View results             |
| `/api/staff/create-student`       | POST   | Staff       | Create student account   |
| `/api/student/tests`              | GET    | Student     | My enrolled tests        |
| `/api/student/tests/:id`          | GET    | Student     | Get test + questions     |
| `/api/student/tests/:id/submit`   | POST   | Student     | Submit answers           |
| `/api/student/tests/:id/warning`  | POST   | Student     | Record violation         |
| `/api/student/results`            | GET    | Student     | My results               |

---

## 🔒 Security Features

- **JWT Authentication** — All routes protected with Bearer tokens
- **bcrypt Hashing** — Passwords never stored in plain text (salt rounds: 12)
- **Role-Based Access** — 401/403 returned for wrong role or missing token
- **Rate Limiting** — 100 req/15min general, 20 req/15min for login
- **Helmet** — Secure HTTP headers
- **No Self-Registration** — Accounts only created by authorized roles

---

## 🖥️ Anti-Cheat System

| Feature                    | Behavior                              |
|----------------------------|---------------------------------------|
| Fullscreen Enforcement     | Exam cannot start without fullscreen  |
| Fullscreen Exit Detection  | Immediate warning + re-enter prompt   |
| Tab Switch Detection       | Visibility change triggers warning    |
| 3-Warning Auto-Submit      | Exam auto-submitted after 3 violations|
| Copy/Paste Block           | Ctrl+C, Ctrl+V, Ctrl+A disabled       |
| F12 / DevTools Block       | F12, Ctrl+Shift+I disabled            |
| Right-click Disabled       | contextmenu prevented                 |
| Auto-Save                  | Answers saved every 10 seconds        |
| Timer Auto-Submit          | Auto-submits when exam time ends      |

---

## 🏗️ Workflow

```
Management → Creates Staff Account
     ↓
Staff → Creates Test → Adds Questions → Enrolls Students
     ↓
Student → Logs In → Attends Test (Fullscreen) → Gets Score
     ↓
Staff → Views Results → Exports CSV
```

---

## 📦 Deployment

| Layer    | Platform      |
|----------|---------------|
| Frontend | Vercel        |
| Backend  | Render        |
| Database | MongoDB Atlas |

For production, set `NODE_ENV=production` and update `FRONTEND_URL` and `DATABASE_URL` in `.env`.

---

© 2024 Classic Examination Portal
