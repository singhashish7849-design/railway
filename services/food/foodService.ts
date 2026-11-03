import { FoodProvider } from './FoodProvider';
import { MockFoodProvider } from './MockFoodProvider';
import { AuthorizedFoodProvider } from './AuthorizedFoodProvider';

class FoodService {
  private activeProvider: FoodProvider;
  private isDemo: boolean;

  constructor() {
    // Determine active provider based on environment variables
    const useProductionProvider = process.env.FOOD_PROVIDER_MODE === 'production';
    
    if (useProductionProvider) {
      this.activeProvider = new AuthorizedFoodProvider();
      this.isDemo = false;
    } else {
      this.activeProvider = new MockFoodProvider();
      this.isDemo = true;
    }
  }

  /**
   * Returns the active food ordering provider instance
   */
  getProvider(): FoodProvider {
    return this.activeProvider;
  }

  /**
   * Check if food ordering runs in demo mode (Mock provider)
   */
  isDemoMode(): boolean {
    return this.isDemo;
  }
}

export const foodService = new FoodService();
export default foodService;
