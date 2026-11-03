import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { FoodMenuItem } from '@/types/food';
import { useFoodCart } from '@/hooks/useFood';
import { cn } from '@/utils/cn';

interface FoodItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FoodMenuItem | null;
}

export function FoodItemModal({ isOpen, onClose, item }: FoodItemModalProps) {
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Spicy'>('Medium');
  const [instructions, setInstructions] = useState('');
  const addItem = useFoodCart((state) => state.addItem);
  const updateInstructions = useFoodCart((state) => state.updateInstructions);

  if (!isOpen || !item) return null;

  const handleAdd = () => {
    // Validate special instructions to avoid arbitrary unsafe text
    const cleanInstructions = instructions
      .replace(/[^a-zA-Z0-9\s.,!?-]/g, '') // Sanitize
      .slice(0, 100); // Max length limit

    const fullInstructions = `Spice: ${spiceLevel}${
      cleanInstructions ? ` | Instructions: ${cleanInstructions}` : ''
    }`;

    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      isVeg: item.isVeg,
    });

    // Save instructions on the cart item
    updateInstructions(item.id, fullInstructions);
    onClose();
    setInstructions('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Overlay Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-5">
          {/* Header */}
          <div className="pr-8">
            <span
              className={cn(
                'inline-flex text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border mb-2',
                item.isVeg
                  ? 'border-emerald-500/30 bg-emerald-550/5 text-emerald-500'
                  : 'border-rose-500/30 bg-rose-550/5 text-rose-550'
              )}
            >
              {item.isVeg ? 'Veg' : 'Non-Veg'}
            </span>
            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
              Customize {item.name}
            </h3>
            <p className="text-[10.5px] text-slate-400 dark:text-slate-450 font-medium mt-1 leading-normal">
              {item.description}
            </p>
          </div>

          <div className="h-[1px] bg-slate-200 dark:bg-slate-850" />

          {/* Spice Customization */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Spice Level
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['Mild', 'Medium', 'Spicy'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSpiceLevel(level)}
                  className={cn(
                    'flex h-9 items-center justify-center gap-1.5 rounded-xl border text-[11px] font-black transition-all outline-none active:scale-95',
                    spiceLevel === level
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-550 hover:bg-slate-100'
                  )}
                >
                  {spiceLevel === level && <Check className="h-3 w-3 stroke-[3]" />}
                  <span>{level}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Special Instructions (Sanitized Input) */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Special Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value.slice(0, 100))}
              placeholder="E.g., Less oil, no onions, extra lemon slice..."
              rows={2}
              className="w-full text-xs font-semibold p-3.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 rounded-2xl outline-none focus:border-rail-blue transition-colors text-slate-800 dark:text-white resize-none"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-extrabold px-0.5">
              <span>Only alphanumeric and space allowed</span>
              <span>{instructions.length}/100</span>
            </div>
          </div>

          <div className="h-[1px] bg-slate-200 dark:bg-slate-850" />

          {/* Add to Cart Actions */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">
                Price
              </p>
              <p className="text-base font-black text-slate-900 dark:text-white mt-1 leading-none">
                ₹{item.price}
              </p>
            </div>

            <button
              onClick={handleAdd}
              className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
            >
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
