import fs from 'fs';
import path from 'path';
import { FoodOrder, FoodOrderStatus } from '@/types/food';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'food_ordering_db.json');

interface DbSchema {
  orders: FoodOrder[];
}

function readDb(): DbSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultDb = { orders: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read food database, recreating:', err);
    const defaultDb = { orders: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }
}

function writeDb(data: DbSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Gets the simulated current status of an order based on time elapsed since creation.
 * This makes the live food tracker feel fully dynamic in demo mode!
 */
export function getSimulatedOrderStatus(order: FoodOrder): FoodOrderStatus {
  if (order.status === 'CANCELLED' || order.status === 'FAILED') {
    return order.status;
  }

  const elapsedMs = Date.now() - new Date(order.createdAt).getTime();
  const elapsedMinutes = elapsedMs / 60000;

  if (elapsedMinutes < 0.5) return 'ORDER_PLACED';
  if (elapsedMinutes < 1.5) return 'RESTAURANT_ACCEPTED';
  if (elapsedMinutes < 3) return 'FOOD_PREPARING';
  if (elapsedMinutes < 5) return 'READY_FOR_DELIVERY';
  if (elapsedMinutes < 8) return 'OUT_FOR_DELIVERY';
  return 'DELIVERED';
}

export const foodDb = {
  getOrders(): FoodOrder[] {
    const db = readDb();
    return db.orders.map(order => ({
      ...order,
      status: getSimulatedOrderStatus(order)
    }));
  },

  getOrderById(id: string): FoodOrder | null {
    const db = readDb();
    const order = db.orders.find((o) => o.id === id);
    if (!order) return null;
    return {
      ...order,
      status: getSimulatedOrderStatus(order)
    };
  },

  createOrder(order: FoodOrder): void {
    const db = readDb();
    db.orders.push(order);
    writeDb(db);
  },

  updateOrderStatus(id: string, status: FoodOrderStatus): void {
    const db = readDb();
    const orderIndex = db.orders.findIndex((o) => o.id === id);
    if (orderIndex !== -1) {
      db.orders[orderIndex].status = status;
      db.orders[orderIndex].updatedAt = new Date().toISOString();
      writeDb(db);
    }
  },

  cancelOrder(id: string): void {
    const db = readDb();
    const orderIndex = db.orders.findIndex((o) => o.id === id);
    if (orderIndex !== -1) {
      // Allow cancellation only if not already delivered
      const currentStatus = getSimulatedOrderStatus(db.orders[orderIndex]);
      if (currentStatus !== 'DELIVERED' && currentStatus !== 'OUT_FOR_DELIVERY') {
        db.orders[orderIndex].status = 'CANCELLED';
        db.orders[orderIndex].updatedAt = new Date().toISOString();
        writeDb(db);
      } else {
        throw new Error('Cannot cancel order that is out for delivery or delivered.');
      }
    }
  }
};
