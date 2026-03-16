# Campus Canteen Preorder System

A minimal full-stack web app where students can pre-order food from the college canteen to skip queues.

## Tech Stack

| Layer    | Tech                             |
|----------|----------------------------------|
| Frontend | React 18 · TypeScript · Vite 5   |
| Styling  | Tailwind CSS 3                   |
| Backend  | Node.js · Express · TypeScript   |
| Storage  | `orders.csv` file on disk        |

---

## Folder Structure

```
canteenproj/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── orders.csv          ← auto-created on first order
│   └── src/
│       ├── server.ts
│       ├── routes/
│       │   └── orders.ts
│       └── utils/
│           ├── generateOrderId.ts
│           └── writeCsv.ts
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── data/menu.ts
│       ├── types/index.ts
│       ├── components/
│       │   ├── MenuList.tsx
│       │   ├── Cart.tsx
│       │   └── OrderConfirmation.tsx
│       └── pages/
│           └── CanteenPreorderPage.tsx
│
└── README.md
```

---

## Running the App

### 1. Install dependencies

Open **two terminals**, one inside `backend/` and one inside `frontend/`.

```bash
# Terminal 1 — Backend
cd backend
npm install
```

```bash
# Terminal 2 — Frontend
cd frontend
npm install
```

### 2. Start the backend

```bash
# Terminal 1
cd backend
npm run dev
```

Server starts at **http://localhost:3001**

### 3. Start the frontend

```bash
# Terminal 2
cd frontend
npm run dev
```

App opens at **http://localhost:5173**

> Vite proxies `/api/*` requests to the backend automatically — no CORS issues.

---

## How It Works

1. Student opens the app, picks items from the menu, fills in name + roll number.
2. Clicks **Place Order** → frontend calls `POST /api/orders`.
3. Backend generates an order ID like `CTN-20260314-0001`, appends a row to `orders.csv`, and returns the ID.
4. Student sees a confirmation screen with the order ID and amount.
5. **Canteen head opens `backend/orders.csv` in Excel** to see all orders.

### CSV columns

| Column         | Example                           |
|---------------|-----------------------------------|
| order_id       | CTN-20260314-0001                 |
| student_name   | Vivek Sharma                      |
| roll_no        | BT22CSE045                        |
| items          | Veg Thali x1; Tea x2              |
| total_price    | 80.00                             |
| notes          | Less spicy                        |
| timestamp      | 2026-03-14T10:30:00.000Z          |

---

## API Reference

### `POST /api/orders`

**Request body:**
```json
{
  "studentName": "Vivek Sharma",
  "rollNo": "BT22CSE045",
  "items": [
    { "id": "1", "name": "Veg Thali", "price": 60, "quantity": 1 },
    { "id": "6", "name": "Tea", "price": 10, "quantity": 2 }
  ],
  "notes": "Less spicy"
}
```

**Response `201`:**
```json
{
  "orderId": "CTN-20260314-0001",
  "totalPrice": 80
}
```

---

## Using v0 to Regenerate / Improve the UI

The main page (`src/pages/CanteenPreorderPage.tsx`) was designed to integrate with [v0.dev](https://v0.dev).
See the `V0_PROMPT.md` file for the exact prompt to use if you want v0 to redesign the UI.

---

## Customising the Menu

Edit `frontend/src/data/menu.ts` to add, remove, or change items. Each item has:

```ts
{
  id: string;        // unique identifier
  name: string;
  description: string;
  price: number;     // in ₹
  emoji: string;
  category: 'meal' | 'snack' | 'beverage';
}
```
