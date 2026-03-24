import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Coffee, Sun, Moon, CheckCircle2, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { College, MessMenu } from '../types';
import { api } from '../lib/api';

const MessPreorderPage: React.FC = () => {
  const { collegeCode } = useParams<{ collegeCode: string }>();
  const navigate = useNavigate();

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [college, setCollege] = useState<College | null>(null);
  const [menu, setMenu] = useState<MessMenu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [wantsBreakfast, setWantsBreakfast] = useState(false);
  const [wantsLunch, setWantsLunch] = useState(false);
  const [wantsDinner, setWantsDinner] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [formData, setFormData] = useState({ name: '', rollNo: '', utrNumber: '' });

  useEffect(() => {
    if (!collegeCode) return;
    const fetchMenu = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [collegeData, menuData] = await Promise.all([
          api.get<College>(`/colleges/${collegeCode}`),
          api.get<{ menu: MessMenu | null }>(`/mess/${date}?collegeCode=${collegeCode}`),
        ]);
        setCollege(collegeData);
        setMenu(menuData.menu);
        
        // Reset selections if menu changes
        setWantsBreakfast(false);
        setWantsLunch(false);
        setWantsDinner(false);
      } catch {
        setError('Could not load mess menu for this date.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, [collegeCode, date]);

  const total = useMemo(() => {
    let sum = 0;
    if (menu) {
      if (wantsBreakfast) sum += menu.breakfastPrice;
      if (wantsLunch) sum += menu.lunchPrice;
      if (wantsDinner) sum += menu.dinnerPrice;
    }
    return sum;
  }, [wantsBreakfast, wantsLunch, wantsDinner, menu]);

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.rollNo || !formData.utrNumber) {
      setOrderError('Please fill in your name, roll number, and UTR number.');
      return;
    }
    if (formData.utrNumber.trim().length < 12) {
      setOrderError('Please enter a valid 12-digit UTR Transaction ID.');
      return;
    }
    setOrderError('');
    setIsPlacingOrder(true);
    try {
      const result = await api.post<{ orderId: string; totalPrice: number }>('/mess-orders', {
        collegeCode,
        studentName: formData.name,
        rollNo: formData.rollNo,
        date,
        wantsBreakfast,
        wantsLunch,
        wantsDinner,
        utrNumber: formData.utrNumber,
        totalPrice: total,
      });
      setOrderId(result.orderId);
      setOrderComplete(true);
      setIsCheckoutOpen(false);
      
      // Clear selections
      setWantsBreakfast(false);
      setWantsLunch(false);
      setWantsDinner(false);
    } catch (err: any) {
      setOrderError(err.message || 'Failed to place preorder.');
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
          className="glass-card rounded-3xl p-8 max-w-sm w-full text-center"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-black mb-2">Mess Preorder Confirmed!</h2>
          <p className="text-slate-400 text-sm mb-6">Your meals are booked for {date}.</p>
          <div className="bg-white/5 rounded-2xl p-4 mb-8">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Your Order ID</p>
            <p className="text-lg font-mono font-black tracking-widest text-primary">{orderId}</p>
          </div>
          <button
            onClick={() => setOrderComplete(false)}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-colors"
          >
            Order More
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header & Navigation */}
      <header className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 pt-4 pb-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-black text-xl leading-none tracking-tight flex items-center gap-2">
                Campus Mess <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full uppercase tracking-bold">Preorder</span>
              </h1>
              {college && <p className="text-xs text-slate-400 font-medium mt-1">{college.name}</p>}
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="max-w-4xl mx-auto mt-6 flex p-1 bg-white/5 rounded-xl border border-white/10">
          <Link to={`/${collegeCode}`} className="flex-1 text-center py-2 text-sm font-semibold text-slate-400 hover:text-white rounded-lg transition-colors">
            Canteen Menu
          </Link>
          <div className="flex-1 text-center py-2 text-sm font-bold bg-white/10 text-white rounded-lg shadow-sm cursor-default">
            Mess Preorder
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* Date Selector */}
        <div className="glass-card p-4 rounded-2xl mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white mb-1">Select Date</p>
            <p className="text-xs text-slate-400">Preorder meals for any day.</p>
          </div>
          <input
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="glass-panel bg-white/5 rounded-xl px-4 py-2 text-white outline-none focus:border-primary/50 text-sm font-bold"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            <div className="h-32 rounded-2xl glass-card animate-pulse" />
            <div className="h-32 rounded-2xl glass-card animate-pulse" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400 bg-red-500/10 rounded-3xl border border-red-500/20">{error}</div>
        ) : !menu || (!menu.breakfastItems && !menu.lunchItems && !menu.dinnerItems) ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <Moon className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p className="text-lg font-bold text-slate-300">No mess menu available</p>
            <p className="text-slate-500 text-sm mt-2">The canteen has not posted the menu for {date} yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {menu.breakfastItems && menu.breakfastPrice > 0 && (
              <div 
                onClick={() => setWantsBreakfast(!wantsBreakfast)}
                className={`glass-card p-5 rounded-3xl border-2 transition-all cursor-pointer flex gap-4 ${wantsBreakfast ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/20'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Coffee className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-white">Breakfast</h3>
                    <span className="font-black text-primary text-lg">₹{menu.breakfastPrice}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">{menu.breakfastItems}</p>
                  <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${wantsBreakfast ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-slate-300'}`}>
                    {wantsBreakfast ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-slate-400 rounded-full" />}
                    {wantsBreakfast ? 'Selected' : 'Select'}
                  </div>
                </div>
              </div>
            )}

            {menu.lunchItems && menu.lunchPrice > 0 && (
              <div 
                onClick={() => setWantsLunch(!wantsLunch)}
                className={`glass-card p-5 rounded-3xl border-2 transition-all cursor-pointer flex gap-4 ${wantsLunch ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/20'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Sun className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-white">Lunch</h3>
                    <span className="font-black text-primary text-lg">₹{menu.lunchPrice}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">{menu.lunchItems}</p>
                  <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${wantsLunch ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-slate-300'}`}>
                    {wantsLunch ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-slate-400 rounded-full" />}
                    {wantsLunch ? 'Selected' : 'Select'}
                  </div>
                </div>
              </div>
            )}

            {menu.dinnerItems && menu.dinnerPrice > 0 && (
              <div 
                onClick={() => setWantsDinner(!wantsDinner)}
                className={`glass-card p-5 rounded-3xl border-2 transition-all cursor-pointer flex gap-4 ${wantsDinner ? 'border-primary bg-primary/5' : 'border-white/5 hover:border-white/20'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Moon className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-white">Dinner</h3>
                    <span className="font-black text-primary text-lg">₹{menu.dinnerPrice}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-3">{menu.dinnerItems}</p>
                  <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${wantsDinner ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-slate-300'}`}>
                    {wantsDinner ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-slate-400 rounded-full" />}
                    {wantsDinner ? 'Selected' : 'Select'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Checkout Bar */}
      <AnimatePresence>
        {total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-0 right-0 px-4 z-40 flex justify-center"
          >
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full max-w-sm bg-primary text-primary-foreground p-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-between font-bold active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-3">
                <span className="bg-white/20 px-3 py-1 rounded-xl text-sm">
                  {[wantsBreakfast, wantsLunch, wantsDinner].filter(Boolean).length} meals
                </span>
                <span className="text-lg">₹{total}</span>
              </div>
              <div className="flex items-center gap-2">
                Checkout <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Drawer */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0B0F19] border-t border-white/10 rounded-t-[2.5rem] p-6 pb-8 z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-white">Review & Pay</h2>
                  <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {orderError && (
                  <div className="bg-red-500/10 text-red-500 p-3 rounded-xl text-sm mb-6 border border-red-500/20">
                    {orderError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="glass-card p-5 rounded-2xl space-y-3">
                    <p className="font-bold text-white text-sm mb-2">Student Details</p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-primary/50 transition-colors"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Roll No."
                        value={formData.rollNo}
                        onChange={e => setFormData({...formData, rollNo: e.target.value})}
                        className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-primary/50 transition-colors uppercase"
                      />
                    </div>
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
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="w-full bg-primary text-primary-foreground font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isPlacingOrder ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Confirm Preorder <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-500 mt-4">
                    By placing preorder, you agree to pay at the canteen counter.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessPreorderPage;
