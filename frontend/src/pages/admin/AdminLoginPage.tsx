import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Lock } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { CanteenHead } from '../../types';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post<{ token: string; canteenHead: CanteenHead }>('/auth/login', { email, password });
      login(res.token, res.canteenHead);
      navigate('/admin/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

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
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-black">Canteen Head Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-primary/50 transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-primary/50 transition-colors"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black py-4 rounded-2xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-70"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-6">
            New canteen?{' '}
            <Link to="/admin/register" className="text-primary hover:underline">Register your college</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
