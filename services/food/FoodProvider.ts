import {
  FoodStation,
  FoodRestaurant,
  FoodMenuItem,
  FoodOrder,
  CreateFoodOrderRequest
} from '@/types/food';

export interface FoodProvider {
  /**
   * Get delivery-eligible stations along the train's route
   */
  getStations(trainNumber: string): Promise<FoodStation[]>;

  /**
   * Get available restaurants at a specific station
   */
  getRestaurants(stationCode: string): Promise<FoodRestaurant[]>;

  /**
   * Get menu items for a specific restaurant
   */
  getMenu(restaurantId: string): Promise<FoodMenuItem[]>;

  /**
   * Submit/create a new food order
   */
  createOrder(request: CreateFoodOrderRequest): Promise<FoodOrder>;

  /**
   * Get current live details of an order
   */
  getOrderStatus(orderId: string): Promise<FoodOrder | null>;

  /**
   * Cancel an active order
   */
  cancelOrder(orderId: string): Promise<void>;
}
