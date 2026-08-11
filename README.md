# 🚍 TransitOps – Smart Transport Operations Platform

A modern full-stack transport operations management platform designed to streamline fleet management, driver operations, trip scheduling, maintenance tracking, fuel monitoring, expense management, reporting, and analytics. Built with a scalable architecture, TransitOps enables organizations to efficiently manage day-to-day transport operations through secure role-based access and real-time insights.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Secure password hashing with bcrypt
- Refresh token support
- Role-Based Access Control (RBAC)
- Protected routes and middleware

### 👥 User Roles
- Fleet Manager
- Driver
- Safety Officer
- Financial Analyst

### 🚛 Fleet Management
- Vehicle registration and management
- Vehicle availability tracking
- Capacity management
- Vehicle assignment
- Fleet overview dashboard

### 👨‍✈️ Driver Management
- Driver profiles
- License validation
- Driver availability tracking
- Driver assignment
- Driver history

### 🛣️ Trip Management
- Trip creation and dispatch
- Trip completion workflow
- Trip cancellation
- Capacity validation
- Driver license verification
- Vehicle availability locking
- Trip status tracking

### 🔧 Maintenance Management
- Schedule vehicle maintenance
- Maintenance history
- Workshop management
- Automatic vehicle lock during maintenance
- Maintenance status tracking

### ⛽ Fuel Management
- Fuel log management
- Fuel expense tracking
- Fuel efficiency calculation
- Mileage monitoring

### 💰 Expense Management
- Expense recording
- Expense categorization
- Financial summaries
- Cost analysis

### 📊 Dashboard & Analytics
- Interactive dashboard
- KPI cards
- Charts and graphs
- Notifications
- Global search
- Filters
- Sorting
- Pagination

### 📄 Reports
- CSV Export
- PDF Export
- Operational reports
- Financial reports

### 🛡️ Security
- Helmet security headers
- CORS protection
- Rate limiting
- Request validation
- Environment validation
- Centralized error handling

---

# 🛠 Tech Stack

## Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- React Hook Form
- Zod
- TanStack Query
- Recharts
- shadcn-style UI Components

## Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt

## Database
- PostgreSQL
- Prisma ORM

## Deployment
- Docker
- Docker Compose

-----

# 📂 Project Structure

```text
TransitOps/

backend/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── lib/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── validators/
│
frontend/
│
├── src/
│   ├── auth/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   └── ...
│
docs/
│   └── API.md
│
postman/
│   └── TransitOps.postman_collection.json
│
docker-compose.yml
README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/your-username/TransitOps.git

cd TransitOps
```

---

## Quick Start (Docker)

```bash
cp .env.example .env

docker compose up --build
```

Open your browser:

```
http://localhost:5173
```

---

## Local Development

### Install Dependencies

```bash
npm install

npm install --prefix backend

npm install --prefix frontend
```

### Database Setup

```bash
npm run prisma:migrate --prefix backend

npm run seed --prefix backend
```

### Run Development Server

```bash
npm run dev
```

---

# 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | manager@transitops.local | TransitOps@123 |
| Driver | driver@transitops.local | TransitOps@123 |
| Safety Officer | safety@transitops.local | TransitOps@123 |
| Financial Analyst | finance@transitops.local | TransitOps@123 |

---

# 🔑 Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL=postgresql://username:password@localhost:5432/transitops

JWT_SECRET=your_jwt_secret

JWT_REFRESH_SECRET=your_refresh_secret

PORT=5000

NODE_ENV=development
```

---

# 📚 API Documentation

Detailed API documentation is available in:

```
docs/API.md
```

You can also import the ready-made Postman collection:

```
postman/TransitOps.postman_collection.json
```

---

# 📈 Key Capabilities

- Secure JWT Authentication
- Role-Based Access Control (RBAC)
- Fleet & Vehicle Management
- Driver Management
- Smart Trip Scheduling
- Vehicle Maintenance Tracking
- Fuel Consumption Analytics
- Expense Management
- Interactive Dashboard
- CSV & PDF Report Export
- Search, Filters & Pagination
- Production-ready Backend Architecture

---

# 🔮 Future Enhancements

- Live GPS Vehicle Tracking
- Route Optimization
- Driver Mobile Application
- Predictive Maintenance using AI
- Fuel Consumption Forecasting
- Real-time Notifications
- Email & SMS Alerts
- Multi-Organization Support
- Audit Logs
- Offline Support

---

# 📷 Screenshots

```
Dashboard

Fleet Management

Trip Management

Maintenance Module

Fuel Analytics

Reports
```

(Add project screenshots here.)

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

# 👨‍💻 Author

**Abhishek Patel**

GitHub: https://github.com/Abhishekpatel-1

LinkedIn: https://linkedin.com/in/abhishekpatel-mh3008

---

# 📄 License

This project is licensed under the **MIT License**.

---

## ⭐ Support

If you found this project useful, consider giving it a **Star** on GitHub.
