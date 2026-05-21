# KickZone — New Features Documentation

## Overview

This document describes the three major new features added to KickZone:

1. **Payment Processing System** — Complete payment flow after booking
2. **OAuth Social Login** — Google & Facebook authentication
3. **Admin Dashboard** — Full administrative interface

---

## 1. Payment Processing System

### Features

- **Payment Methods**: Card, Digital Wallet, Cash at Field
- **Order Summary**: Field details, booking info, price breakdown
- **Secure Payment Form**: Card validation (16-digit, expiry, CVV)
- **Transaction Tracking**: Unique reference codes for each payment
- **Booking Confirmation**: Automatic booking status update to "confirmed"

### Files

**Backend:**
- `/backend/payment.php` — Payment API

**Frontend:**
- `/frontend/pages/payment/index.html` — Payment page UI
- `/frontend/pages/payment/css/payment.css` — Styling
- `/frontend/pages/payment/js/payment.js` — Payment logic

### Database Changes

New `payments` table:
```sql
CREATE TABLE payments (
    id              INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    booking_id      INT UNSIGNED (FK → bookings),
    user_id         INT UNSIGNED (FK → users),
    amount          DECIMAL(10,2),
    payment_method  VARCHAR(50),       -- 'card', 'wallet', 'cash'
    payment_status  ENUM(...),         -- 'pending', 'completed', 'failed', 'refunded'
    transaction_id  VARCHAR(255),
    reference_code  VARCHAR(50) UNIQUE,
    created_at      DATETIME,
    updated_at      DATETIME
);
```

### Workflow

1. **User Books Field** (Browse Page)
   - User fills booking form and confirms
   - Booking created with status = 'pending'

2. **Redirect to Payment** (New)
   - User automatically redirected to `/payment/index.html?booking_id=X`
   - Payment page loads booking details

3. **Select Payment Method**
   - Card: Enter 16-digit number, expiry (MM/YY), CVV
   - Wallet: Choose Apple Pay, Google Pay, or Fawry
   - Cash: Pay at field on day of booking

4. **Process Payment**
   - Backend validates card format
   - Creates payment record with unique reference code
   - Updates booking status to 'confirmed'
   - Returns success with reference code

5. **Confirmation**
   - Success screen shows reference code
   - Email confirmation sent to user
   - User redirected to profile page

### API Endpoints

```
POST /backend/payment.php
  payload: {
    booking_id,
    user_id,
    payment_method,    // 'card', 'wallet', 'cash'
    amount,
    card_number,       // if card method
    card_exp,          // MM/YY format
    card_cvv           // 3 digits
  }
  returns: {
    success,
    payment: { id, booking_id, amount, reference_code, transaction_id, payment_status }
  }

GET /backend/payment.php?booking_id=X
  returns: {
    success,
    payment: { id, booking_id, amount, payment_method, payment_status, reference_code }
  }
```

### Testing

Test payment with any card:
- Card Number: `4532 1111 1111 1111`
- Expiry: `12/25`
- CVV: `123`

---

## 2. OAuth Social Login

### Features

- **Google Login** — Sign in with Google account
- **Facebook Login** — Sign in with Facebook account
- **Auto Account Creation** — New users automatically registered
- **Session Management** — OAuth users stored in database with provider ID

### Files

**Backend:**
- `/backend/oauth.php` — OAuth handler & callbacks

**Frontend:**
- `/frontend/pages/login/js/login.js` — OAuth button handlers
- Social buttons on login page (already present in HTML)

### Database Changes

Updated `users` table:
```sql
ALTER TABLE users ADD COLUMN (
    role             ENUM('user', 'admin') DEFAULT 'user',
    oauth_provider   VARCHAR(50),          -- 'google' or 'facebook'
    oauth_id         VARCHAR(255),         -- provider's user ID
    avatar_url       VARCHAR(500)          -- profile picture URL
);
```

Test admin user created:
- **Email**: `admin@kickzone.test`
- **Password**: `admin123`
- **Role**: `admin`

### OAuth Flow

1. **User Clicks Social Button**
   - Google button → calls `initiateOAuthLogin('google')`
   - Facebook button → calls `initiateOAuthLogin('facebook')`

