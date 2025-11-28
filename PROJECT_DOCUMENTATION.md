# WishLink - Complete Technical Documentation

## Project Overview

**WishLink** is a social wishlist and e-commerce platform where users create wishlists, share them with friends, and facilitate group purchasing with integrated Stripe payments.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS
- Routing: React Router v7
- State Management: React Context API + localStorage
- Payments: Stripe API (via Edge Functions)
- Backend: Supabase Edge Functions
- Icons: Lucide React

---

## Core Architecture

### 1. Data Storage Layer (`src/utils/localStorage.ts`)

**Purpose:** All user data is stored in browser's localStorage using JSON serialization.

**Data Structures:**

```typescript
User {
  username: string          // Login ID
  password: string          // Plain text (demo only)
  friends: string[]         // Array of friend usernames
  pendingRequests: string[] // Incoming friend requests
  sentRequests: string[]    // Outgoing friend requests
  wishlists: Wishlist[]     // User's created wishlists
  cart: CartItem[]          // Shopping cart items
}

Wishlist {
  id: string                    // Unique identifier (timestamp)
  title: string                 // "Dream Tech Setup"
  description: string           // "My ultimate tech wishlist"
  category: 'public'|'private'|'selected' // Visibility level
  selectedFriends: string[]     // If category='selected'
  items: WishlistItem[]         // Products in wishlist
  comments: Comment[]           // Friend comments
  owner: string                 // Username who created it
}

CartItem extends WishlistItem {
  addedFrom: string  // Where item was added from (wishlist name)
}
```

**Key Functions:**

| Function | Purpose |
|----------|---------|
| `initializeStorage()` | Creates default users if localStorage empty |
| `getUser(username)` | Fetch user by username |
| `updateUser(username, updates)` | Update user object |
| `getUsers()` | Get all users array |
| `saveUsers(users)` | Save users to localStorage |
| `resetStorage()` | Clear data and restore defaults |

**Demo Users (for testing):**
- user1 / user1pass
- user2 / user2pass
- user3 / user3pass

---

### 2. Authentication System (`src/contexts/AuthContext.tsx`)

**How It Works:**

```typescript
AuthContext provides:
- currentUser: string | null  // Username if logged in
- login(username, password): boolean
- logout(): void
```

**Login Flow:**
1. User enters username + password on Login page
2. `login()` function calls `getUser()` to fetch user from localStorage
3. Compares passwords (plain text comparison)
4. On success: stores username in `sessionStorage` + updates React state
5. On failure: displays error message

**Session Persistence:**
- Uses `sessionStorage` (cleared on browser close)
- On app load, checks if user exists in sessionStorage
- Auto-restores logged-in state if session exists

**Protected Routes:**
```typescript
<ProtectedRoute>
  Only renders if currentUser exists, otherwise redirects to /login
</ProtectedRoute>
```

---

## Feature Implementation Guide

### Feature 1: Authentication & Login

**Files Involved:**
- `src/pages/Login.tsx` - Login UI
- `src/contexts/AuthContext.tsx` - Auth logic

**Login Page Features:**
1. **Manual Login Form** (lines 13-22)
   - Takes username + password input
   - Calls `login()` from AuthContext
   - Shows error if credentials invalid

2. **Quick Demo Buttons** (lines 24-30)
   - One-click login for demo users
   - Prefills username + password fields
   - Auto-navigates to dashboard on success

