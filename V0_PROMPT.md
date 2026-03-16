# v0 Prompt for Canteen Preorder UI

## Step-by-step instructions

### Step 1 — Open v0
Open the **v0** panel in VS Code from the left sidebar (grayhat.v0 extension), or go to https://v0.dev in your browser.

### Step 2 — Paste this exact prompt into v0

---

```
Build a mobile-first React + TypeScript + Tailwind CSS page called CanteenPreorderPage for a college canteen pre-order system.

COLOR SCHEME: Warm orange primary color (#ea580c), white cards, orange-50 background. Inspired by Symbiosis University branding. Clean, modern, student-friendly.

LAYOUT:
- Sticky top header: "🏫 Campus Canteen" title, subtitle "Skip the queue — preorder your meal",
  and a floating pill badge showing total items + price when cart is non-empty.
- On desktop (lg+): two-column layout — menu on left (3/5 width), cart + form on right (2/5 width, sticky).
- On mobile: menu section first, cart section below.

MENU SECTION:
- Section title "Today's Menu"
- Items grouped by category: Meals, Snacks, Beverages
- Each item is a white card with: emoji (large), item name (bold), short description (text-xs gray),
  price (orange, bold) on the right.
- When qty = 0: show an orange "+ Add" button.
- When qty > 0: show a quantity stepper (circular minus button, count, circular plus button).
- Menu items:
  - Veg Thali ₹60 — Rice, dal, 2 sabzi, roti, salad & pickle (meal, 🍱)
  - Egg Rice ₹45 — Fried rice with scrambled eggs & vegetables (meal, 🍳)
  - Idli (2 pcs) ₹25 — Soft steamed idlis with sambar & coconut chutney (snack, 🫓)
  - Masala Dosa ₹40 — Crispy dosa with potato filling, sambar & coconut chutney (snack, 🥞)
  - Maggi ₹30 — Classic Maggi noodles with veggies (snack, 🍜)
  - Tea ₹10 — Hot masala chai, freshly brewed (beverage, 🍵)
  - Coffee ₹15 — Hot filter coffee or instant (beverage, ☕)

CART + ORDER SECTION (white card, rounded-2xl):
- Header: "🛒 Your Order" + "Clear all" link (red, appears only when cart non-empty)
- If cart empty: centered placeholder with 🍽️ emoji and "Add items from the menu to get started"
- If cart has items:
  - Scrollable list of items: emoji, name, quantity stepper, price (per line = price × qty)
  - Total row: "Total" label + bold orange price
- Divider line
- "Your Details" section:
  - Full Name input (required)
  - Roll Number input (required, placeholder "e.g. BT22CSE045")
  - Special Notes textarea (optional, rows=2, placeholder "e.g. Less spicy, extra chutney...")
- Error message box (red bg, border, rounded) shown when there's a validation/server error
- "Place Order →" button: full-width, orange, disabled + spinner when loading

CONFIRMATION VIEW (replaces whole page):
- Centered card, max-w-md
- Green checkmark circle icon
- "Order Placed!" h1 + "Hey [Name], your food is being prepared 🍽️"
- Big orange card showing the Order ID (mono font, large, bold) with subtitle "Show this ID at the canteen counter"
- Gray box showing "Amount to pay at counter" and the total in large bold text
- Small note: "Your order has been recorded. The canteen will have it ready — skip the queue!"
- "Place Another Order" full-width orange button

BEHAVIOR (use useState, pass as props — no actual API call needed, just show the interface):
- addToCart, removeFromCart, clearCart functions
- handlePlaceOrder that shows a loading state then confirmation
- Basic validation: name required, roll number required, cart non-empty

Export as: export default function CanteenPreorderPage()
Use Tailwind only, no external UI library.
```

---

### Step 3 — Copy the generated code

When v0 generates the component:

1. Click **"Copy code"** in the v0 output panel.
2. Open the file `frontend/src/pages/CanteenPreorderPage.tsx`.
3. **Replace its entire contents** with the v0-generated code.
4. Make sure the top of the file still has the `useState` import and that the function is exported as default.

### Step 4 — Wire up the API call

After pasting the v0 code, replace the placeholder `handlePlaceOrder` with the real API call.
Find where v0 simulated the order submission and replace it with:

```ts
const res = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentName,
    rollNo,
    items: cart.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
    notes,
  }),
});
if (!res.ok) throw new Error('Order failed');
const data = await res.json(); // { orderId, totalPrice }
// set confirmed state with data.orderId and data.totalPrice
```

The existing `CanteenPreorderPage.tsx` already has this wired correctly if you prefer
to keep it and just use it as a design reference for v0.