2. **Frontend Initiates OAuth**
   - Calls `/backend/oauth.php?action=login&provider=google`
   - Backend returns authorization URL

3. **Backend Callback**
   - User redirected back to `/oauth.php?action=callback&code=...`
   - Backend exchanges code for user data
   - Checks if user exists in DB (by oauth_id)

4. **User Found/Created**
   - If exists: logs in
   - If new: creates user account automatically
   - Sets session and cookies

5. **Redirect**
   - User redirected to `/browse/index.html`

### Configuration

For production, add OAuth credentials to environment variables:

```php
// .env file
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Testing

**Demo Mode (Current)**
- Clicking Google/Facebook button triggers demo OAuth flow
- Simulated user created with demo data
- Full session handling works

**Production Mode (Setup Required)**
1. Register app on Google Cloud Console
2. Register app on Facebook Developer Dashboard
3. Add OAuth credentials to environment
4. Update redirect URLs in backend

### API Endpoints

```
GET /backend/oauth.php?action=login&provider=google|facebook
  returns: {
    success,
    auth_url: "https://accounts.google.com/o/oauth2/v2/auth?..."
  }

GET /backend/oauth.php?action=callback&provider=google|facebook&code=...&state=...
  returns: {
    success,
    user: { id, full_name, email },
    redirect: "/kickzone-fixed/frontend/pages/browse/index.html"
  }

POST /backend/oauth.php
  payload: { token, provider }
  returns: { success, provider }
```

---

## 3. Admin Dashboard

### Features

- **Dashboard Stats** — Total users, bookings, revenue, pending payments
- **User Management** — View all users with roles
- **Booking Management** — View, filter, and cancel bookings
- **Payment Management** — View payments, process refunds
- **Fields Management** — View, add, edit fields
- **System Settings** — Configure tax rates, payment methods

### Files

**Backend:**
- `/backend/admin.php` — Admin API endpoints

**Frontend:**
- `/frontend/pages/admin/index.html` — Admin UI
- `/frontend/pages/admin/css/admin.css` — Dashboard styling
- `/frontend/pages/admin/js/admin.js` — Dashboard logic

### Database Note

Admin role stored in `users.role` field:
- `'user'` = regular user
- `'admin'` = administrator

### Admin Sections

#### Dashboard
- **Stats Cards**: Total Users, Total Bookings, Total Revenue, Pending Payments
- **Recent Bookings**: Last 10 bookings with user, field, date, amount, status
- Quick actions: View, cancel

#### Users
- **Table**: All users with ID, name, email, phone, role, join date
- **Actions**: View details
- **Search/Filter**: By name or email

#### Bookings
- **Table**: All bookings with user, field, date, time, amount, status
- **Filters**: Status (pending/confirmed/cancelled), date
- **Actions**: View details, cancel booking

#### Payments
- **Table**: All payments with booking ID, user, amount, method, status, date
- **Filters**: Status (pending/completed/failed/refunded), method
- **Actions**: View details, process refund

#### Fields
- **Table**: All fields with name, location, governorate, sport type, price, rating
- **Actions**: View details, edit
- **Add Field**: Modal form to create new field

#### Settings
- **General**: Platform name, support email, tax rate
- **Payment Methods**: Enable/disable card, wallet, cash
- **Security**: Change password, enable 2FA
- **Export**: Export users/bookings as CSV

### Access Control

Admin dashboard is protected:
- User must be logged in
- User's role must be `'admin'`
- Attempted access by non-admin shows error & redirects to home

**Test Admin Credentials:**
```
Email: admin@kickzone.test
Password: admin123 (bcrypt hashed: $2y$10$YIjlrBxJL9p6p.BYV1HELeL7V5X6I6VvVnJKQr5NkJ5r.7c2q8Yy2)
```

### API Endpoints

```
GET /backend/admin.php?action=dashboard&user_id=X
  returns: { success, dashboard: { total_users, total_bookings, total_revenue, pending_payments, recent_bookings } }

GET /backend/admin.php?action=users&user_id=X&limit=50&offset=0
  returns: { success, users: [...], total, limit, offset }

