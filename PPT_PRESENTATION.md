# 📽️ TASTYBITE PROJECT PRESENTATION (PPT)

---

### SLIDE 1: TITLE SLIDE
- **Project Title:** TastyBite — Full-Stack Food Ordering & Delivery Web Application
- **Tagline:** *"Good Food, Just a Bite Away."*
- **Technology Stack:** MERN Stack (MongoDB, Express, React, Node.js) + Vite + Tailwind CSS + Socket.IO + PDFKit
- **Presented by:** Student Engineering Team
- **Department:** Computer Science & Engineering

---

### SLIDE 2: INTRODUCTION
- Modern web application connecting local food lovers with curated partner restaurants.
- Uniquely engineered from scratch with an original warm amber/saffron visual identity.
- Bridges the gap between solo ordering and social dining through real-time collaborative carts.
- Built for fast, responsive, and verifiable online food delivery operations.

---

### SLIDE 3: PROBLEM STATEMENT
- **Decision Paralysis:** Excessive unsorted menus cause cognitive overload for hungry users.
- **Group Ordering Chaos:** When roommates or colleagues order together, one person pays and suffers manual split bill calculations.
- **Lack of Transparency:** Static progress indicators fail to give real kitchen and dispatch status.
- **Missing Verifiable Proofs:** Absence of formal Tax Invoices and Payment Receipts in standard student projects.

---

### SLIDE 4: OBJECTIVES
- Build a responsive, clean, and modern React 19 frontend using Vite and Tailwind CSS.
- Develop a modular Node.js/Express.js RESTful API secured by JWT and bcrypt.
- Implement **TastyBite Smart Picks**, an algorithmic rule-based recommendation engine.
- Create **TastyBite Group Feast**, enabling shared real-time carts and split billing via WebSockets.
- Deliver real-time order lifecycle tracking with an interactive satellite route preview.
- Automate dynamic PDF generation for official Tax Invoices and Payment Receipts.

---

### SLIDE 5: EXISTING SYSTEM
- Monolithic commercial apps that lack transparent food recommendation reasoning.
- Group orders require clumsy external coordination via third-party chat apps.
- No integrated, real-time split billing that calculates item-level totals plus taxes.
- High vendor lock-in with black-box proprietary recommendation algorithms.

---

### SLIDE 6: PROPOSED SYSTEM
- **TastyBite** provides an end-to-end full-stack platform built with clean, maintainable architecture.
- Real-time room synchronization where participants can join via a single 4-digit code.
- Deterministic, transparent rule-based flavor and budget matching algorithm.
- Professional document generation (PDFKit) for verifiable financial accounting.
- Integrated operations console featuring interactive charts (Recharts) and live order status pushing.

---

### SLIDE 7: KEY FEATURES
- **Customer Portal:** Faceted dish search, nutrition info, spice meters, and favorites wishlist.
- **TastyBite Smart Picks:** Heuristic food recommendations by diet, budget, spice, and meal time.
- **TastyBite Group Feast:** Shared cart, member labels, host locking, and dual split billing.
- **Order Tracking:** 6-stage lifecycle with live WebSockets and simulated driver GPS.
- **PDF Documents:** Instant downloads of Tax Invoices and Payment Receipts.
- **Dual Support:** In-app WebSocket live care with AI bot answers + WhatsApp button.
- **Admin Dashboard:** Revenue velocity charts, order fulfillment pie charts, and menu CRUD.

---

### SLIDE 8: TECHNOLOGY STACK
- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti.
- **Charts & State:** Recharts, React Context API (`Auth`, `Cart`, `Socket`).
- **Backend:** Node.js, Express.js REST API.
- **Database:** MongoDB & Mongoose ODM.
- **Real-Time Engine:** Socket.IO.
- **Document Streaming:** PDFKit.
- **Email Transport:** Nodemailer with automated development fallback.

---

### SLIDE 9: SYSTEM ARCHITECTURE
- **Client Tier:** React Single Page Application (SPA) communicating over REST and WebSockets.
- **Application Tier:** Express.js API Gateway handling authentication, routes, and business controllers.
- **Event Tier:** Socket.IO server orchestrating real-time room communication (`order_*`, `group_*`, `chat_*`).
- **Data Tier:** MongoDB storing users, restaurants, menu dishes, orders, payments, and tickets.
- **Service Tier:** PDFKit document rendering engine and Nodemailer email dispatchers.

---

### SLIDE 10: DATABASE DESIGN
- 12 Normalized Mongoose Collections:
  1. `User` (Credentials, Role, Address book, Wishlist)
  2. `Restaurant` (Venue profile, cuisines, location, ratings)
  3. `Food` (Pricing, discounts, nutrition, spice level, tags)
  4. `Category` (Biryani, Pizzas, Burgers, Healthy Bowls, etc.)
  5. `Order` (Items snapshot, delivery address, status, timeline)
  6. `Payment` (Transaction ID, method, amount, refund info)
  7. `GroupOrder` (Room code, host, member list, split mode)
  8. `Coupon` (Promotional codes, discount terms)
  9. `Review` (Ratings and feedback)
  10. `Notification` (In-app alerts)
  11. `Chat` & `Message` (Support conversation records)

---

