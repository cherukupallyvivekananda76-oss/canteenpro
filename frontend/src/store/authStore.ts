import { create } from 'zustand';
import { CanteenHead } from '../types';

interface AuthState {
  token: string | null;
  canteenHead: CanteenHead | null;
  login: (token: string, canteenHead: CanteenHead) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('canteen_token'),
  canteenHead: (() => {
    const raw = localStorage.getItem('canteen_head');
    return raw ? (JSON.parse(raw) as CanteenHead) : null;
  })(),

  login: (token, canteenHead) => {
    localStorage.setItem('canteen_token', token);
    localStorage.setItem('canteen_head', JSON.stringify(canteenHead));
    set({ token, canteenHead });
  },

  logout: () => {
    localStorage.removeItem('canteen_token');
    localStorage.removeItem('canteen_head');
    set({ token: null, canteenHead: null });
  },
}));
