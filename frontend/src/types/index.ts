export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  image?: string;
  imageUrl?: string;
  category: 'meal' | 'snack' | 'beverage';
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderPayload {
  collegeCode: string;
  studentName: string;
  rollNo: string;
  pickupTime: string;
  utrNumber: string;
  items: { menuItemId: number; quantity: number }[];
  notes: string;
}

export interface OrderResponse {
  orderId: string;
  totalPrice: number;
}

export interface College {
  id: number;
  name: string;
  code: string;
}

export interface Order {
  id: number;
  orderId: string;
  collegeId: number;
  studentName: string;
  rollNo: string;
  pickupTime: string | null;
  utrNumber: string | null;
  notes: string;
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'picked_up';
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  itemName: string;
  itemPrice: number;
  quantity: number;
}

export interface Scanner {
  id: number;
  collegeId: number;
  name: string;
  scannerToken: string;
  isActive: boolean;
  createdAt: string;
}

export interface CanteenHead {
  id: number;
  name: string;
  email: string;
  collegeId: number;
  collegeCode: string;
  collegeName: string;
}

export interface MessMenu {
  id: number;
  collegeId: number;
  date: string;
  breakfastItems: string;
  breakfastPrice: number;
  lunchItems: string;
  lunchPrice: number;
  dinnerItems: string;
  dinnerPrice: number;
}

export interface MessOrder {
  id: number;
  orderId: string;
  collegeId: number;
  studentName: string;
  rollNo: string;
  date: string;
  wantsBreakfast: boolean;
  wantsLunch: boolean;
  wantsDinner: boolean;
  utrNumber: string | null;
  totalPrice: number;
  status: 'pending' | 'prepared' | 'picked_up';
  createdAt: string;
}
