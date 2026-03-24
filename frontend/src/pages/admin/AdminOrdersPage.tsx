import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import { Order } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked Up',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  preparing: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  ready: 'text-green-400 bg-green-400/10 border-green-400/20',
  picked_up: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'picked_up',
};

const NEXT_LABEL: Record<string, string> = {
  pending: 'Mark Preparing',
  preparing: 'Mark Ready',
  ready: 'Mark Picked Up',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr ago`;
}

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get<{ orders: Order[] }>(`/orders${params}`);
      
      const sorted = res.orders.sort((a, b) => {
        // If both have pickup time, sort by time ascending
        if (a.pickupTime && b.pickupTime) {
          if (a.pickupTime === b.pickupTime) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          return a.pickupTime.localeCompare(b.pickupTime);
        }
        // If one has pickup time and the other doesn't, put the one with time first
        if (a.pickupTime && !b.pickupTime) return -1;
        if (!a.pickupTime && b.pickupTime) return 1;
        // If neither have pickup time (old orders), sort by creation time ascending
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      setOrders(sorted);
    } catch {
      // silently fail on polling errors
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setIsLoading(true);
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      await fetchOrders();
    } catch {
      // handle error
    } finally {
      setUpdatingId(null);
    }
  };

  const filters = ['all', 'pending', 'preparing', 'ready', 'picked_up'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Live Orders</h1>
        <button onClick={fetchOrders} className="glass-card p-2 rounded-xl hover:bg-white/5 transition-colors">
          <RefreshCw className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              filter === f
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            {f === 'all' ? 'All' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="glass-card rounded-2xl h-40 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">No orders {filter !== 'all' ? `with status "${STATUS_LABELS[filter]}"` : 'yet'}</p>
          <p className="text-sm">Orders will appear here when students place them.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-mono text-sm text-slate-400">{order.orderId}</p>
                  <p className="font-bold text-white text-lg">{order.studentName}</p>
                  <p className="text-slate-400 text-sm">Roll: {order.rollNo}</p>
                  <p className="text-primary text-sm font-semibold mt-0.5">
                    Pickup: {order.pickupTime || 'ASAP'}
                  </p>
                  {order.utrNumber && (
                    <div className="mt-2 text-xs bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg inline-flex flex-col">
                      <span className="font-semibold tracking-wider">UTR: {order.utrNumber}</span>
                      <span className="opacity-75 text-[10px] uppercase mt-0.5">Verify in PhonePe App</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className="text-slate-500 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeAgo(order.createdAt)}
                  </span>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                {order.items.map(item => (
                  <p key={item.id} className="text-sm text-slate-300">
                    {item.itemName} × {item.quantity} — <span className="text-primary font-semibold">₹{item.itemPrice * item.quantity}</span>
                  </p>
                ))}
                {order.notes && (
                  <p className="text-xs text-slate-500 italic mt-1">Note: {order.notes}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="font-black text-white">Total: ₹{order.totalPrice}</p>
                {NEXT_STATUS[order.status] && (
                  <button
                    onClick={() => updateStatus(order.orderId, NEXT_STATUS[order.status])}
                    disabled={updatingId === order.orderId}
                    className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary text-sm font-bold rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    {updatingId === order.orderId ? 'Updating...' : NEXT_LABEL[order.status]}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