**Code Example - Login Submission:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  // login() checks password against localStorage
  if (login(username, password)) {
    navigate('/dashboard');  // Success redirect
  } else {
    setError('Invalid username or password');  // Error display
  }
};
```

---

### Feature 2: Dashboard & Navigation

**Files Involved:**
- `src/pages/Dashboard.tsx` - Main hub
- `src/components/Navbar.tsx` - Navigation bar

**Dashboard Components:**

1. **Quick Action Cards** (lines 74-139)
   - 5 clickable cards for main actions
   - Browse Products → `/products`
   - Create Wishlist → `/wishlists/create`
   - View Wishlists → `/wishlists`
   - Friends → `/friends`
   - Cart → `/cart`
   - Each shows dynamic count (e.g., "5 items" in cart)

2. **Friend Requests Panel** (lines 142-172)
   ```typescript
   handleAcceptRequest(username):
   - Adds username to user.friends[]
   - Removes from pendingRequests[]
   - Updates requester's friends[] and sentRequests[]
   - Refreshes UI

   handleRejectRequest(username):
   - Only removes from pendingRequests[]
   - Removes from requester's sentRequests[]
   ```

3. **Quick Preview** (lines 174-198)
   - Shows user's wishlists
   - Click to navigate to wishlist details
   - Shows item count and visibility badge

---

### Feature 3: Creating & Editing Wishlists

**Files Involved:**
- `src/pages/CreateWishlist.tsx`

**Form Fields:**

1. **Title & Description**
   - Simple text inputs for wishlist metadata

2. **Visibility Control** (lines 135-148)
   ```typescript
   category: 'public' | 'private' | 'selected'
   - public: All friends can see
   - private: Only owner can see
   - selected: Choose specific friends
   ```

3. **Friend Selection** (lines 150-169)
   - Shows checkboxes for all friends (only if category='selected')
   - `toggleFriend()` adds/removes from selectedFriends[]

4. **Product Search & Add** (lines 207-236)
   ```typescript
   Fetches from FakeStoreAPI (20+ products)
   - Search filters products by title
   - Click "Add" button adds product to items[]
   - Button shows "Added" when item already included
   - Display shows image, title, price
   ```

**Form Submission** (lines 42-64):
```typescript
handleSubmit():
1. Create new wishlist object with id = current timestamp
2. If editing: replace existing wishlist by id
3. If creating: add to wishlists[] array
4. Call updateUser() to save to localStorage
5. Navigate back to dashboard
```

---

### Feature 4: Browsing & Managing Wishlists

**Files Involved:**
- `src/pages/Wishlists.tsx` - List view
- `src/pages/WishlistDetail.tsx` - Detail view

**Wishlist List Page:**
- Displays all wishlists user can see:
  - Own wishlists (all)
  - Friends' public wishlists
  - Friends' selected wishlists (if included)
- Click wishlist to view details

**Wishlist Detail Page:**

1. **Header Controls** (lines 119-154)
   - Title, description, owner name
   - Share button (WhatsApp, Twitter, Instagram, Copy Link)
   - Edit button (owner only)
   - Delete button (owner only)

2. **Product Display & Selection** (NEW FEATURE)
   - Shows all items in grid (lines 231-270)
   - **For non-owners:**
     - Checkbox appears on each item (lines 243-253)
     - Click checkbox to select items
     - Selected items: border turns pink, background highlighted
   - Display count of selected items

3. **Single Item Actions** (lines 258-266)
   - "Add to Cart" button on each item
   - Adds item to user's cart (if not duplicate)
   - Shows success alert

4. **Bulk Checkout** (lines 272-288) (NEW FEATURE)
   - **Floating bar appears when items selected**
   - Shows: selected count + total price
   - "Checkout Selected Items" button
   - Clicking navigates to `/checkout` with selected items in cart

**Code Example - Item Selection:**
```typescript
const toggleItemSelection = (itemId: number) => {
  const newSelected = new Set(selectedItems);
  if (newSelected.has(itemId)) {
    newSelected.delete(itemId);  // Deselect
  } else {
    newSelected.add(itemId);     // Select
  }
  setSelectedItems(newSelected);
};