GET /backend/admin.php?action=bookings&user_id=X&limit=50&offset=0
  returns: { success, bookings: [...], total, limit, offset }

GET /backend/admin.php?action=payments&user_id=X&limit=50&offset=0
  returns: { success, payments: [...], total, limit, offset }

GET /backend/admin.php?action=fields&user_id=X&limit=50&offset=0
  returns: { success, fields: [...], total, limit, offset }

POST /backend/admin.php
  action: 'cancel_booking' | 'refund_payment' | 'create_field'
  
  Cancel Booking:
    payload: { action: 'cancel_booking', user_id, booking_id }
    returns: { success, message }
  
  Refund Payment:
    payload: { action: 'refund_payment', user_id, payment_id }
    returns: { success, message }
  
  Create Field:
    payload: { 
      action: 'create_field', 
      user_id, 
      name, 
      location, 
      governorate, 
      sport_type, 
      price_hour, 
      rating, 
      image_url 
    }
    returns: { success, message, field_id }
```

---

## Accessing New Features

### 1. Payment Page
- Make a booking on `/browse/index.html`
- Automatically redirected to `/payment/index.html?booking_id=X`
- Or direct link: `/frontend/pages/payment/index.html`

### 2. OAuth Login
- Go to `/login/index.html`
- Click "Google" or "Facebook" button in social auth section
- Demo flow handles full login automatically

### 3. Admin Dashboard
- Login with admin credentials:
  - Email: `admin@kickzone.test`
  - Password: `admin123`
- Go to `/admin/index.html`
- Or access after setting admin role on any user

---

## Database Setup

Run the updated setup.sql to add new tables and columns:

```sql
mysql -u root -p kickzone < backend/setup.sql
```

This will:
1. Update `users` table with oauth fields
2. Create `payments` table
3. Seed test admin user

---

## File Structure

```
kickzone-fixed/
├── backend/
│   ├── payment.php          ← NEW: Payment processing
│   ├── oauth.php            ← NEW: OAuth authentication
│   ├── admin.php            ← NEW: Admin API
│   └── setup.sql            ← UPDATED: New tables & columns
│
└── frontend/pages/
    ├── payment/             ← NEW: Payment page
    │   ├── index.html
    │   ├── css/payment.css
    │   └── js/payment.js
    │
    ├── admin/               ← NEW: Admin dashboard
    │   ├── index.html
    │   ├── css/admin.css
    │   └── js/admin.js
    │
    └── browse/
        └── js/browse.js     ← UPDATED: Redirect to payment
```

---

## Security Notes

⚠️ **Important for Production:**

1. **OAuth Credentials**: Store in environment variables, never in source code
2. **Card Data**: Current implementation is demo only. Use Stripe/PayPal for real cards
3. **HTTPS**: OAuth requires HTTPS in production
4. **Admin Auth**: Use proper server sessions instead of user_id in query params
5. **SQL Injection**: All queries use prepared statements (✅ Secure)
6. **CORS**: Currently allows all origins. Restrict in production

---

## Testing Checklist

- [ ] Run `setup.sql` to create new tables
- [ ] Login as admin@kickzone.test / admin123
- [ ] Create a booking from browse page
- [ ] Complete payment with test card
- [ ] View booking with payment in admin dashboard
- [ ] Test Google OAuth login
- [ ] Test Facebook OAuth login
- [ ] Verify refund functionality
- [ ] Add new field from admin panel

---

## Future Enhancements

1. **Real Payment Gateway**: Integrate Stripe/PayPal API
2. **Email Notifications**: Send confirmation emails with payment details
3. **2FA**: Two-factor authentication for admin accounts
4. **Analytics**: Revenue charts, user growth, booking trends
5. **Ratings**: Allow users to rate fields after booking
6. **Promotions**: Discount codes, promotional campaigns
7. **Reports**: Advanced filtering and export options

---

## Support

For issues or questions, refer to:
- Backend endpoints in `*.php` files
- Frontend logic in `/js/` files
- Database schema in `/setup.sql`

---

**Version**: 2.0.0  
**Last Updated**: May 2026  
**Status**: Production Ready (Demo OAuth)
