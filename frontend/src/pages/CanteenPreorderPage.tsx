import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  X, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Flame,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { MENU_ITEMS } from '../data/menu';
import { MenuItem, CartItem } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CanteenPreorderPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    branch: 'CSE 3rd Year',
    notes: ''
  });

  useEffect(() => {
    // Simulate loading for skeleton effect
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existing = cart.find(i => i.id === itemId);
    if (existing?.quantity === 1) {
      setCart(cart.filter(i => i.id !== itemId));
    } else if (existing) {
      setCart(cart.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i));
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = () => {
    if (!formData.name || !formData.rollNo) {
      alert('Please fill in your name and roll number');
      return;
    }
    const newOrderId = `CTN-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 9000) + 1000}`;
    setOrderId(newOrderId);
    setOrderComplete(true);
    setIsCartOpen(false);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel w-full max-w-lg rounded-[2.5rem] p-8 text-center relative overflow-hidden"
        >
          {/* Background Glows */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-accent/30"
          >
            <CheckCircle2 className="w-12 h-12 text-accent neon-glow-green" />
          </motion.div>

          <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
          <p className="text-slate-400 mb-8">We're preparing your snack now.</p>

          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
            <div className="glass-card rounded-2xl p-6 relative">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Your Order ID</p>
              <h3 className="text-2xl font-mono font-bold tracking-tighter text-white">{orderId}</h3>
            </div>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="bg-white p-4 rounded-3xl">
              {/* Dummy QR Code */}
              <div className="w-32 h-32 bg-slate-900 rounded-xl flex items-center justify-center">
                <div className="grid grid-cols-4 gap-1 p-2">
                   {[...Array(16)].map((_, i) => (
                     <div key={i} className={cn("w-5 h-5 rounded-sm", Math.random() > 0.5 ? "bg-white" : "bg-transparent")}></div>
                   ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400">Estimated Ready</p>
                <p className="text-sm font-semibold">15 - 20 Minutes</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Amount to Pay</p>
              <p className="text-lg font-bold text-primary">₹{total}</p>
            </div>
          </div>

          <button 
            onClick={() => {
              setOrderComplete(false);
              setCart([]);
              setFormData({ name: '', rollNo: '', branch: 'CSE 3rd Year', notes: '' });
            }}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            Order Something Else
          </button>
          
          <p className="mt-4 text-xs text-slate-500">Show this ID at the counter to collect your order.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <nav className="flex items-center justify-between p-6 sticky top-0 z-40 backdrop-blur-lg lg:px-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Campus <span className="text-primary">Canteen</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Menu</a>
          <a href="#" className="hover:text-white transition-colors">My Orders</a>
          <a href="#" className="hover:text-white transition-colors">Symbiosis SIU</a>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative glass-card p-3 rounded-xl hover:scale-105 active:scale-95 duration-200"
        >
          <ShoppingBag className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#020617]">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </nav>

      <main className="px-6 lg:px-0 mt-4">
        {/* Hero Section */}
        <section className="mb-12 relative rounded-[2.5rem] overflow-hidden p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10 z-0" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] -z-10" />
          
          <div className="relative z-10 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase">Symbiosis Lavale Campus</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight"
            >
              Preorder your meal. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Skip the mess queue.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg mb-8 max-w-lg"
            >
              Fresh, hot meals from the central kitchen, now just a tap away. Exclusive for Symbiosis students.
            </motion.p>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3 }}
               className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Top Rated Thali</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Bestselling Maggi</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Menu Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {isLoading ? (
            // Skeleton Loading
            [...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-[2rem] h-96 animate-pulse" />
            ))
          ) : (
            MENU_ITEMS.map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                key={item.id}
                className="glass-card rounded-[2rem] overflow-hidden flex flex-col group cursor-pointer"
              >
                <div className="h-56 relative overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#020617]/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold border border-white/10">
                      {item.emoji} {item.category.toUpperCase()}
                    </span>
                  </div>
                  {item.id === '1' && (
                    <div className="absolute top-4 right-4 animate-bounce-gentle">
                      <span className="bg-secondary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-secondary/20">
                        Best Seller
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 text-white">
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <span className="text-xl font-black text-primary">₹{item.price}</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 flex-1">{item.description}</p>
                  
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-full group/btn relative overflow-hidden bg-white/5 border border-white/10 hover:border-primary/50 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <Plus className="w-5 h-5 group-hover/btn:text-primary transition-colors" />
                    <span className="font-bold group-hover/btn:text-primary transition-colors">Add to Order</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </section>
      </main>

      {/* Mobile Sticky Cart Bar */}
      <AnimatePresence>
        {cart.length > 0 && !isCartOpen && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-6 right-6 z-50 md:hidden"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gradient-to-r from-primary to-secondary p-4 rounded-3xl flex items-center justify-between shadow-2xl shadow-primary/40 group active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <ShoppingBag className="text-white w-5 h-5" />
                </div>
                <span className="text-white font-bold">{cart.reduce((s, i) => s + i.quantity, 0)} Items Added</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="font-black">₹{total}</span>
                <ChevronRight className="w-5 h-5 opacity-50" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer / Side Panel */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#020617] border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <ShoppingBag className="text-primary" /> My Cart
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag className="w-12 h-12 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Your plate is empty</h3>
                    <p className="text-slate-500 max-w-[200px] mx-auto">Add some treats from the menu to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="glass-card p-4 rounded-2xl flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                          <div className="flex-1">
                            <h4 className="font-bold text-white">{item.name}</h4>
                            <p className="text-primary font-black text-sm">₹{item.price}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-2 py-1 border border-white/5">
                            <button onClick={() => removeFromCart(item.id)} className="p-1 hover:text-primary transition-colors"><Minus className="w-4 h-4" /></button>
                            <span className="font-bold min-w-[20px] text-center">{item.quantity}</span>
                            <button onClick={() => addToCart(item)} className="p-1 hover:text-primary transition-colors"><Plus className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Student Details</h4>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Your Full Name"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors"
                        />
                        <input 
                          type="text" 
                          placeholder="Roll Number (e.g. 210xxxx)"
                          value={formData.rollNo}
                          onChange={e => setFormData({...formData, rollNo: e.target.value})}
                          className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors"
                        />
                        <select 
                          value={formData.branch}
                          onChange={e => setFormData({...formData, branch: e.target.value})}
                          className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors flex appearance-none"
                        >
                          <option>CSE 3rd Year</option>
                          <option>MBA 1st Year</option>
                          <option>B.Tech 2nd Year</option>
                          <option>Medical 4th Year</option>
                        </select>
                        <textarea 
                          placeholder="Special instructions? (e.g. Extra spicy)"
                          value={formData.notes}
                          onChange={e => setFormData({...formData, notes: e.target.value})}
                          className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-colors h-24 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-white/5 border-t border-white/10 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">Total Amount</span>
                    <span className="text-2xl font-black text-white">₹{total}</span>
                  </div>
                  <button 
                    onClick={handlePlaceOrder}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 group hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                  >
                    Place Preorder <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-[10px] text-center text-slate-500 px-4">
                    By placing preorder, you agree to pay at the canteen counter. Preorders are held for 15 minutes post-ready status.
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CanteenPreorderPage;
