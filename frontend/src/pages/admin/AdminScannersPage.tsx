import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ScanLine, Copy } from 'lucide-react';
import { api } from '../../lib/api';
import { Scanner } from '../../types';

const AdminScannersPage: React.FC = () => {
  const [scanners, setScanners] = useState<Scanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scannerName, setScannerName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchScanners = async () => {
    try {
      const res = await api.get<{ scanners: Scanner[] }>('/scanners');
      setScanners(res.scanners);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchScanners(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannerName.trim()) {
      setFormError('Scanner name is required.');
      return;
    }
    setIsCreating(true);
    try {
      await api.post('/scanners', { name: scannerName.trim() });
      setScannerName('');
      setShowForm(false);
      await fetchScanners();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create scanner.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Deactivate this scanner?')) return;
    try {
      await api.delete(`/scanners/${id}`);
      setScanners(scanners.map(s => s.id === id ? { ...s, isActive: false } : s));
    } catch {
      // handle error
    }
  };

  const getScannerUrl = (token: string) =>
    `${window.location.origin}/scanner?token=${token}`;

  const copyUrl = (token: string) => {
    navigator.clipboard.writeText(getScannerUrl(token));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">QR Scanners</h1>
        <button
          onClick={() => { setShowForm(true); setFormError(''); setScannerName(''); }}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Scanner
        </button>
      </div>

      <div className="glass-card rounded-2xl p-4 mb-6 text-sm text-slate-400">
        <p className="font-semibold text-white mb-1">How scanners work</p>
        <p>Each scanner has a unique QR code. Open it on a tablet/phone at your counter. When students show their order QR, the scanner reads it and marks the order as picked up automatically.</p>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-5 mb-6"
        >
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              placeholder="Scanner name (e.g. Main Counter, Counter 2)"
              value={scannerName}
              onChange={e => setScannerName(e.target.value)}
              className="flex-1 glass-panel bg-white/5 rounded-xl px-4 py-2 outline-none border border-white/10 focus:border-primary/50 transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-colors disabled:opacity-70"
            >
              {isCreating ? '...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-slate-400 hover:text-white rounded-xl">
              Cancel
            </button>
          </form>
          {formError && <p className="text-red-400 text-sm mt-2">{formError}</p>}
        </motion.div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="glass-card rounded-2xl h-40 animate-pulse" />)}
        </div>
      ) : scanners.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <ScanLine className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">No scanners yet</p>
          <p className="text-sm">Add a scanner and set it up on your counter tablet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scanners.map(scanner => (
            <div
              key={scanner.id}
              className={`glass-card rounded-2xl p-5 ${!scanner.isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-white">{scanner.name}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    scanner.isActive ? 'text-green-400 bg-green-400/10' : 'text-slate-500 bg-slate-500/10'
                  }`}>
                    {scanner.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </div>
                {scanner.isActive && (
                  <button
                    onClick={() => handleDeactivate(scanner.id)}
                    className="p-1.5 hover:bg-red-400/5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>

              {scanner.isActive && (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="bg-white p-3 rounded-2xl">
                      <QRCodeSVG value={getScannerUrl(scanner.scannerToken)} size={120} />
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs text-center mb-3">
                    Scan this QR on your counter tablet/phone to set it up as a pickup scanner.
                  </p>
                  <button
                    onClick={() => copyUrl(scanner.scannerToken)}
                    className="w-full flex items-center justify-center gap-2 glass-panel border border-white/10 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" /> Copy scanner link
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminScannersPage;