const handleCheckoutSelected = () => {
  // Add selected items to cart
  const itemsToAdd = wishlist.items.filter(item =>
    selectedItems.has(item.id)
  );
  updateUser(currentUser, {
    cart: [...user.cart, ...itemsToAdd]
  });
  navigate('/checkout');
};
```

5. **Comments Section** (lines 294-346)
   - Non-owners can comment
   - Stores: id, username, text, timestamp
   - Updates wishlist.comments[] array
   - Shows comment history

---

### Feature 5: Products Catalog

**Files Involved:**
- `src/pages/Products.tsx`

**Data Source:**
- Fetches from FakeStoreAPI (https://fakestoreapi.com/products)
- ~20 products with title, price, image, category

**Features:**

1. **Search Bar** (lines 90-98)
   - Real-time filtering by product title
   - Case-insensitive matching

2. **Category Filter** (lines 101-114)
   - Dropdown of unique categories from API
   - "All Categories" option to show everything

3. **Product Cards** (lines 130-184)
   - Image, title, price
   - Two action buttons:
     - **Green "Add to Cart"** (lines 167-173)
       ```typescript
       addToCart(product):
       - Creates cartItem with addedFrom = 'Products'
       - Checks for duplicates
       - Updates user.cart[]
       - Shows success alert
       ```
     - **Pink "Add to Wishlist"** (lines 174-181)
       - Opens modal to select which wishlist
       - Prevents duplicate items in same wishlist

4. **Wishlist Selection Modal** (lines 171-204)
   - Shows all user's wishlists as buttons
   - Click wishlist to add product
   - Shows item count for each wishlist

---

### Feature 6: Shopping Cart

**Files Involved:**
- `src/pages/Cart.tsx`

**Cart Management:**

1. **Cart Display** (lines 44-59)
   - Shows all items in user.cart
   - Displays: image, title, price, source wishlist
   - Remove button (click to delete)

2. **Summary Section** (lines 62-88)
   ```typescript
   Shows:
   - Item count
   - Subtotal (sum of all prices)
   - Total (same as subtotal, no tax/shipping)
   - Shipping: Free
   ```

3. **Checkout Button** (lines 83-88)
   - **NEW:** Navigates to `/checkout` page
   - Previously was demo-only button

**Remove from Cart:**
```typescript
removeFromCart(id: number):
- Filters out item by id
- Updates user.cart[]
- Refreshes local state
```

---

### Feature 7: Checkout & Payment (NEW)

**Files Involved:**
- `src/pages/Checkout.tsx`
- `supabase/functions/create-checkout-session/index.ts` (Edge Function)

**Checkout Page Structure:**

1. **Order Summary** (left side)
   - Email input field (required)
   - Lists all cart items with prices
   - Subtotal + Total
   - Shipping: Free

2. **Two Payment Options:**

   **Option A: Stripe Payment** (lines 71-93)
   ```typescript
   POST to /functions/v1/create-checkout-session with:
   - email: customer email
   - items: [{name, price, quantity}]
   - total: order total (in cents)
   - orderNumber: ORD-{timestamp}
   - username: current user

   Returns:
   - Stripe session URL
   - Redirects user to Stripe hosted checkout
   - After payment: success page with order number

   Requires: STRIPE_SECRET_KEY environment variable
   ```

   **Option B: Demo Checkout** (lines 73-76)
   ```typescript
   Simulates order placement:
   - Shows success message with order number
   - Clears cart after 3 seconds
   - Redirects to /cart
   ```

3. **Edge Function Details** (`create-checkout-session/index.ts`)
   - Handles Stripe API communication
   - Creates line items from cart
   - Defines success/cancel URLs
   - Returns Stripe checkout session URL
   - Error handling for configuration issues

**Code Flow:**
```
User fills email → Click "Pay with Stripe"
                ↓
Browser calls Edge Function with cart data
                ↓
Edge Function creates Stripe session
                ↓
Returns Stripe checkout URL
                ↓
Redirects to Stripe hosted checkout page
                ↓
