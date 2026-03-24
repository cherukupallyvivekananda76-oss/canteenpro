import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Clock, Coffee, Sun, Moon } from 'lucide-react';
import { api } from '../../lib/api';
import { MessOrder } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Verification',
  prepared: 'Prepared',
  picked_up: 'Picked Up',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  prepared: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  picked_up: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'prepared',
  prepared: 'picked_up',
};

const NEXT_LABEL: Record<string, string> = {
  pending: 'Verify & Mark Prepared',
  prepared: 'Mark Picked Up',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} hr ago`;
}

const AdminMessOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<MessOrder[]>([]);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      let params = `?date=${filterDate}`;
      if (filterStatus !== 'all') params += `&status=${filterStatus}`;
      const res = await api.get<{ orders: MessOrder[] }>(`/mess-orders${params}`);
      
      const sorted = res.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(sorted);
    } catch {
      // silently fail on polling
    } finally {
      setIsLoading(false);
    }
  }, [filterDate, filterStatus]);

  useEffect(() => {
    setIsLoading(true);
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/mess-orders/${orderId}/status`, { status });
      await fetchOrders();
    } catch {
      // handle error
    } finally {
      setUpdatingId(null);
    }
  };

  const statusFilters = ['all', 'pending', 'prepared', 'picked_up'];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black mb-2">Mess Orders</h1>
          <p className="text-slate-400 text-sm mb-4">Verify UTRs and track student meal preorders.</p>
          <div className="flex gap-2 mb-2 flex-wrap">
            {statusFilters.map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  filterStatus === f
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : STATUS_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="glass-panel bg-white/5 rounded-xl px-4 py-2 text-white outline-none border border-white/10 focus:border-primary/50"
          />
          <button onClick={fetchOrders} className="glass-card p-2 rounded-xl hover:bg-white/5 transition-colors border border-white/10">
            <RefreshCw className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="glass-card rounded-2xl h-48 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">No mess preorders found</p>
          <p className="text-sm">For date: {filterDate}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {orders.map(order => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-mono text-sm text-slate-400 mb-0.5">{order.orderId}</p>
                      <p className="font-bold text-white text-lg">{order.studentName}</p>
                      <p className="text-slate-400 text-sm">Roll: {order.rollNo}</p>
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

                  <div className="py-3 mt-3 border-t border-b border-white/5 space-y-2">
                    {order.wantsBreakfast && (
                      <div className="flex items-center gap-2 text-orange-400">
                        <Coffee className="w-4 h-4" /> <span className="font-semibold text-sm">Breakfast</span>
                      </div>
                    )}
                    {order.wantsLunch && (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Sun className="w-4 h-4" /> <span className="font-semibold text-sm">Lunch</span>
                      </div>
                    )}
                    {order.wantsDinner && (
                      <div className="flex items-center gap-2 text-indigo-400">
                        <Moon className="w-4 h-4" /> <span className="font-semibold text-sm">Dinner</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="font-black text-white text-xl mb-1 mt-2">₹{order.totalPrice}</p>
                    {order.utrNumber && (
                      <div className="mt-1 text-xs bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg inline-flex flex-col">
                        <span className="font-semibold tracking-wider">UTR: {order.utrNumber}</span>
                        <span className="opacity-75 text-[10px] uppercase mt-0.5">Verify in PhonePe</span>
                      </div>
                    )}
                  </div>
                  {NEXT_STATUS[order.status] && (
                    <button
                      onClick={() => updateStatus(order.orderId, NEXT_STATUS[order.status])}
                      disabled={updatingId === order.orderId}
                      className="px-4 py-3 bg-primary/10 border border-primary/30 text-primary text-sm font-bold rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-50 h-10 flex items-center"
                    >
                      {updatingId === order.orderId ? 'Updating...' : NEXT_LABEL[order.status]}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AdminMessOrdersPage;
