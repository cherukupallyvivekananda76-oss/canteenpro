export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  image?: string;
  category: 'meal' | 'snack' | 'beverage';
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderPayload {
  studentName: string;
  rollNo: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  notes: string;
}

export interface OrderResponse {
  orderId: string;
  totalPrice: number;
}
