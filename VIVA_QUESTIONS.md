# 🎓 TASTYBITE COMPREHENSIVE VIVA QUESTIONS & ANSWERS

A beginner-friendly and exhaustive technical viva preparation guide covering all core concepts, design choices, and code implementations used in **TastyBite**.

---

### SECTION 1: REACT & FRONTEND ARCHITECTURE

#### Q1: What is React and why was it chosen for TastyBite?
**Answer:** React is a component-based JavaScript library developed by Meta for building dynamic user interfaces. It was chosen for TastyBite because it uses a Virtual DOM to efficiently update only the parts of the webpage that change (such as cart quantities, order stages, or live chat messages) without reloading the entire page.

#### Q2: What is Vite and why is it preferred over Create React App (CRA)?
**Answer:** Vite is a modern frontend build tool that leverages native ES modules in the browser. Unlike CRA, which bundles the entire codebase before starting the server, Vite starts the dev server almost instantly and performs Hot Module Replacement (HMR) extremely fast, significantly boosting developer productivity.

#### Q3: How is state managed across the TastyBite application?
**Answer:** TastyBite uses the **React Context API** for global state management:
1. `AuthContext.jsx`: Manages logged-in user data, tokens, and address books.
2. `CartContext.jsx`: Manages cart items, coupon validation, subtotals, and calculations.
3. `SocketContext.jsx`: Manages the real-time WebSocket connection and room joiners.
Local UI state (like modal toggles or input text) is managed using standard `useState` hooks.

#### Q4: What is the purpose of React Router in this project?
**Answer:** React Router (`react-router-dom`) enables client-side routing. It intercepts browser URL changes and renders the matching component (e.g. `/menu`, `/checkout`, `/admin/dashboard`) instantly without making a full round-trip page request to the server.

---

### SECTION 2: NODE.JS, EXPRESS & REST APIS

#### Q5: What is Node.js and how does Express.js complement it?
**Answer:** Node.js is an open-source, cross-platform JavaScript runtime built on Chrome's V8 engine that allows JavaScript to run server-side. Express.js is a lightweight web framework for Node.js that simplifies defining RESTful API routes, middlewares, request body parsing, and error handling.

#### Q6: What is a RESTful API?
**Answer:** Representational State Transfer (REST) is an architectural style for networked applications. In TastyBite, clients communicate with the backend using standard HTTP verbs:
- `GET`: Retrieve data (e.g., `GET /api/foods`).
- `POST`: Create a resource (e.g., `POST /api/orders`).
- `PUT`: Update a resource (e.g., `PUT /api/orders/:id/status`).
- `DELETE`: Remove a resource (e.g., `DELETE /api/foods/:id`).

#### Q7: What are Express middlewares and how are they used in TastyBite?
**Answer:** Middlewares are functions that execute during the lifecycle of a request before reaching the route handler. Examples used in TastyBite:
- `express.json()`: Parses incoming JSON request payloads.
- `cors()`: Enables Cross-Origin Resource Sharing so the React frontend on port 5173 can query the backend on port 5000.
- `authMiddleware`: Verifies JWT tokens on protected routes.
- `adminMiddleware`: Restricts management routes to users with `role: 'admin'`.

---

### SECTION 3: MONGODB & MONGOOSE

#### Q8: What type of database is MongoDB and why use it for food delivery?
**Answer:** MongoDB is a NoSQL, document-oriented database that stores records as flexible BSON (JSON-like) documents. It is ideal for food delivery because menus, order line items, and delivery addresses naturally vary in structure and can be stored cleanly as embedded arrays without heavy SQL joins.

#### Q9: What is Mongoose ODM?
**Answer:** Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides strict schema validation, type casting, pre/post middleware hooks (e.g., automatic password hashing before saving), and convenient query helper methods.

