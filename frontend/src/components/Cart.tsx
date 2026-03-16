import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onAdd: (item: CartItem) => void;
  onRemove: (itemId: string) => void;
  onClear: () => void;
  studentName: string;
  rollNo: string;
  notes: string;
  onStudentNameChange: (v: string) => void;
  onRollNoChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onPlaceOrder: () => void;
  loading: boolean;
  error: string | null;
}

export default function Cart({
  items,
  onAdd,
  onRemove,
  onClear,
  studentName,
  rollNo,
  notes,
  onStudentNameChange,
  onRollNoChange,
  onNotesChange,
  onPlaceOrder,
  loading,
  error,
}: CartProps) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const isEmpty = items.length === 0;

  return (
    <div className="card p-5 space-y-5">
      {/* Cart Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">
          🛒 Your Order
        </h2>
        {!isEmpty && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Cart Items */}
      {isEmpty ? (
        <div className="text-center py-8">
          <p className="text-4xl mb-2">🍽️</p>
          <p className="text-gray-500 text-sm">
            Add items from the menu to get started
          </p>
        </div>
      ) : (
        <>
          <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                  {item.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold flex items-center justify-center transition-colors"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onAdd(item)}
                    className="w-6 h-6 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-bold flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="w-14 text-right text-sm font-semibold text-orange-600">
                  ₹{item.price * item.quantity}
                </span>
              </li>
            ))}
          </ul>

          {/* Total */}
          <div className="flex items-center justify-between pt-1 border-t border-orange-200">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="text-xl font-bold text-orange-600">₹{total}</span>
          </div>
        </>
      )}

      {/* Divider */}
      <hr className="border-orange-100" />

      {/* Student Details Form */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Your Details
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input-field text-sm"
              placeholder="e.g. Vivek Sharma"
              value={studentName}
              onChange={(e) => onStudentNameChange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Roll Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input-field text-sm"
              placeholder="e.g. BT22CSE045"
              value={rollNo}
              onChange={(e) => onRollNoChange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Special Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              className="input-field text-sm resize-none"
              placeholder="e.g. Less spicy, extra chutney..."
              rows={2}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          ⚠️ {error}
        </p>
      )}

      {/* Place Order Button */}
      <button
        className="btn-primary"
        onClick={onPlaceOrder}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Placing Order…
          </span>
        ) : (
          'Place Order →'
        )}
      </button>
    </div>
  );
}
