import React from 'react';
import { Check, Dot, AlertCircle } from 'lucide-react';
import { FoodOrderStatus } from '@/types/food';
import { cn } from '@/utils/cn';

interface FoodOrderTrackerProps {
  status: FoodOrderStatus;
}

interface Step {
  key: string;
  label: string;
  sublabel: string;
  statuses: FoodOrderStatus[];
}

const STEPS: Step[] = [
  {
    key: 'placed',
    label: 'Order Confirmed',
    sublabel: 'Order ID generated & sent to vendor.',
    statuses: ['ORDER_PLACED', 'RESTAURANT_ACCEPTED', 'FOOD_PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED']
  },
  {
    key: 'accepted',
    label: 'Restaurant Accepted',
    sublabel: 'Kitchen has acknowledged your request.',
    statuses: ['RESTAURANT_ACCEPTED', 'FOOD_PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED']
  },
  {
    key: 'preparing',
    label: 'Preparing Meal',
    sublabel: 'Chef is preparing your fresh train meals.',
    statuses: ['FOOD_PREPARING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED']
  },
  {
    key: 'ready',
    label: 'Packed & Ready',
    sublabel: 'Food is packed in thermal delivery bags.',
    statuses: ['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED']
  },
  {
    key: 'out',
    label: 'Out for Delivery',
    sublabel: 'Delivery executive is waiting at the platform.',
    statuses: ['OUT_FOR_DELIVERY', 'DELIVERED']
  },
  {
    key: 'delivered',
    label: 'Delivered to Seat',
    sublabel: 'Food handed over successfully at your berth.',
    statuses: ['DELIVERED']
  }
];

export function FoodOrderTracker({ status }: FoodOrderTrackerProps) {
  if (status === 'CANCELLED') {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-5 flex items-start gap-4">
        <div className="h-9 w-9 rounded-2xl bg-rose-500/20 text-rose-550 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-900 dark:text-white leading-none">
            Food Order Cancelled
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-450 font-semibold mt-1 leading-normal">
            This order has been cancelled and any payments have been credited back.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'FAILED') {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-5 flex items-start gap-4">
        <div className="h-9 w-9 rounded-2xl bg-rose-500/20 text-rose-550 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-900 dark:text-white leading-none">
            Delivery Failed
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-450 font-semibold mt-1 leading-normal">
            The delivery could not be completed at the station (e.g. train halt was missed). Refund initiated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-1">
        Preparation Timeline
      </h3>

      <div className="relative pl-7 space-y-6">
        {/* Central Vertical Connector Line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-[1.5px] bg-slate-100 dark:bg-slate-800" />

        {STEPS.map((step, idx) => {
          const isDone = step.statuses.includes(status);
          const isCurrent = (idx === 0 && status === 'ORDER_PLACED') ||
            (idx === 1 && status === 'RESTAURANT_ACCEPTED') ||
            (idx === 2 && status === 'FOOD_PREPARING') ||
            (idx === 3 && status === 'READY_FOR_DELIVERY') ||
            (idx === 4 && status === 'OUT_FOR_DELIVERY') ||
            (idx === 5 && status === 'DELIVERED');

          return (
            <div key={step.key} className="relative group">
              {/* Checkbox Node Pin */}
              <div
                className={cn(
                  'absolute -left-[23.5px] top-0.5 h-[17px] w-[17px] rounded-full border-[1.5px] flex items-center justify-center transition-all flex-shrink-0 z-10',
                  isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500 animate-pulse'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-300'
                )}
              >
                {isDone && !isCurrent ? (
                  <Check className="h-2.5 w-2.5 stroke-[4]" />
                ) : (
                  <div className={cn('h-1.5 w-1.5 rounded-full', isCurrent ? 'bg-emerald-500' : 'bg-slate-350')} />
                )}
              </div>

              <div>
                <h4
                  className={cn(
                    'text-xs font-black leading-none',
                    isDone || isCurrent ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                  )}
                >
                  {step.label}
                </h4>
                <p
                  className={cn(
                    'text-[10px] font-semibold mt-1 leading-normal',
                    isDone || isCurrent ? 'text-slate-450 dark:text-slate-400' : 'text-slate-400/70'
                  )}
                >
                  {step.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
