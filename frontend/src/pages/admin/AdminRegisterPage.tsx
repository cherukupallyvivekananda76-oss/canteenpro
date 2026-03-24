import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { CanteenHead } from '../../types';

const AdminRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    collegeName: '',
    collegeCode: '',
    headName: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[A-Z0-9]{3,8}$/.test(form.collegeCode)) {
      setError('College code must be 3–8 uppercase letters/numbers (e.g. SIU, MIT).');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/register', form);
      const res = await api.post<{ token: string; canteenHead: CanteenHead }>('/auth/login', {
        email: form.email,
        password: form.password,
      });
      login(res.token, res.canteenHead);
      navigate('/admin/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="text-white w-7 h-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Canteen <span className="text-primary">Admin</span></span>
        </div>

        <div className="glass-panel rounded-[2.5rem] p-8">
          <h1 className="text-2xl font-black mb-2">Register Your Canteen</h1>
          <p className="text-slate-400 text-sm mb-6">Create a college code that students will use to find your canteen.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="College Full Name (e.g. Symbiosis Institute of Technology)"
              value={form.collegeName}
              onChange={e => setForm({ ...form, collegeName: e.target.value })}
              required
              className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-primary/50 transition-colors"
            />
            <div>
              <input
                type="text"
                placeholder="College Code (e.g. SIU, MIT, VIT)"
                value={form.collegeCode}
                onChange={e => setForm({ ...form, collegeCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                maxLength={8}
                required
                className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-primary/50 transition-colors font-mono font-bold tracking-widest"
              />
              <p className="text-slate-500 text-xs mt-1 px-1">3–8 letters/numbers. Students will enter this to order from your canteen.</p>
            </div>
            <input
              type="text"
              placeholder="Your Name"
              value={form.headName}
              onChange={e => setForm({ ...form, headName: e.target.value })}
              required
              className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-primary/50 transition-colors"
            />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-primary/50 transition-colors"
            />
            <input
              type="password"
              placeholder="Password (min 8 characters)"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-primary/50 transition-colors"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black py-4 rounded-2xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-70"
            >
              {isLoading ? 'Creating...' : 'Create Canteen Account'}
            </button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-6">
            Already registered?{' '}
            <Link to="/admin/login" className="text-primary hover:underline">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminRegisterPage;
