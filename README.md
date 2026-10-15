# 🍔 TastyBite — "Good Food, Just a Bite Away."

> **Full-Stack Online Food Ordering & Delivery Web Application**  
> *Developed with React.js (Vite), Tailwind CSS, Node.js, Express.js, MongoDB, Socket.IO, and PDFKit.*

---

## 🌟 1. Project Overview

**TastyBite** is a modern full-stack web platform built for high-performance online food ordering, culinary exploration, and collaborative dining. Designed from scratch with an original warm amber/saffron aesthetic, it bridges local partner restaurants with customers through live real-time tracking, intelligent rule-based flavor recommendations (**TastyBite Smart Picks**), and group dining with split billing (**TastyBite Group Feast**).

### 🏷️ Brand Identity
- **Website Name:** TastyBite
- **Tagline:** *"Good Food, Just a Bite Away."*
- **Primary Palette:** Warm Amber (`#ea580c`, `#f97316`), Crimson accents (`#e11d48`), Fresh Emerald (`#10b981`), and Deep Slate Charcoal (`#0f172a`).

---

## ✨ 2. Key Features & Depth

### 👤 Customer Experience
1. **Interactive Menu & Restaurant Directory:**
   - 8 curated partner kitchens (Biryani, Artisan Pizzas, Smashed Burgers, Punjabi, South Indian, Superfood Bowls, Patisserie, Asian).
   - 31 signature dishes with real-time stock toggling, spice meter, preparation time, and nutritional profiles (Calories, Protein, Carbs, Fat).
   - Multi-parameter filtering by cuisine, diet (Pure Veg / Non-Veg), price range, spice affinity, and meal type.
2. **TastyBite Smart Picks (Rule-Based Recommendation Engine):**
   - Eliminates decision fatigue without costly external AI APIs.
   - Algorithmic scoring matches dietary targets, spice levels, meal times, and budget constraints with personalized match explanation badges.
3. **TastyBite Group Feast (Collaborative Ordering & Split Billing):**
   - Host generates a unique group room code (e.g., `TB-XXXX`) and invitation link.
   - Friends join from any device and add their favorite dishes into a synchronized shared cart.
   - Dual split billing modes:
     - **Itemized Split:** Members pay for exact dishes selected + proportional share of tax and delivery.
     - **Equal Split:** Grand total divided evenly among participants.
   - Host locking and checkout mechanism.
4. **Production-Grade Razorpay Test Payment Gateway:**
   - **Direct Razorpay SDK Integration:** Seamlessly integrated with official test credentials (`key_id: rzp_test_TNgbXItY3fibBE`).
   - Supports live test checkout popups: UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Wallets.
   - Cryptographic HMAC-SHA256 signature verification on the backend to validate authentic payment responses before order confirmation.
   - Complete sandbox fallback mode with simulation failure toggles for academic grading and error testing.
5. **Real-Time Live Order Tracking:**
   - 6-Stage WebSocket Timeline: `ORDER PLACED` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `OUT FOR DELIVERY` ➔ `DELIVERED`.
   - Simulated satellite GPS route preview connecting partner kitchen, moving rider, and customer doorstep.
   - Delivery partner details with interactive call simulation.
6. **Automated PDF Generation:**
   - **Tax Invoice PDF:** Itemized breakdown, GST calculations, delivery fees, promo discounts, customer info, and computer-generated seal.
   - **Payment Receipt PDF:** Transaction reference, gateway verification seal, payment method, and amount paid.
7. **24/7 Live Support & WhatsApp Integration:**
   - Real-time in-app WebSocket chat with automated TastyBite Assistant Bot fallback.
   - One-click "Chat on WhatsApp" floating button with pre-filled support message.
8. **Customer Profile & Personal Dashboard:**
   - 6 tabbed views: **Overview**, **My Orders**, **Rewards & Points**, **Saved Addresses**, **Favorites**, and **Account Settings**.
   - Dynamic metrics calculated from MongoDB: Total orders, completed orders, lifetime spend, favorite food/restaurant, reviews count, and average rating.
   - Dynamic membership tiering (Bronze Starter, Silver Epicure, Gold Gourmand, Foodie Legend VIP) and profile completion progress bar.
   - Complete delivery address management (Add, edit, delete, set default) with category tags (Home, Office, Hostel, Other).
   - Account security: Password updates with current password verification, avatar customizer, and granular notification toggles.
