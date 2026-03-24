import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { CartItem, MenuItem, College } from '../types';
import { api } from '../lib/api';

const CATEGORY_BADGE: Record<MenuItem['category'], { label: string; color: string }> = {
  beverage: { label: 'Drink', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  meal:     { label: 'Meal',  color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  snack:    { label: 'Snack', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
};

const CanteenPreorderPage: React.FC = () => {
  const { collegeCode } = useParams<{ collegeCode: string }>();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [college, setCollege] = useState<College | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [formData, setFormData] = useState({ name: '', rollNo: '', pickupTime: '', utrNumber: '', notes: '' });

  useEffect(() => {
    if (!collegeCode) return;
    const loadMenu = async () => {
      try {
        const [collegeData, menuData] = await Promise.all([
          api.get<College>(`/colleges/${collegeCode}`),
          api.get<{ items: Array<{ id: number; name: string; description: string; price: number; emoji: string; imageUrl: string | null; category: string }> }>(`/menu/${collegeCode}`),
        ]);
        setCollege(collegeData);
        setMenuItems(menuData.items.map(item => ({
          id: item.id.toString(),
          name: item.name,
          description: item.description,
          price: item.price,
          emoji: item.emoji,
          image: item.imageUrl ?? undefined,
          category: item.category as MenuItem['category'],
        })));
      } catch {
        setMenuError('Could not load menu. Please go back and try again.');
      } finally {
        setMenuLoading(false);
      }
    };
    loadMenu();
  }, [collegeCode]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    const q = searchQuery.toLowerCase();
    return menuItems.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [menuItems, searchQuery]);

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
  const getQty = (itemId: string) => cart.find((item) => item.id === itemId)?.quantity ?? 0;

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.rollNo || !formData.pickupTime || !formData.utrNumber) {
      setOrderError('Please fill in your name, roll number, pickup time, and the UTR number.');
      return;
    }
    if (formData.utrNumber.trim().length < 12) {
      setOrderError('Please enter a valid 12-digit UTR Transaction ID from PhonePe/GPay.');
      return;
    }
    setOrderError('');
    setIsPlacingOrder(true);
    try {
      const result = await api.post<{ orderId: string; totalPrice: number }>('/orders', {
        collegeCode,
        studentName: formData.name,
        rollNo: formData.rollNo,
        pickupTime: formData.pickupTime,
        utrNumber: formData.utrNumber,
        items: cart.map(i => ({ menuItemId: Number(i.id), quantity: i.quantity })),
        notes: formData.notes,
      });
      setOrderId(result.orderId);
      setOrderTotal(result.totalPrice);
      setOrderComplete(true);
      setIsCartOpen(false);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel w-full max-w-lg rounded-[2.5rem] p-8 text-center relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-accent/30"
          >
            <CheckCircle2 className="w-12 h-12 text-accent" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
          <p className="text-slate-400 mb-8">We're preparing your order now.</p>
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20 blur-2xl group-hover:opacity-30 transition-opacity" />
            <div className="glass-card rounded-2xl p-6 relative">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Your Order ID</p>
              <h3 className="text-2xl font-mono font-bold tracking-tighter text-white">{orderId}</h3>
            </div>
          </div>
          <div className="mb-8 flex justify-center">
            <div className="bg-white p-4 rounded-3xl">
              <QRCodeSVG value={orderId} size={128} />
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
              <p className="text-lg font-bold text-primary">₹{orderTotal}</p>
            </div>
          </div>
          <button
            onClick={() => { setOrderComplete(false); setCart([]); setFormData({ name: '', rollNo: '', pickupTime: '', utrNumber: '', notes: '' }); }}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            Order Something Else
          </button>
          <p className="mt-4 text-xs text-slate-500">Show this QR code at the counter to collect your order.</p>
        </motion.div>
      </div>
    );
  }

  if (menuError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <p className="text-red-400 mb-4">{menuError}</p>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* ── Sticky Nav ── */}
      <nav className="flex items-center justify-between px-4 py-3 sticky top-0 z-40 backdrop-blur-xl border-b border-white/5 bg-[#020617]/80">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight">Campus <span className="text-primary">Canteen</span></span>
            {college && <p className="text-[10px] text-slate-500 leading-none">{college.name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="hidden md:flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Change College
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative glass-card p-2.5 rounded-xl hover:scale-105 active:scale-95 duration-200"
          >
            <ShoppingBag className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#020617]">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Tab Toggle */}
      <div className="max-w-7xl mx-auto mt-2 px-3 md:px-6">
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 max-w-sm">
          <div className="flex-1 text-center py-2 text-sm font-bold bg-white/10 text-white rounded-lg shadow-sm cursor-default">
            Canteen Menu
          </div>
          <Link to={`/${collegeCode}/mess`} className="flex-1 text-center py-2 text-sm font-semibold text-slate-400 hover:text-white rounded-lg transition-colors">
            Mess Preorder
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 md:px-6 mt-4">
        {/* ── Hero Banner (compact) ── */}
        <section className="mb-5 relative rounded-2xl overflow-hidden px-5 py-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/15 blur-[80px] rounded-full -z-10" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-3 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-semibold tracking-widest uppercase">{college ? college.name : collegeCode}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight mb-1">
              What are you <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">craving today?</span>
            </h1>
            <p className="text-slate-400 text-sm">Preorder · Skip the queue · Pay at counter</p>
          </div>
        </section>

        {/* ── Search Bar ── */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="menu-search"
            type="text"
            placeholder="Search food, drinks, snacks…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/50 focus:bg-white/8 transition-all placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ── Menu Grid ── */}
        <section className="mb-12">
          {menuLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl h-44 animate-pulse" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              {menuItems.length === 0 ? (
                <>
                  <p className="text-4xl mb-3">🍽️</p>
                  <p className="font-semibold">Menu is empty</p>
                  <p className="text-sm">The canteen head hasn't added any items yet.</p>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-semibold">No results for "{searchQuery}"</p>
                  <p className="text-sm">Try searching something else.</p>
                </>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-500 mb-3">{filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} available</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredItems.map((item, i) => {
                  const qty = getQty(item.id);
                  const badge = CATEGORY_BADGE[item.category];
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group relative glass-card rounded-2xl overflow-hidden flex flex-col border border-white/8 hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10"
                    >
                      {/* Image / Emoji */}
                      <div className="relative bg-white/[0.04] h-24 flex items-center justify-center overflow-hidden shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{item.emoji}</span>
                        )}
                        {/* Price tag */}
                        <div className="absolute top-1.5 right-1.5 bg-[#020617]/85 backdrop-blur-sm border border-white/15 rounded-full px-2 py-0.5">
                          <span className="text-[11px] font-black text-primary">₹{item.price}</span>
                        </div>
                        {/* Category pill */}
                        <div className={`absolute top-1.5 left-1.5 border rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${badge.color}`}>
                          {badge.label}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-2.5 flex flex-col flex-1 gap-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-xs text-white leading-tight line-clamp-1">{item.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">{item.description}</p>
                        </div>

                        {/* Add / Qty control */}
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="w-full bg-white/5 border border-white/10 hover:border-primary/70 hover:bg-primary/15 rounded-xl py-1.5 text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-primary/15 border border-primary/40 rounded-xl px-2 py-1.5">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-0.5 hover:text-primary transition-colors rounded"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-black text-sm text-primary">{qty}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="p-0.5 hover:text-primary transition-colors rounded"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      {/* ── Floating Cart Button (mobile) ── */}
      <AnimatePresence>
        {cart.length > 0 && !isCartOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-5 left-4 right-4 z-50 md:hidden"
          >
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gradient-to-r from-primary to-secondary p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-primary/40 active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <ShoppingBag className="text-white w-4 h-4" />
                </div>
                <span className="text-white font-bold text-sm">{cart.reduce((s, i) => s + i.quantity, 0)} items in cart</span>
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <span className="font-black">₹{total}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart Drawer ── */}
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
              <div className="p-5 flex items-center justify-between border-b border-white/5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="text-primary w-5 h-5" /> My Cart
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-28 h-28 bg-white/5 rounded-full flex items-center justify-center mb-5">
                      <ShoppingBag className="w-10 h-10 text-slate-700" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Your plate is empty</h3>
                    <p className="text-slate-500 text-sm max-w-[180px] mx-auto">Add some treats from the menu to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.id} className="glass-card p-3.5 rounded-2xl flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl shrink-0">{item.emoji}</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                            <p className="text-primary font-black text-sm">₹{item.price}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-2 py-1 border border-white/5 shrink-0">
                            <button onClick={() => removeFromCart(item.id)} className="p-0.5 hover:text-primary transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="font-bold min-w-[18px] text-center text-sm">{item.quantity}</span>
                            <button onClick={() => addToCart(item)} className="p-0.5 hover:text-primary transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 pt-5 border-t border-white/5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student Details</h4>
                      <div className="space-y-2.5">
                        <input
                          type="text"
                          placeholder="Your Full Name"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-primary/50 transition-colors"
                        />
                        <input
                          type="text"
                          placeholder="Roll Number"
                          value={formData.rollNo}
                          onChange={e => setFormData({...formData, rollNo: e.target.value})}
                          className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-primary/50 transition-colors"
                        />
                        <div className="flex flex-col gap-1.5 mt-2">
                          <label className="text-xs text-slate-400 pl-1">Pickup Time</label>
                          <input
                            type="time"
                            required
                            value={formData.pickupTime}
                            onChange={e => setFormData({...formData, pickupTime: e.target.value})}
                            className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-primary/50 transition-colors appearance-none"
                          />
                        </div>
                        
                        <div className="mt-6 mb-2 p-5 glass-card rounded-2xl flex flex-col items-center justify-center text-center border border-primary/20 bg-primary/5">
                          <p className="text-sm font-bold text-white mb-4">Scan & Pay <span className="text-primary">₹{total}</span></p>
                          <div className="bg-white p-3 rounded-2xl shadow-lg">
                            <QRCodeSVG value={`upi://pay?pa=9959169475@ybl&pn=Canteen%20Admin&am=${total}&cu=INR`} size={160} />
                          </div>
                          <p className="text-xs text-slate-400 mt-4 max-w-[200px] leading-relaxed">
                            After paying via PhonePe/GPay, enter the 12-digit UTR number below.
                          </p>
                        </div>

                        <div className="flex flex-col gap-1.5 mb-2">
                          <label className="text-xs text-slate-400 pl-1">UTR Transaction ID <span className="text-red-400">*</span></label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 301234567890"
                            value={formData.utrNumber}
                            onChange={e => setFormData({...formData, utrNumber: e.target.value})}
                            className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 text-sm font-mono outline-none border border-white/10 focus:border-primary/50 transition-colors"
                          />
                        </div>

                        <textarea
                          placeholder="Special instructions? (e.g. Extra spicy)"
                          value={formData.notes}
                          onChange={e => setFormData({...formData, notes: e.target.value})}
                          className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-primary/50 transition-colors h-20 resize-none"
                        />
                      </div>
                      {orderError && <p className="text-red-400 text-xs">{orderError}</p>}
                    </div>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-5 bg-white/5 border-t border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Total Amount</span>
                    <span className="text-2xl font-black text-white">₹{total}</span>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 group hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {isPlacingOrder ? 'Placing Order…' : 'Place Preorder'}
                    {!isPlacingOrder && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </button>
                  <p className="text-[10px] text-center text-slate-500">By placing preorder, you agree to pay at the canteen counter.</p>
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
