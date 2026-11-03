export type FoodOrderStatus =
  | 'ORDER_PLACED'
  | 'RESTAURANT_ACCEPTED'
  | 'FOOD_PREPARING'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';

export interface FoodStation {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  eta: string;
  deliveryAvailable: boolean;
}

export interface FoodRestaurant {
  id: string;
  providerId: string;
  name: string;
  description: string;
  rating: number;
  cuisines: string[];
  stationCodes: string[];
  isActive: boolean;
  isVeg: boolean;
  deliveryTimeMinutes: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodMenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  category: 'Popular' | 'Meals' | 'Biryani' | 'North Indian' | 'Snacks' | 'Beverages';
  price: number;
  imageUrl?: string;
  isVeg: boolean;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodOrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface FoodOrder {
  id: string;
  userId: string;
  providerOrderId: string;
  trainNumber: string;
  stationCode: string;
  stationName: string;
  passengerName: string;
  passengerPhone: string;
  coach: string;
  seat: string;
  status: FoodOrderStatus;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  paymentMethod: 'DEMO_PAY' | 'UPI' | 'CARD';
  items: FoodOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodOrderRequest {
  trainNumber: string;
  stationCode: string;
  stationName: string;
  passengerName: string;
  passengerPhone: string;
  coach: string;
  seat: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  paymentMethod: 'DEMO_PAY' | 'UPI' | 'CARD';
}