After payment → Success page with order number
```

---

### Feature 8: Friends & Social Features

**Files Involved:**
- `src/pages/Friends.tsx`

**Friend Management:**

1. **Add Friend** (via search)
   - User can send friend requests
   - Request appears in recipient's pendingRequests[]

2. **Accept/Reject Requests** (Dashboard)
   - Show on Dashboard's "Friend Requests" panel
   - Accept: adds to friends[], removes from pending
   - Reject: removes from pending only

3. **View Friend Wishlists**
   - Can browse friends' public wishlists
   - Can add items to cart from friend wishlists
   - Cannot edit/delete friends' wishlists

---

## Data Flow Examples

### Example 1: Adding Product to Cart from Wishlist

```
1. User views friend's wishlist (WishlistDetail page)
2. Clicks checkbox to select product
3. selectedItems Set updated with product.id
4. Floating bar appears at bottom
5. User clicks "Checkout Selected Items"
6. handleCheckoutSelected() executes:
   a. Filters wishlist.items by selectedItems
   b. Creates cartItems (adds addedFrom property)
   c. Merges with existing user.cart
   d. Calls updateUser() to save to localStorage
   e. Clears selectedItems Set
   f. navigate('/checkout')
7. Checkout page loads with updated cart
```

### Example 2: Creating Wishlist with Products

```
1. User navigates to /wishlists/create
2. Fills title, description, visibility
3. Clicks "Add Items" button → showProducts = true
4. Searches for products from FakeStoreAPI
5. Clicks "Add" on products → added to items[] state
6. Clicks "Create Wishlist" button
7. handleSubmit() executes:
   a. Creates Wishlist object with id = Date.now()
   b. Calls updateUser() with new wishlist
   c. localStorage updated
   d. navigate('/dashboard')
8. Dashboard displays new wishlist in preview
```

### Example 3: Friend Request Flow

```
1. User A sends request to User B
   - Adds User B to sentRequests[]
   - Adds User A to User B's pendingRequests[]

2. User B sees request on Dashboard
   - Shows in "Friend Requests" panel
   - Shows User A name + Accept/Reject buttons

3. User B clicks Accept
   - Adds User A to User B's friends[]
   - Adds User B to User A's friends[]
   - Removes from pendingRequests[]
   - Removes from sentRequests[]
   - Now can see each other's public wishlists