### SLIDE 11: MAIN MODULES
- **Authentication Module:** Registration, JWT issuance, password hashing, and admin guards.
- **Catalogue & Discovery Module:** Search, category filters, and detailed nutrition modals.
- **Smart Picks Engine:** Multi-criteria decision ranking algorithm.
- **Group Feast Module:** WebSocket synchronized collaborative cart.
- **Checkout & Payment Module:** Razorpay test gateway (UPI, Cards, NetBanking) + Sandbox simulation with HMAC SHA-256 verification.
- **Profile & Rewards Module:** Dynamic statistical dashboard (total spend, favorite dishes, orders breakdown), loyalty points ledger, 1-click discount voucher redemption, address book, and security.
- **PDF & Invoice Module:** Server-side vector document rendering.
- **Real-Time Fulfillment Module:** 6-stage timeline and driver preview.
- **Admin Operations Module:** Analytics, order status dispatcher, and inventory controls.

---

### SLIDE 12: TASTYBITE SMART PICKS
- **Philosophy:** High-precision meal personalization without external paid AI fees.
- **User Inputs:** Diet (Veg, Non-Veg, High Protein, Keto, Low Calorie), Target Budget (₹100 - ₹900), Spice Affinity (None, Mild, Medium, Hot), Occasion (Breakfast, Lunch, Dinner).
- **Algorithm:** Combines rating weights, bestseller bonuses, spice affinity offsets, and value-for-money budget proximity.
- **Output:** Ranked dishes displaying dynamic match percentage badges and plain-language reasoning.

---

### SLIDE 13: GROUP ORDERING ("TASTYBITE FEAST")
- **Workflow:** Host creates room ➔ System generates code (e.g. `TB-XXXX`) and invitation link ➔ Friends join from phones/laptops ➔ Shared cart updates live.
- **Member Identification:** Shows exactly which member added each dish.
- **Dual Split Billing Calculation:**
  - *Itemized:* Participant pays their dishes + fair share of tax/delivery.
  - *Equal:* Total bill divided uniformly among group members.
- **Host Control:** Host locks cart when ready and proceeds to single checkout.

---

### SLIDE 14: PAYMENT & RECEIPTS
- **Realistic Sandbox Gateway:** Full simulation of UPI, Card, Net Banking, and Wallet transactions.
- **Transaction Identifiers:** Generates authentic references (e.g., `TXN_TB_UPI_...`).
- **Verifiable PDF Receipts:** On-demand download of formal Payment Receipts featuring transaction stamps, amount paid, and digital security seals.
- **Error Simulation:** One-click demo button to test declined payments and error state handling.

---

### SLIDE 15: EMAIL NOTIFICATION SYSTEM
- **Transport:** Powered by Nodemailer with automatic Ethereal test mailer fallback.
- **Responsive HTML Templates:** Branded email notifications dispatched for:
  - Account registration welcome.
  - Order confirmation (with tax invoice attached).
  - Live status milestones (Preparing, Ready, Out for delivery, Delivered).
  - Payment receipt confirmations.
  - Order cancellations and refunds.

---

### SLIDE 16: REAL-TIME ORDER TRACKING
- **Event-Driven Architecture:** Client subscribes to private `order_{id}` Socket.IO room.
- **Lifecycle Stages:**
  `ORDER PLACED` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `OUT FOR DELIVERY` ➔ `DELIVERED`.
- **Interactive Visuals:** Live satellite GPS route map displaying kitchen marker, animated en-route rider, and customer destination.
- **Driver Info:** Name, contact number, vehicle registration, and simulated call button.

---

### SLIDE 17: CHAT & WHATSAPP SUPPORT
- **In-App Live Chat:** Built on Socket.IO and stored in MongoDB.
- **Smart Assistant Bot:** Automatically answers common inquiries regarding order status, delivery timelines, and refund rules when agents are offline.
- **WhatsApp Integration:** Dedicated button redirecting to WhatsApp API with pre-filled support message, configurable via `.env`.

---

### SLIDE 18: ADMIN DASHBOARD
- **Executive Overview:** Real-time revenue tallies, order counters, and user statistics.
- **Visual Analytics:** Interactive Recharts Weekly Revenue Area Chart and Order Fulfillment Pie Chart.
- **Order Dispatcher:** Admins update status dropdown, instantly triggering customer socket events and emails.
- **Catalog Controls:** Add new dishes, adjust prices, and toggle in-stock/out-of-stock states.
- **Refund Management:** One-click customer refunds that cancel orders and update payment records.

---

### SLIDE 19: TESTING & QUALITY ASSURANCE
- **Unit Testing:** Tax computations, coupon deduction logic, and split bill mathematics.
- **Integration Testing:** React form submissions and REST API route handling.
- **Concurrency Testing:** Simultaneous multi-client item updates inside group order rooms.
- **Security Validation:** Verified route protection against unauthorized non-admin token access.

---

### SLIDE 20: RESULTS & DEMONSTRATION
- Fully runnable locally in VS Code with a single command setup.
- Seed data instantly ready with 8 restaurants, 31 signature foods, and promotional coupons.
- 1-click evaluation buttons on the Login page for Customer and Admin testing.
- Verified end-to-end purchasing, PDF generation, and real-time synchronization.

---

### SLIDE 21: FUTURE SCOPE
- Integration with commercial production payment gateways (Razorpay, Stripe).
- Native mobile applications using React Native.
- Live GPS hardware tracking for delivery executives.
- Collaborative voice ordering using speech recognition models.

---

### SLIDE 22: CONCLUSION
- **TastyBite** successfully showcases a complete, modern, full-stack food delivery application.
- Innovates on social eating with real-time shared carts and automated split calculations.
- Delivers complete operational clarity through WebSockets and downloadable PDF documentation.
- Demonstrates robust engineering suitable for academic evaluation and real-world deployment.
- **Thank you! Questions and feedback are welcome.**
