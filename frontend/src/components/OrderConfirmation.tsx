interface OrderConfirmationProps {
  orderId: string;
  totalPrice: number;
  studentName: string;
  onNewOrder: () => void;
}

export default function OrderConfirmation({
  orderId,
  totalPrice,
  studentName,
  onNewOrder,
}: OrderConfirmationProps) {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 text-center space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Placed!</h1>
          <p className="text-gray-500 mt-1">
            Hey {studentName}, your food is being prepared 🍽️
          </p>
        </div>

        {/* Order ID Box */}
        <div className="bg-orange-600 text-white rounded-2xl p-5">
          <p className="text-xs font-medium uppercase tracking-widest opacity-80 mb-2">
            Your Order ID
          </p>
          <p className="text-2xl font-bold font-mono tracking-wide">{orderId}</p>
          <p className="text-xs opacity-80 mt-2">
            Show this ID at the canteen counter to collect your order
          </p>
        </div>

        {/* Total */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-500">Amount to pay at counter</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">₹{totalPrice}</p>
        </div>

        {/* Info note */}
        <p className="text-xs text-gray-400">
          Your order has been recorded. The canteen will have it ready — skip the queue!
        </p>

        {/* New Order Button */}
        <button
          onClick={onNewOrder}
          className="btn-primary"
        >
          Place Another Order
        </button>
      </div>
    </div>
  );
}