#### Q10: How are relationships handled in TastyBite's MongoDB schema?
**Answer:** TastyBite uses a hybrid approach:
- **Embedding:** Delivery addresses are embedded directly inside the `User` document, and order items are embedded inside `Order` for permanent historical consistency.
- **Referencing:** Dishes reference `Restaurant` IDs, orders reference `User` and `Restaurant` IDs, and payments reference `Order` IDs using Mongoose `Schema.Types.ObjectId` with `.populate()`.

---

### SECTION 4: AUTHENTICATION & SECURITY

#### Q11: How does JWT (JSON Web Token) authentication work?
**Answer:** When a user logs in with valid credentials, the server signs a token containing the user's ID using a private secret key (`JWT_SECRET`). The client stores this token in `localStorage` and includes it in the `Authorization: Bearer <token>` header of subsequent API requests. The server validates the signature to authenticate the user without storing server-side session state.

#### Q12: Why should passwords never be stored in plain text? How does bcrypt work?
**Answer:** Storing plain-text passwords poses severe security risks if a database leak occurs. TastyBite uses `bcryptjs` with salt rounds (10 rounds). A salt is a cryptographically random string added to the password before hashing, rendering pre-computed rainbow table attacks useless.

#### Q13: How does TastyBite implement Role-Based Access Control (RBAC)?
**Answer:** The `User` model defines a `role` field (`'customer'` or `'admin'`). In the backend, routes like `/api/admin/dashboard` or `/api/foods` use the `adminOnly` middleware that checks `req.user.role === 'admin'`. On the frontend, `ProtectedRoute` redirects unauthorized non-admin users away from the dashboard.

---

### SECTION 5: TASTYBITE SMART PICKS (RECOMMENDATION ENGINE)

#### Q14: How does the "TastyBite Smart Picks" feature work?
**Answer:** It is a transparent, deterministic rule-based scoring engine. It filters food items by dietary preference (Veg, Non-Veg, High Protein, Keto, etc.) and maximum budget ceiling, then scores eligible items using a weighted formula:
- High customer rating: Base points (up to 75 points).
- Community bestseller bonus: +20 points.
- Exact meal occasion match (e.g. Dinner, Breakfast): +25 points.
- Preferred spice level match: +20 points.
- Budget value proximity (60-95% of target budget): +15 points.
- Nutrition bonus (high protein / low calorie): +10 points.
The system ranks the highest scoring dishes and returns dynamic match percentage badges and explanation sentences.

#### Q15: Why use a rule-based algorithm instead of an external AI API?
**Answer:** 
1. **Zero Cost & Offline Reliability:** Does not rely on paid API credits, API rate limits, or network timeouts.
2. **Deterministic & Transparent:** Explainable recommendations where users and evaluators can verify exactly why an item was chosen.
3. **Speed:** Computes in under 10 milliseconds directly inside the database query pipeline.

---

### SECTION 6: GROUP ORDERING & SPLIT BILLING

#### Q16: How does "TastyBite Group Feast" function from start to finish?
**Answer:**
1. A host creates a group order, selecting a restaurant.
2. The server generates a unique alphanumeric code (e.g., `TB-8942`) and shareable link.
3. Friends join the room using the code or link.
4. Each member adds their desired dishes to the shared cart.
5. Socket.IO broadcasts updates to all members in that room in real-time.
6. The host locks the room and finalizes the checkout.

#### Q17: How is split billing calculated mathematically?
**Answer:**
- **Equal Split:**
  $$\text{Per Person Amount} = \frac{\text{Grand Total}}{\text{Number of Active Members}}$$
- **Itemized Split:**
  $$\text{Individual Share} = \text{Individual Dishes Total} + \frac{\text{Tax} + \text{Delivery Fee} - \text{Promo Discount}}{\text{Number of Active Members}}$$
This guarantees that everyone pays for their own meal while fairly dividing overheads.

---

### SECTION 7: PAYMENT SYSTEM & SANDBOX SIMULATION

