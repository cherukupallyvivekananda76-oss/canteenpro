import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Calendar, Coffee, Sun, Moon } from 'lucide-react';
import { api } from '../../lib/api';
import { MessMenu } from '../../types';

const AdminMessPage: React.FC = () => {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [menu, setMenu] = useState<Partial<MessMenu>>({
    breakfastItems: '', breakfastPrice: 0,
    lunchItems: '', lunchPrice: 0,
    dinnerItems: '', dinnerPrice: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchMenu = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const authData = JSON.parse(localStorage.getItem('canteen_auth') || '{}');
      const res = await api.get<{ menu: MessMenu | null }>(`/mess/${date}?collegeCode=${authData.collegeCode}`);
      if (res.menu) {
        setMenu(res.menu);
      } else {
        setMenu({
          breakfastItems: '', breakfastPrice: 0,
          lunchItems: '', lunchPrice: 0,
          dinnerItems: '', dinnerPrice: 0,
        });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: 'Failed to load menu for this date.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await api.post('/mess', { ...menu, date });
      setMessage({ text: 'Menu saved successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to save menu', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Daily Mess Menu</h1>
          <p className="text-slate-400">Plan and publish meals for students to preorder.</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl mb-8 flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <Calendar className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-400 mb-1">Select Date to Edit</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full max-w-xs glass-panel bg-white/5 rounded-xl px-4 py-2 text-white outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
        >
          {message.text}
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Breakfast */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 p-8 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <Coffee className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-bold text-white">Breakfast</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs text-slate-400 mb-1 pl-1">Menu Items (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Idli, Vada, Sambar, Chutney"
                  value={menu.breakfastItems || ''}
                  onChange={e => setMenu({ ...menu, breakfastItems: e.target.value })}
                  className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 pl-1">Price (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={menu.breakfastPrice || ''}
                  onChange={e => setMenu({ ...menu, breakfastPrice: Number(e.target.value) })}
                  className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Lunch */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 p-8 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <Sun className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Lunch</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs text-slate-400 mb-1 pl-1">Menu Items (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Rice, Dal, Paneer Butter Masala, Roti"
                  value={menu.lunchItems || ''}
                  onChange={e => setMenu({ ...menu, lunchItems: e.target.value })}
                  className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 pl-1">Price (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={menu.lunchPrice || ''}
                  onChange={e => setMenu({ ...menu, lunchPrice: Number(e.target.value) })}
                  className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Dinner */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 p-8 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
            <div className="flex items-center gap-3 mb-4">
              <Moon className="w-6 h-6 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Dinner</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs text-slate-400 mb-1 pl-1">Menu Items (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Jeera Rice, Chicken Curry, Chapati"
                  value={menu.dinnerItems || ''}
                  onChange={e => setMenu({ ...menu, dinnerItems: e.target.value })}
                  className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 pl-1">Price (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={menu.dinnerPrice || ''}
                  onChange={e => setMenu({ ...menu, dinnerPrice: Number(e.target.value) })}
                  className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-primary/50"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold tracking-wide hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Publish Mess Menu'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessPage;
