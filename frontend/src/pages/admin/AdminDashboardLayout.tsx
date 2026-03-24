import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Sparkles, ClipboardList, UtensilsCrossed, ScanLine, LogOut, Calendar, Coffee } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const AdminDashboardLayout: React.FC = () => {
  const { canteenHead, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItem = 'flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium';
  const activeNavItem = 'flex items-center gap-3 px-4 py-3 rounded-2xl text-white bg-primary/10 border border-primary/20 font-bold';

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 p-6 flex-shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight">Canteen <span className="text-primary">Admin</span></span>
        </div>

        {canteenHead && (
          <div className="glass-card rounded-2xl p-4 mb-6">
            <p className="text-xs text-slate-500 mb-1">Logged in as</p>
            <p className="font-bold text-white truncate">{canteenHead.name}</p>
            <p className="text-primary text-sm font-mono font-bold">{canteenHead.collegeCode}</p>
            <p className="text-slate-400 text-xs truncate">{canteenHead.collegeName}</p>
          </div>
        )}

        <nav className="flex-1 space-y-1">
          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? activeNavItem : navItem}>
            <ClipboardList className="w-5 h-5" />
            Orders
          </NavLink>
          <NavLink to="/admin/menu" className={({ isActive }) => isActive ? activeNavItem : navItem}>
            <UtensilsCrossed className="w-5 h-5" />
            Menu
          </NavLink>
          <NavLink to="/admin/mess" className={({ isActive }) => isActive ? activeNavItem : navItem}>
            <Calendar className="w-5 h-5" />
            Mess Setup
          </NavLink>
          <NavLink to="/admin/mess-orders" className={({ isActive }) => isActive ? activeNavItem : navItem}>
            <Coffee className="w-5 h-5" />
            Mess Orders
          </NavLink>
          <NavLink to="/admin/scanners" className={({ isActive }) => isActive ? activeNavItem : navItem}>
            <ScanLine className="w-5 h-5" />
            Scanners
          </NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#020617]/95 backdrop-blur-lg border-t border-white/5 flex">
        <NavLink to="/admin/orders" className={({ isActive }) => `flex-1 flex flex-col items-center py-3 gap-1 text-xs ${isActive ? 'text-primary' : 'text-slate-500'}`}>
          <ClipboardList className="w-5 h-5" />
          Orders
        </NavLink>
        <NavLink to="/admin/menu" className={({ isActive }) => `flex-1 flex flex-col items-center py-3 gap-1 text-xs ${isActive ? 'text-primary' : 'text-slate-500'}`}>
          <UtensilsCrossed className="w-5 h-5" />
          Menu
        </NavLink>
        <NavLink to="/admin/mess" className={({ isActive }) => `flex-1 flex flex-col items-center py-3 gap-1 text-xs ${isActive ? 'text-primary' : 'text-slate-500'}`}>
          <Calendar className="w-5 h-5" />
          Mess
        </NavLink>
        <NavLink to="/admin/mess-orders" className={({ isActive }) => `flex-1 flex flex-col items-center py-3 gap-1 text-xs ${isActive ? 'text-primary' : 'text-slate-500'}`}>
          <Coffee className="w-5 h-5" />
          M. Ords
        </NavLink>
        <NavLink to="/admin/scanners" className={({ isActive }) => `flex-1 flex flex-col items-center py-3 gap-1 text-xs ${isActive ? 'text-primary' : 'text-slate-500'}`}>
          <ScanLine className="w-5 h-5" />
          Scanners
        </NavLink>
        <button onClick={handleLogout} className="flex-1 flex flex-col items-center py-3 gap-1 text-xs text-slate-500">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6 pb-24 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboardLayout;