9. **TastyBite Loyalty & Rewards System:**
   - Dynamic points balance stored in MongoDB with chronological activity ledger.
   - Real-time voucher redemption: Converts points into active discount coupons that immediately integrate with the checkout cart.
   - Points earned on completed orders, reviews, and group feast orders.

### 🛡️ Admin Operations Portal
- **Real-Time Analytics:** Total revenue, volume of orders, active users, catalog statistics, weekly revenue velocity chart (Recharts Area), and fulfillment pie chart.
- **Live Order Management:** Update order progression live; automatically pushes WebSocket updates to the customer's tracking screen and dispatches email notifications.
- **Menu Management:** Add new dishes, edit pricing, toggle in-stock/out-of-stock availability, or remove items.
- **Restaurant Management:** Onboard partner kitchens and configure delivery zones.
- **Financial Settlements & Refunds:** View all gateway transactions and execute instant customer refunds.
- **Customer Support Console:** View all inbound customer support threads and reply in real-time.

---

## 🛠️ 3. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 19 (Vite), Tailwind CSS v4, Lucide React Icons, Canvas Confetti |
| **Routing & Networking** | React Router v7, Axios |
| **Data Visualizations** | Recharts (Responsive Area, Bar, and Pie Charts) |
| **Backend Runtime** | Node.js (v24), Express.js REST API |
| **Database** | MongoDB & Mongoose ODM |
| **Real-Time WebSockets** | Socket.IO (Bidirectional client-server communication) |
| **PDF Generation** | PDFKit (Dynamic binary document streaming) |
| **Email Notifications** | Nodemailer (HTML templating with automated Ethereal development mailer) |
| **Authentication & Security** | JWT (JSON Web Tokens), bcryptjs password hashing |

---

## 📂 4. Project Structure

```text
Tasty Bite/
├── client/                     # Frontend React + Vite Application
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Header with search, notifications, cart & auth
│   │   │   ├── Footer.jsx      # Value propositions, WhatsApp & links
│   │   │   ├── FoodCard.jsx    # Dish card with veg badge, price, wishlist & stepper
│   │   │   ├── FoodDetailsModal.jsx # Detailed nutrition facts & allergens
│   │   │   ├── RestaurantCard.jsx # Partner restaurant showcase card
│   │   │   ├── SupportChatModal.jsx # Live WebSocket customer care chat
│   │   │   └── WhatsAppButton.jsx # Floating WhatsApp quick link
│   │   ├── context/            # React Context providers
│   │   │   ├── AuthContext.jsx # Authentication state & profile methods
│   │   │   ├── CartContext.jsx # Shopping cart, totals, and promo discounts
│   │   │   └── SocketContext.jsx # Real-time Socket.IO room management
│   │   ├── pages/              # Application views
│   │   │   ├── Home.jsx        # Landing page with hero, categories & trending foods
│   │   │   ├── Restaurants.jsx # Restaurant directory with cuisine filters
│   │   │   ├── RestaurantDetails.jsx # Restaurant menu & category tabs
│   │   │   ├── FoodMenu.jsx    # Unified dish search & multi-filter menu
│   │   │   ├── SmartPicks.jsx  # Rule-based food recommendation engine
│   │   │   ├── Cart.jsx        # Cart management & bill review
│   │   │   ├── Wishlist.jsx    # Saved favorite dishes
│   │   │   ├── Checkout.jsx    # Address selector & payment chooser
│   │   │   ├── Payment.jsx     # Realistic sandbox payment simulation
│   │   │   ├── OrderConfirmation.jsx # Order celebration & PDF download triggers
│   │   │   ├── OrderTracking.jsx # 6-stage live GPS timeline
│   │   │   ├── OrderHistory.jsx # Past orders, reordering & invoice downloads
│   │   │   ├── PaymentHistory.jsx # Transaction ledger & receipt downloads
│   │   │   ├── GroupOrders.jsx # Shared cart feast & split billing calculator
│   │   │   ├── Profile.jsx     # User profile & saved address manager
│   │   │   ├── CustomerSupport.jsx # Helpdesk & FAQ accordion
│   │   │   ├── Login.jsx       # Sign in with 1-click evaluation demo buttons
│   │   │   ├── Register.jsx    # Customer sign up
│   │   │   ├── ForgotPassword.jsx # Recovery flow
│   │   │   └── admin/
│   │   │       └── AdminDashboard.jsx # Analytics, order updater, menu CRUD & chat
│   │   ├── services/
│   │   │   └── api.js          # Axios client with JWT interceptors
│   │   ├── utils/
│   │   │   └── formatters.js   # Currency (INR) and date formatting helpers
│   │   ├── App.jsx             # Main Router & layout assembly
│   │   ├── index.css           # Tailwind CSS imports & animations
│   │   └── main.jsx            # React root DOM mount
│   ├── package.json
│   └── vite.config.js          # Vite config with API reverse proxy
│
└── server/                     # Backend Node.js & Express API
    ├── config/
    │   └── db.js               # MongoDB Mongoose connection
    ├── controllers/            # Controller business logic
    │   ├── adminController.js
    │   ├── authController.js
    │   ├── chatController.js
    │   ├── couponController.js
    │   ├── foodController.js
    │   ├── groupOrderController.js
    │   ├── notificationController.js
    │   ├── orderController.js
    │   ├── paymentController.js
    │   ├── recommendationController.js
    │   └── restaurantController.js
    ├── middleware/             # Middlewares (JWT protect, adminOnly, errorHandler)
    ├── models/                 # Mongoose schemas (User, Restaurant, Food, Order, Payment, etc.)
    ├── routes/                 # Express API endpoint declarations
    ├── services/
    │   ├── emailService.js     # Nodemailer HTML templates & simulation
    │   ├── pdfService.js       # PDFKit Invoice & Receipt generator
    │   └── socketService.js    # Real-time WebSocket room emitters
    ├── utils/
    │   ├── seedData.js         # Initial mock dataset
    │   └── seedDatabase.js     # Database seeding runner
    ├── .env                    # Runtime environment variables
    ├── .env.example            # Environment template
    ├── package.json
    └── server.js               # Express application entrypoint
```

