import { FoodProvider } from './FoodProvider';
import {
  FoodStation,
  FoodRestaurant,
  FoodMenuItem,
  FoodOrder,
  CreateFoodOrderRequest,
  FoodOrderItem
} from '@/types/food';
import { foodDb } from '@/lib/food-db';

// Static seed data for Mock Restaurants
const MOCK_RESTAURANTS: FoodRestaurant[] = [
  {
    id: 'rest_gaurav',
    providerId: 'mock_food_prov',
    name: '✨ Gaurav Vaishno Dhaba',
    description: 'Authentic pure vegetarian Punjabi meals and clay-oven rotis.',
    rating: 4.6,
    cuisines: ['North Indian', 'Veg', 'Punjabi'],
    stationCodes: ['UMB', 'LDH', 'NDLS', 'KOTA', 'RTM'],
    isActive: true,
    isVeg: true,
    deliveryTimeMinutes: 25,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rest_pind',
    providerId: 'mock_food_prov',
    name: '🍛 Pind Balluchi Express',
    description: 'Rich slow-cooked biryanis, kebabs, and traditional drinks.',
    rating: 4.4,
    cuisines: ['Biryani', 'Mughlai', 'Tandoori'],
    stationCodes: ['UMB', 'LDH', 'NDLS', 'BRC', 'ST'],
    isActive: true,
    isVeg: false,
    deliveryTimeMinutes: 30,
    imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=120&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rest_dominos',
    providerId: 'mock_food_prov',
    name: '🍕 Domino\'s Station Delivery',
    description: 'Hot oven-baked pizzas, garlic breads, and choco lava cakes.',
    rating: 4.3,
    cuisines: ['Italian', 'Fast Food', 'Pizza'],
    stationCodes: ['UMB', 'NDLS', 'KOTA', 'ST', 'BRC', 'MMCT'],
    isActive: true,
    isVeg: false,
    deliveryTimeMinutes: 20,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rest_haldirams',
    providerId: 'mock_food_prov',
    name: '😋 Haldiram\'s Express',
    description: 'Savoury snacks, pure ghee sweets, and hygienic North & South meals.',
    rating: 4.5,
    cuisines: ['Snacks', 'Indian Sweets', 'South Indian'],
    stationCodes: ['NDLS', 'KOTA', 'RTM', 'MMCT'],
    isActive: true,
    isVeg: true,
    deliveryTimeMinutes: 20,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=120&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rest_rail_darbar',
    providerId: 'mock_food_prov',
    name: '🍱 IRCTC Jan Ahaar (Rail Darbar)',
    description: 'Hygienic standard train thalis, egg biryanis, and breakfast cutlets.',
    rating: 4.1,
    cuisines: ['Indian Thali', 'Veg', 'Non-Veg'],
    stationCodes: ['ALL'], // Fallback for all other stations
    isActive: true,
    isVeg: false,
    deliveryTimeMinutes: 15,
    imageUrl: 'https://images.unsplash.com/photo-1612442490216-c9d34177b966?w=120&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Static seed data for Mock Menu Items
const MOCK_MENU_ITEMS: FoodMenuItem[] = [
  // rest_gaurav items
  {
    id: 'menu_gaurav_thali',
    restaurantId: 'rest_gaurav',
    name: 'Executive Deluxe Veg Thali',
    description: 'Shahi Paneer, Dal Makhani, Mix Veg, Rice, 3 Butter Rotis, Salad, Sweet.',
    category: 'Meals',
    price: 190,
    imageUrl: 'https://images.unsplash.com/photo-1612442490216-c9d34177b966?w=120&auto=format&fit=crop&q=60',
    isVeg: true,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'menu_gaurav_paneer',
    restaurantId: 'rest_gaurav',
    name: 'Paneer Butter Masala',
    description: 'Rich and creamy cottage cheese gravy cooked in butter and tomato base.',
    category: 'North Indian',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=120&auto=format&fit=crop&q=60',
    isVeg: true,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'menu_gaurav_naan',
    restaurantId: 'rest_gaurav',
    name: 'Butter Roti (Tandoori)',
    description: 'Whole wheat flour flatbread cooked in clay tandoor with fresh butter.',
    category: 'North Indian',
    price: 15,
    imageUrl: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=120&auto=format&fit=crop&q=60',
    isVeg: true,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // rest_pind items
  {
    id: 'menu_pind_biryani_veg',
    restaurantId: 'rest_pind',
    name: 'Handi Veg Biryani',
    description: 'Fragrant Basmati rice cooked with fresh seasonal vegetables and select spices.',
    category: 'Biryani',
    price: 210,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=120&auto=format&fit=crop&q=60',
    isVeg: true,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'menu_pind_biryani_chicken',
    restaurantId: 'rest_pind',
    name: 'Hyderabadi Chicken Biryani',
    description: 'Authentic dum biryani layered with marinated chicken, saffron, and fried onions.',
    category: 'Biryani',
    price: 260,
    imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=120&auto=format&fit=crop&q=60',
    isVeg: false,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'menu_pind_lassi',
    restaurantId: 'rest_pind',
    name: 'Kesar Pista Lassi',
    description: 'Sweet churned yogurt flavored with saffron, cardamom, and chopped pistachios.',
    category: 'Beverages',
    price: 60,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=120&auto=format&fit=crop&q=60',
    isVeg: true,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // rest_dominos items
  {
    id: 'menu_dominos_peppy',
    restaurantId: 'rest_dominos',
    name: 'Peppy Paneer Pizza (Medium)',
    description: 'Chunky paneer with capsicum and spicy red pepper in a thick crust base.',
    category: 'Popular',
    price: 320,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&auto=format&fit=crop&q=60',
    isVeg: true,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'menu_dominos_bread',
    restaurantId: 'rest_dominos',
    name: 'Stuffed Garlic Bread',
    description: 'Garlic bread stuffed with sweet corn, jalapenos, and melted mozzarella cheese.',
    category: 'Snacks',
    price: 140,
    imageUrl: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=120&auto=format&fit=crop&q=60',
    isVeg: true,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // rest_haldirams items
  {
    id: 'menu_haldiram_chole',
    restaurantId: 'rest_haldirams',
    name: 'Delhi Style Chole Bhature',
    description: 'Spicy chickpeas served with two fluffy fried leavened bread, pickle, and onions.',
    category: 'Popular',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=120&auto=format&fit=crop&q=60',
    isVeg: true,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'menu_haldiram_kachori',
    restaurantId: 'rest_haldirams',
    name: 'Shahi Raj Kachori',
    description: 'Crispy deep-fried shell filled with potato cubes, sprouts, yogurt, chutneys, and sev.',
    category: 'Snacks',
    price: 90,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=120&auto=format&fit=crop&q=60',
    isVeg: true,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // rest_rail_darbar items (Fallback)
  {
    id: 'menu_rail_veg_thali',
    restaurantId: 'rest_rail_darbar',
    name: 'Standard Veg Thali',
    description: 'Seasonal Sabzi, Yellow Dal, Rice, 3 Parathas, Pickle, and Sweet Curd.',
    category: 'Meals',
    price: 110,
    imageUrl: 'https://images.unsplash.com/photo-1612442490216-c9d34177b966?w=120&auto=format&fit=crop&q=60',
    isVeg: true,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'menu_rail_egg_biryani',
    restaurantId: 'rest_rail_darbar',
    name: 'Egg Biryani (2 Eggs)',
    description: 'Basmati rice cooked with hard-boiled eggs and spiced gravy, served with Raita.',
    category: 'Biryani',
    price: 140,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=120&auto=format&fit=crop&q=60',
    isVeg: false,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'menu_rail_chai',
    restaurantId: 'rest_rail_darbar',
    name: 'Cardamom Milk Tea (Adrak Chai)',
    description: 'Freshly brewed loose-leaf milk tea infused with cardamom and ginger.',
    category: 'Beverages',
    price: 20,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=120&auto=format&fit=crop&q=60',
    isVeg: true,
    available: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class MockFoodProvider implements FoodProvider {
  async getStations(trainNumber: string): Promise<FoodStation[]> {
    // Dynamic matching of major stations depending on train number
    if (trainNumber === '12951' || trainNumber === '12952') {
      return [
        { code: 'ST', name: 'Surat', latitude: 21.2044, longitude: 72.8406, eta: '10:10 AM', deliveryAvailable: true },
        { code: 'BRC', name: 'Vadodara JN', latitude: 22.3106, longitude: 73.1806, eta: '11:55 AM', deliveryAvailable: true },
        { code: 'RTM', name: 'Ratlam JN', latitude: 23.3361, longitude: 75.0381, eta: '3:20 PM', deliveryAvailable: true },
        { code: 'KOTA', name: 'Kota JN', latitude: 25.2138, longitude: 75.8648, eta: '6:40 PM', deliveryAvailable: true },
      ];
    }

    if (trainNumber === '12013' || trainNumber === '12014') {
      return [
        { code: 'UMB', name: 'Ambala Cantt', latitude: 30.3782, longitude: 76.7767, eta: '7:05 PM', deliveryAvailable: true },
        { code: 'LDH', name: 'Ludhiana JN', latitude: 30.9022, longitude: 75.8486, eta: '8:50 PM', deliveryAvailable: true },
        { code: 'JUC', name: 'Jalandhar City', latitude: 31.3256, longitude: 75.5792, eta: '9:40 PM', deliveryAvailable: true },
      ];
    }

    // Default fallback stations list for any other train numbers
    return [
      { code: 'NDLS', name: 'New Delhi', latitude: 28.6419, longitude: 77.2218, eta: '12:15 PM', deliveryAvailable: true },
      { code: 'UMB', name: 'Ambala Cantt', latitude: 30.3782, longitude: 76.7767, eta: '2:50 PM', deliveryAvailable: true },
      { code: 'LDH', name: 'Ludhiana JN', latitude: 30.9022, longitude: 75.8486, eta: '4:20 PM', deliveryAvailable: true },
    ];
  }

  async getRestaurants(stationCode: string): Promise<FoodRestaurant[]> {
    const list = MOCK_RESTAURANTS.filter((r) =>
      r.stationCodes.includes(stationCode) || r.stationCodes.includes('ALL')
    );

    // Ensure we always have at least 2 restaurants
    if (list.length < 2) {
      return MOCK_RESTAURANTS.filter((r) => r.id === 'rest_rail_darbar' || r.id === 'rest_gaurav');
    }
    return list;
  }

  async getMenu(restaurantId: string): Promise<FoodMenuItem[]> {
    const items = MOCK_MENU_ITEMS.filter((item) => item.restaurantId === restaurantId);
    if (items.length === 0) {
      // Fallback to rail darbar items if no specific matches
      return MOCK_MENU_ITEMS.filter((item) => item.restaurantId === 'rest_rail_darbar');
    }
    return items;
  }

  async createOrder(request: CreateFoodOrderRequest): Promise<FoodOrder> {
    // 1. Calculate pricing securely on backend
    let subtotal = 0;
    const itemsWithPrices: FoodOrderItem[] = [];

    for (const reqItem of request.items) {
      const menuObj = MOCK_MENU_ITEMS.find((m) => m.id === reqItem.menuItemId);
      if (!menuObj) {
        throw new Error(`Menu item ${reqItem.menuItemId} is not available.`);
      }

      const totalItemPrice = menuObj.price * reqItem.quantity;
      subtotal += totalItemPrice;

      itemsWithPrices.push({
        id: `${menuObj.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId: '', // Filled below
        menuItemId: menuObj.id,
        name: menuObj.name,
        quantity: reqItem.quantity,
        unitPrice: menuObj.price,
        totalPrice: totalItemPrice,
        specialInstructions: reqItem.specialInstructions
      });
    }

    const deliveryFee = 30;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + deliveryFee + tax;

    const orderId = `RG-${10000 + Math.floor(Math.random() * 90000)}`;

    const newOrder: FoodOrder = {
      id: orderId,
      userId: 'anonymous_user',
      providerOrderId: `MOCK_PROV_${orderId}`,
      trainNumber: request.trainNumber,
      stationCode: request.stationCode,
      stationName: request.stationName,
      passengerName: request.passengerName,
      passengerPhone: request.passengerPhone,
      coach: request.coach,
      seat: request.seat,
      status: 'ORDER_PLACED',
      subtotal,
      deliveryFee,
      tax,
      total,
      paymentStatus: request.paymentMethod === 'DEMO_PAY' ? 'PAID' : 'PENDING',
      paymentMethod: request.paymentMethod,
      items: itemsWithPrices.map(item => ({ ...item, orderId })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    foodDb.createOrder(newOrder);
    return newOrder;
  }

  async getOrderStatus(orderId: string): Promise<FoodOrder | null> {
    return foodDb.getOrderById(orderId);
  }

  async cancelOrder(orderId: string): Promise<void> {
    foodDb.cancelOrder(orderId);
  }
}