#### Q18: What payment methods are supported and how does the simulation work?
**Answer:** TastyBite supports UPI (Virtual ID/QR), Credit/Debit Cards, Net Banking, TastyBite Wallet, and Cash on Delivery. When a user confirms payment:
1. The server generates a unique `transactionId` (`TXN_TB_UPI_...`) and `paymentNumber`.
2. Creates a `Payment` record in MongoDB.
3. Updates the `Order` status to `CONFIRMED` and `paymentStatus` to `Paid`.
4. Emits real-time Socket.IO updates and generates receipt PDFs.

#### Q19: Why is there a "Simulate Failed Payment" option?
**Answer:** To prove robust error handling during academic project evaluations. It tests how the system handles bank declines, logs failed transactions, updates the order status to `Failed`, and informs the user with an actionable error alert without crashing.

---

### SECTION 8: PDF GENERATION & INVOICES

#### Q20: How are Tax Invoices and Payment Receipts generated?
**Answer:** TastyBite uses **PDFKit** directly on the Node.js server. Instead of static HTML-to-PDF converters that require heavy headless browsers (like Puppeteer), PDFKit generates lightweight, vector-sharp binary PDF streams on-the-fly containing vector cloche logos, itemized tables, GST calculations, and computer-generated verification stamps.

#### Q21: What is the difference between the Tax Invoice and the Payment Receipt?
**Answer:**
- **Tax Invoice (`/api/orders/:id/invoice`):** Contains full delivery details, restaurant partner info, line-by-line food quantities, unit costs, GST breakdown, and delivery fee.
- **Payment Receipt (`/api/payments/:id/receipt`):** Focuses on financial settlement proof, transaction reference ID, payment method used, digital verification seal, and total amount paid.

---

### SECTION 9: REAL-TIME WEBSOCKETS & ORDER TRACKING

#### Q22: What is Socket.IO and why is it used over HTTP polling?
**Answer:** Socket.IO enables bidirectional, event-driven, low-latency communication over WebSockets. In HTTP polling, the client repeatedly requests the server every few seconds, creating heavy bandwidth and CPU overhead. With Socket.IO, the server pushes updates instantly only when a state change occurs.

#### Q23: How do rooms work in TastyBite Socket.IO?
**Answer:** Rooms allow isolating socket broadcasts:
- `order_${orderId}`: Only the customer and admin tracking that specific order receive status changes.
- `group_${groupCode}`: Only friends in that group feast see shared cart additions.
- `chat_${chatId}`: Only the specific customer and support agents exchange messages.
- `admin_channel`: Broadcasts administrative alerts.

#### Q24: What are the 6 stages of the TastyBite order timeline?
**Answer:**
1. `ORDER_PLACED`: Order registered in database.
2. `CONFIRMED`: Restaurant kitchen accepted order.
3. `PREPARING`: Chefs actively cooking the meal.
4. `READY`: Food packed and awaiting pickup.
5. `OUT_FOR_DELIVERY`: Delivery partner is en route.
6. `DELIVERED`: Delivered to customer's doorstep.

---

### SECTION 10: CUSTOMER SUPPORT & WHATSAPP INTEGRATION

#### Q25: How does the dual customer support system work?
**Answer:**
1. **In-App Live Chat:** Built on WebSockets and backed by MongoDB. When customers type, an intelligent TastyBite Assistant Bot checks intent keywords (e.g. "where is my order", "refund", "cancel") and provides immediate guidance if support agents are away.
2. **WhatsApp Support:** A floating button constructs an official WhatsApp deep link (`https://wa.me/<number>?text=...`) using the `.env` variable `WHATSAPP_SUPPORT_NUMBER` with a pre-filled assistance request.

---

### SECTION 11: ADMIN DASHBOARD & CONTROLS

#### Q26: What capabilities does the Admin Dashboard provide?
**Answer:**
- Real-time financial metrics (Revenue, Volume of Orders, Registered Users).
- Visual charts rendered with **Recharts** (Weekly Revenue Area Chart and Fulfillment Status Pie Chart).
- Live order status switcher that triggers real-time WebSocket push updates and emails.
- Menu catalog controls: Add dishes, edit prices, toggle stock availability, and delete items.
- Financial refund issuing with instant database reconciliation.
- Multi-client support chat console.