---

## ⚡ 5. Quick Start & Local Execution

### Prerequisites
- **Node.js** (v18 or higher; tested on v24)
- **MongoDB** running locally on default port `27017` (e.g., `mongodb://127.0.0.1:27017/tastybite_db`)

### Step 1: Clone or Navigate to Directory
```bash
cd "c:/Users/Yashas/Downloads/Tasty Bite"
```

### Step 2: Configure Environment Variables
Inside `/server/.env`:
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/tastybite_db
JWT_SECRET=tastybite_super_secret_jwt_key_2026_secure
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# WhatsApp Support Configuration
WHATSAPP_SUPPORT_NUMBER=919876543210
```

### Step 3: Seed Database Records
Populates 8 restaurants, 31 foods, promotional coupons, sample orders, and demo accounts:
```bash
cd server
npm run seed
```

### Step 4: Run the Backend Server
```bash
cd server
npm start
# Server listens on http://localhost:5000
```

### Step 5: Run the Frontend Client
In a second terminal window:
```bash
cd client
npm run dev
# Vite server starts on http://localhost:5173
```

Open your browser and navigate to:  
👉 **`http://localhost:5173`**

---

## 🔑 6. Pre-Configured Test Accounts

For quick grading and presentation testing, the login page includes **1-click evaluation buttons**:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@tastybite.com` | `Customer@123` | Ordering, Cart, Group Feast, Wishlist, Tracking, Chat |
| **Administrator** | `admin@tastybite.com` | `Admin@123` | Complete Operations Control, Analytics, Menu CRUD, Live Order Updater |

---

## 🎟️ 7. Promotional Coupons

| Coupon Code | Discount Terms |
| :--- | :--- |
| **`TASTY50`** | 50% discount on orders above ₹299 (Max discount ₹120) |
| **`WELCOME20`** | 20% discount on orders above ₹199 (Max discount ₹100) |
| **`BITE100`** | Flat ₹100 OFF on orders above ₹499 |

---

## 📄 8. Associated Academic Documentation

- 📘 [PROJECT_REPORT.md](file:///c:/Users/Yashas/Downloads/Tasty%20Bite/PROJECT_REPORT.md) — Complete 26-chapter academic project report.
- 📊 [PPT_PRESENTATION.md](file:///c:/Users/Yashas/Downloads/Tasty%20Bite/PPT_PRESENTATION.md) — 22-slide project defense presentation content.
- 🎓 [VIVA_QUESTIONS.md](file:///c:/Users/Yashas/Downloads/Tasty%20Bite/VIVA_QUESTIONS.md) — Comprehensive technical Viva Q&A covering MERN, WebSockets, PDFs, and algorithms.
