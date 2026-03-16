import { MenuItem, CartItem } from '../types';

interface MenuListProps {
  items: MenuItem[];
  cartItems: CartItem[];
  onAdd: (item: MenuItem) => void;
  onRemove: (itemId: string) => void;
}

const CATEGORY_LABELS: Record<MenuItem['category'], string> = {
  meal: '🍽️ Meals',
  snack: '🥪 Snacks',
  beverage: '☕ Beverages',
};

export default function MenuList({ items, cartItems, onAdd, onRemove }: MenuListProps) {
  const categories: MenuItem['category'][] = ['meal', 'snack', 'beverage'];

  const getCartQty = (id: string) =>
    cartItems.find((c) => c.id === id)?.quantity ?? 0;

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <div key={cat}>
            <h2 className="text-sm font-semibold text-orange-700 uppercase tracking-wider mb-3">
              {CATEGORY_LABELS[cat]}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {catItems.map((item) => {
                const qty = getCartQty(item.id);
                return (
                  <div key={item.id} className="card p-4 flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {item.name}
                        </h3>
                        <span className="font-bold text-orange-600 whitespace-nowrap">
                          ₹{item.price}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="mt-3">
                        {qty === 0 ? (
                          <button
                            onClick={() => onAdd(item)}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition-colors"
                          >
                            + Add
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onRemove(item.id)}
                              className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold text-lg flex items-center justify-center transition-colors"
                            >
                              −
                            </button>
                            <span className="w-6 text-center font-semibold text-gray-800">
                              {qty}
                            </span>
                            <button
                              onClick={() => onAdd(item)}
                              className="w-8 h-8 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
