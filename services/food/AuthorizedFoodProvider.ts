import { FoodProvider } from './FoodProvider';
import {
  FoodStation,
  FoodRestaurant,
  FoodMenuItem,
  FoodOrder,
  CreateFoodOrderRequest
} from '@/types/food';

/**
 * Production-ready Authorized Food Provider implementation.
 * Points to official e-catering/railway delivery partner API integration.
 */
export class AuthorizedFoodProvider implements FoodProvider {
  async getStations(trainNumber: string): Promise<FoodStation[]> {
    throw new Error('AuthorizedFoodProvider not connected. Please use MockFoodProvider/Demo mode.');
  }

  async getRestaurants(stationCode: string): Promise<FoodRestaurant[]> {
    throw new Error('AuthorizedFoodProvider not connected.');
  }

  async getMenu(restaurantId: string): Promise<FoodMenuItem[]> {
    throw new Error('AuthorizedFoodProvider not connected.');
  }

  async createOrder(request: CreateFoodOrderRequest): Promise<FoodOrder> {
    throw new Error('AuthorizedFoodProvider not connected.');
  }

  async getOrderStatus(orderId: string): Promise<FoodOrder | null> {
    throw new Error('AuthorizedFoodProvider not connected.');
  }

  async cancelOrder(orderId: string): Promise<void> {
    throw new Error('AuthorizedFoodProvider not connected.');
  }
}
