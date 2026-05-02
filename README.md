
<div align="center">

# 🏨 LuxStay — Hotel Booking System  

### 🚀 Production-Grade Full-Stack Java Application  

A **production-grade full-stack hotel booking platform** built using modern web technologies.  
LuxStay delivers a seamless and secure experience for users to search, book, and manage hotel reservations with real-time availability, loyalty rewards, and automated email notifications.

This project simulates a real-world system and demonstrates strong expertise in:
- Full-stack development (React + Spring Boot)
- Secure authentication using JWT and role-based access control
- Scalable backend architecture and REST API design
- End-to-end system integration with database and email services

It includes both **customer features** (booking, reviews, rewards) and **admin functionalities** (hotel, room, booking, and promo management), making it a complete end-to-end application.

---

## 🚀 Live Demo

🌐 **Try the Application:**  
👉 https://hotel-booking-system-ten-sand.vercel.app/

> ⚠️ Note: Backend may take a few seconds to respond if hosted on a free-tier service.

---

![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

</div>

---

## 🚀 Tech Stack

### Frontend
- React 18  
- React Router DOM  
- Axios  
- react-hot-toast  
- date-fns  

### Backend
- Spring Boot 3  
- Spring Security + JWT  
- Spring Data JPA (Hibernate)  

### Database
- MySQL 8  

### Other Integrations
- Brevo Transactional Email API  

---

## ✨ Key Features

### 👤 Customer Features
- 🔍 Advanced hotel search & filtering  
- 🛏️ Real-time room availability  
- 📅 Booking with unique reservation ID  
- 📧 Email notifications  
- 🎫 Promo codes  
- 💛 Loyalty rewards system  
- ⭐ Reviews & ratings  
- 🔐 Password reset  
- 📜 Booking history  
- 🔁 Quick rebooking  

---

### 🛡️ Admin Features
- 🏨 Hotel CRUD  
- 🛏️ Room management  
- 📊 Booking management  
- 🎫 Promo management  
- 👥 User management  
- 📈 Dashboard analytics  

---

### 🔒 Security & Performance
- JWT Authentication  
- Role-based authorization  
- BCrypt password hashing  
- Rate limiting  
- CORS configuration  
- Global exception handling  
- DTO validation  
- Async email processing  

---

## 🏗️ Architecture Overview

```

Controller → Service → Repository → Database
↓
DTO Layer (Validation & Mapping)

````

---

## ⚡ Quick Start

### Prerequisites
- Java 17+  
- Maven 3.9+  
- Node.js 18+  
- MySQL 8+  

---

### 1️⃣ Database Setup
```sql
CREATE DATABASE hotel_booking_db;
````

---

### 2️⃣ Backend Configuration

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hotel_booking_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

email.api.key=YOUR_BREVO_API_KEY
app.jwt.secret=YOUR_SECRET
app.frontend.url=http://localhost:3000
```

---

### 3️⃣ Run Backend

```bash
cd Backend/hotel-booking-backend
mvn spring-boot:run
```

👉 [http://localhost:8080](http://localhost:8080)

---

### 4️⃣ Run Frontend

```bash
cd Frontend/hotel-booking-frontend
npm install
npm start
```

👉 [http://localhost:3000](http://localhost:3000)

---

## 🔗 API Highlights

### Authentication

* POST `/api/auth/register`
* POST `/api/auth/login`
* POST `/api/auth/refresh`
* POST `/api/auth/forgot-password`
* POST `/api/auth/reset-password`

### Hotels & Rooms

* GET `/api/hotels`
* GET `/api/rooms/available`

### Bookings

* POST `/api/bookings`
* GET `/api/bookings/my`
* PUT `/api/bookings/{id}/cancel`

---

## 💛 Loyalty Rewards System

| Tier        | Points    | Benefits |
| ----------- | --------- | -------- |
| 🥉 Bronze   | 0–499     | Basic    |
| 🥈 Silver   | 500–1999  | 5%       |
| 🥇 Gold     | 2000–4999 | 10%      |
| 💎 Platinum | 5000+     | 15%      |

* Earn: **1 point per ₹100**
* Redeem: **100 points = ₹50**

---

## 📧 Email System

* Welcome Email
* Booking Confirmation
* Cancellation Email
* Password Reset Email

Powered by **Brevo HTTP API**

---

## 🔐 Security Highlights

* JWT Authentication
* Refresh token system
* BCrypt password hashing
* Protected routes
* Rate limiting

---

## 🌐 Frontend Routes

* `/` → Home
* `/hotels` → Listing
* `/login` → Auth
* `/book/:hotelId/:roomId` → Booking
* `/admin/*` → Dashboard

---

## 📌 Highlights

✔ Fully deployed full-stack application
✔ Clean architecture
✔ Real-world features
✔ Production-ready backend
✔ Strong system design

---

## 👨‍💻 Author

**Manohar Chirukuri**
📧 [manoharchirukuri09@gmail.com](mailto:manoharchirukuri09@gmail.com)
🔗 [https://www.linkedin.com/in/manoharchirukuri/](https://www.linkedin.com/in/manoharchirukuri/)

---

## 📄 License

Full-Stack Java Learning Project

```

---