```

---

## Component Hierarchy

```
App (Router setup)
├── AuthProvider
│   ├── Login
│   ├── Navbar
│   ├── Dashboard
│   ├── CreateWishlist
│   ├── Wishlists
│   ├── WishlistDetail
│   ├── Friends
│   ├── Products
│   ├── Cart
│   └── Checkout
└── ProtectedRoute (wraps pages)
```

---

## State Management Strategy

**React Context:** Only authentication state
```typescript
currentUser: string | null
```

**localStorage:** All persistent data
```typescript
{
  users: [
    { username, password, friends, wishlists, cart, ... }
  ]
}
```

**Component State:** UI state (forms, modals)
```typescript
- selectedItems (Set in WishlistDetail)
- showWishlistModal (Products page)
- selectedCategory (Products filter)
- email (Checkout form)
```

**Pattern Used:**
- Fetch from localStorage on component mount
- Update localStorage via `updateUser()`
- Update local React state immediately
- No API calls except FakeStoreAPI + Stripe

---

## UI/UX Features

### Animations
- Gradient backgrounds
- Hover scale transforms
- Fade-in animations on page load
- Blur effects on glass-morphism cards

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg
- Navbar icons hide text on mobile
- Grid layouts adjust for viewport

### User Feedback
- Error alerts for validation
- Success alerts for actions
- Loading states with spinners
- Empty state messages

---

## Possible Interview/Review Questions & Answers

### Q1: How is data persisted in this app?
**A:** All data is stored in browser's localStorage as JSON. When user loads app, data is fetched from localStorage. When user makes changes (create wishlist, add to cart, etc.), updateUser() is called which saves updated user object back to localStorage.

### Q2: How does authentication work?
**A:** Username/password are stored in localStorage. On login, getUser() retrieves user object and compares password. If match, currentUser is stored in sessionStorage and React state is updated. useAuth hook provides currentUser to all components. ProtectedRoute checks currentUser to allow/deny page access.

### Q3: What's the difference between category='public', 'private', and 'selected'?
**A:**
- **public:** All friends can see and add items to cart
- **private:** Only owner can see
- **selected:** Owner chooses specific friends who can see

### Q4: How does the checkout process work?
**A:** User selects items in cart and clicks checkout. On checkout page, enters email and chooses payment method. If Stripe: sends cart data to Edge Function which creates Stripe session and returns URL, redirecting to Stripe hosted checkout. If Demo: shows success page and clears cart.

### Q5: Why use selectedItems as a Set instead of array?
**A:** Sets provide O(1) lookup time for checking if item selected (has()) vs O(n) for array.includes(). Since we frequently check/add/remove selections during user interaction, Set is more efficient.

### Q6: How do friends see each other's wishlists?
**A:** When viewing wishlists page, app shows:
1. User's own wishlists
2. Friends' public wishlists
3. Friends' wishlists where user is in selectedFriends[]
The location.state.owner parameter tracks which user owns the wishlist being viewed.

### Q7: What happens if user is offline?
**A:** Since all data is in localStorage, app works offline. User can view wishlists, manage cart, create wishlists. Changes persist locally. When online again, changes are already stored in localStorage (there's no sync with server).

### Q8: How do you prevent duplicate items in wishlist?
**A:** In addItem() function (CreateWishlist line 67):
```typescript
if (!items.find(i => i.id === product.id)) {
  setItems([...items, product]);
}
```
Checks if product.id already exists before adding.

### Q9: What's the purpose of addedFrom field in cart items?
**A:** Tracks where user added item from (product name or "Products"). Helps user remember which wishlist item came from. Displayed in Cart page next to each item.

### Q10: How are comments associated with wishlists?
**A:** Each Wishlist object has comments[] array. When user submits comment, creates comment object with id, username, text, timestamp. Pushes to wishlist.comments[]. Updates owner's user object in localStorage.

### Q11: Explain the flow when user clicks "Add to Wishlist" from Products page?
**A:**
1. handleAddToWishlist(product) → setSelectedProduct + showWishlistModal = true
2. Modal renders with all user's wishlists as buttons
3. User clicks wishlist button → addToWishlist(wishlistId)
4. Finds wishlist by id, adds product to items[]
5. Updates entire wishlists[] array
6. Calls updateUser() to save
7. Closes modal, shows success alert

### Q12: Why does navbar disappear on login page?
**A:** In App.tsx, navbar only renders if currentUser exists:
```typescript
{currentUser && <Navbar />}
```
On login page, currentUser is null, so navbar hidden. After login, currentUser set, navbar appears.

### Q13: What's the role of the resetStorage button?
**A:** Clears all localStorage data and reloads default users (user1, user2, user3). Used for demo/testing purposes to return to initial state.

### Q14: How does search work in Products page?
**A:** Implemented with useEffect hook. When searchTerm or selectedCategory changes, filters products array:
```typescript
filtered = products.filter(p =>
  p.title.toLowerCase().includes(searchTerm.toLowerCase())
)
```
Re-renders with filtered results.

### Q15: Can users edit existing wishlists?
**A:** Yes! Navigate to /wishlists/{id}/edit. CreateWishlist component detects id param, fetches existing wishlist, pre-fills form. On submit, replaces existing wishlist instead of creating new one.

---

## Technical Decisions & Trade-offs

| Decision | Why | Trade-off |
|----------|-----|-----------|
| localStorage | Simple persistence, works offline | Limited storage, no encryption |
| Plain text passwords | Demo simplicity | Security risk (use hashed in production) |
| FakeStoreAPI | Free, needs no auth | Limited products, no real inventory |
| React Context only | Minimal setup | Poor scalability with complex state |
| Client-side everything | Fast, no backend needed | Data lost on localStorage clear |
| Stripe Edge Function | Secure, API keys hidden | Adds latency, requires Supabase |

---

## Improvements for Production

1. **Database:** Move from localStorage to PostgreSQL/Supabase
2. **Authentication:** Use proper auth (passwords hashed with bcrypt)
3. **Payment:** Full Stripe integration with webhooks for order confirmation
4. **Real Products:** Database of actual products with inventory tracking
5. **Images:** CDN instead of external URLs
6. **Notifications:** Email alerts for friend requests, order confirmations
7. **Analytics:** Track user behavior, conversion funnels
8. **Moderation:** Report/block features for comments