---

---

### SECTION 12: RAZORPAY PAYMENT GATEWAY INTEGRATION

#### Q27: How is Razorpay integrated into TastyBite?
**Answer:**
1. **Frontend:** Includes Razorpay Standard Checkout SDK (`https://checkout.razorpay.com/v1/checkout.js`). When the user clicks "Launch Razorpay Checkout", an API call requests an order from the backend.
2. **Backend Order Creation:** The backend uses the official `razorpay` Node SDK initialized with `key_id: rzp_test_TNgbXItY3fibBE` and `key_secret: osNu1DGCZ6uPlN20qgMvtJv6`. It converts the order amount into paise (`amountInPaise = Math.round(order.totalAmount * 100)`) and invokes `razorpay.orders.create(...)`.
3. **Popup Checkout:** The client receives the `razorpayOrderId` and mounts the Razorpay payment modal where users test UPI, Card, Net Banking, or Wallets.
4. **Backend Signature Verification:** Upon payment completion, Razorpay provides `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`. The client sends these to `/api/payments/razorpay/verify`.

#### Q28: How does cryptographic HMAC-SHA256 signature verification work and why is it crucial?
**Answer:**
Never trust client-side success callbacks blindly because a malicious user could intercept or forge a response.
The server generates an HMAC-SHA256 hash using the secret key:
```javascript
const body = razorpay_order_id + '|' + razorpay_payment_id;
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(body.toString())
  .digest('hex');
```
If `expectedSignature === razorpay_signature`, the payment is proven authentic and untampered, and only then is the order marked `CONFIRMED` and `Paid`.

---

### SECTION 13: CUSTOMER PROFILE & LOYALTY REWARDS SYSTEM

#### Q29: How are customer profile statistics calculated without hardcoding?
**Answer:**
Statistics are computed dynamically upon each request via `GET /api/auth/profile-stats`:
1. **Total & Status Breakdown:** `Order.find({ user: userId })` aggregates count of completed (`DELIVERED`) and cancelled orders.
2. **Total Amount Spent:** Sum of `order.totalAmount` for paid, non-cancelled orders.
3. **Favorite Dish:** Frequency map iterates through every order's items array to pinpoint the customer's most ordered food item.
4. **Favorite Kitchen:** Restaurant frequency map identifies the partner venue with the highest order volume.
5. **Membership Tier:** Dynamically evaluated into tiers (*Bronze Starter* ➔ *Silver Epicure* ➔ *Gold Gourmand* ➔ *Foodie Legend VIP*) based on order thresholds and lifetime spend.

#### Q30: How does the loyalty points redemption work end-to-end?
**Answer:**
1. Points are accrued automatically (10 points per ₹100 spent on completed orders, +50 points on reviews, +100 points on group orders).
2. When a customer redeems a reward (e.g., ₹50 discount for 200 points), the backend deducts 200 points from `user.rewardPoints` and logs the transaction in `user.rewardsHistory`.
3. Simultaneously, the backend generates an active MongoDB `Coupon` record with a unique code (e.g., `TB-REWARD-TB50-9481`), enabling instant validation and deduction on subsequent checkouts.

---

### SECTION 14: ERROR HANDLING & FUTURE ENHANCEMENTS

#### Q31: How does TastyBite handle unexpected errors?
**Answer:**
- **Backend:** Centralized Express error handler (`errorMiddleware.js`) intercepts bad ObjectIds (CastError), duplicate MongoDB keys (11000), and validation failures, returning structured JSON error messages with proper HTTP status codes.
- **Frontend:** Axios response interceptors catch 401 Unauthorized errors; React components display friendly alert banners, loading spinners, and empty states.

#### Q32: What future improvements could be added?
**Answer:**
1. Razorpay Webhook listeners for asynchronous server-to-server reconciliation (e.g., handling pending UPI auto-debits).
2. Building a native mobile application using React Native.
3. Hardware-based GPS tracking for live driver location telemetry on Google Maps.
4. AI voice ordering through speech-to-text integration.


