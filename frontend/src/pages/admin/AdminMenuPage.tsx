import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, UtensilsCrossed, Upload } from 'lucide-react';
import { api } from '../../lib/api';

interface ApiMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  emoji: string;
  imageUrl: string | null;
  category: string;
  isAvailable: boolean;
}

const emptyForm = { name: '', price: '', emoji: '', category: 'meal' };

const AdminMenuPage: React.FC = () => {
  const [items, setItems] = useState<ApiMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ApiMenuItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchItems = async () => {
    try {
      const res = await api.get<{ items: ApiMenuItem[] }>('/menu');
      setItems(res.items);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (item: ApiMenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      price: item.price.toString(),
      emoji: item.emoji,
      category: item.category,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.price) {
      setFormError('Item name and price are required.');
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), emoji: form.emoji || undefined };
      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, payload);
      } else {
        await api.post('/menu', payload);
      }
      await fetchItems();
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save item.');
    } finally {
      setIsSaving(false);
    }
  };

  const startImageImport = () => {
    setImportResult('');
    fileInputRef.current?.click();
  };

  const handleImagePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult('');

    try {
      const formData = new FormData();
      formData.append('menuFile', file);
      const result = await api.postForm<{ parsedCount: number; createdCount: number; skippedCount: number; message: string }>('/menu/import-file', formData);
      await fetchItems();
      setImportResult(`${result.message} Added ${result.createdCount} items (parsed ${result.parsedCount}, skipped ${result.skippedCount}).`);
    } catch (err) {
      setImportResult(err instanceof Error ? err.message : 'Failed to import menu image.');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      setItems(items.filter(i => i.id !== id));
    } catch {
      // handle error
    }
  };

  const toggleAvailability = async (item: ApiMenuItem) => {
    try {
      await api.patch(`/menu/${item.id}/availability`, { isAvailable: !item.isAvailable });
      setItems(items.map(i => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i));
    } catch {
      // handle error
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Menu Items</h1>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.xls,.xlsx,.csv"
            onChange={handleImagePicked}
            className="hidden"
          />
          <button
            onClick={startImageImport}
            disabled={isImporting}
            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white font-bold px-4 py-2 rounded-xl hover:bg-white/10 transition-all active:scale-95 disabled:opacity-60"
          >
            <Upload className="w-4 h-4" /> {isImporting ? 'Importing...' : 'Upload Menu File'}
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {importResult && (
        <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          {importResult}
        </div>
      )}
      <p className="mb-4 text-xs text-slate-500">Supported formats: image, PDF, Excel (.xls/.xlsx), CSV.</p>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="glass-card rounded-2xl h-20 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">No menu items yet</p>
          <p className="text-sm">Add your first item to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="glass-card rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white truncate">{item.name}</p>
                  <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full capitalize">{item.category}</span>
                </div>
                <p className="text-primary font-black text-sm">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleAvailability(item)} title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}>
                  {item.isAvailable
                    ? <ToggleRight className="w-6 h-6 text-accent" />
                    : <ToggleLeft className="w-6 h-6 text-slate-600" />
                  }
                </button>
                <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4 text-slate-400" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-400/5 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit form slide-over */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
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
                <h2 className="text-xl font-black">{editingItem ? 'Edit Item' : 'Add Menu Item'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
                <input
                  placeholder="Item Name *"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-primary/50 transition-colors"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Price (₹) *"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    min="1"
                    className="glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-primary/50 transition-colors"
                    required
                  />
                  <input
                    placeholder="Emoji (optional)"
                    value={form.emoji}
                    onChange={e => setForm({ ...form, emoji: e.target.value })}
                    className="glass-panel bg-white/5 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-primary/50 transition-colors"
                  />
                </div>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full glass-panel bg-[#020617] rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-primary/50 transition-colors"
                >
                  <option value="meal">Meal</option>
                  <option value="snack">Snack</option>
                  <option value="beverage">Beverage</option>
                </select>
                {formError && <p className="text-red-400 text-sm">{formError}</p>}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black py-4 rounded-2xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-70"
                >
                  {isSaving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMenuPage;
