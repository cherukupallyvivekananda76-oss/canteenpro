import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Lock, UtensilsCrossed, Play } from 'lucide-react';
import { api } from '../lib/api';
import { College } from '../types';

const showcaseImages = [
  {
    src: '/landing/paneer.jpg',
    title: 'Creamy Curry Bowls',
    subtitle: 'Rich, warm gravies plated for comfort-first cravings.',
    accent: 'Chef Signature',
  },
  {
    src: '/landing/dosa.jpg',
    title: 'South Indian Classics',
    subtitle: 'Golden dosas, bright chutneys, and perfect canteen mornings.',
    accent: 'Student Favorite',
  },
  {
    src: '/landing/pizza.jpg',
    title: 'Loaded Pizza Slices',
    subtitle: 'Cheesy, spicy, and made to share after class.',
    accent: 'Hot Pick',
  },
];

const CollegeCodeEntryPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEntryPage, setShowEntryPage] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setError('');
    setIsLoading(true);
    try {
      await api.get<College>(`/colleges/${code.trim().toUpperCase()}`);
      navigate(`/${code.trim().toUpperCase()}`);
    } catch {
      setError('No college found with this code. Check with your canteen head.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/intro-bg.mp4" type="video/mp4" />
          <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=11f6ef982f8465f4d4f99c84a89a842f3424f4ea&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
        </video>
      </div>

      <div className="fixed inset-0 z-[1] bg-[#020617]/65" />
      <div className="fixed inset-0 z-[2] bg-gradient-to-b from-[#020617]/20 via-[#020617]/60 to-[#020617]" />

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/10 blur-[140px] rounded-full pointer-events-none z-[3]" />
      <div className="fixed -bottom-24 right-0 w-[460px] h-[460px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none z-[3]" />

      <AnimatePresence mode="wait">
        {!showEntryPage ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <section className="min-h-screen flex items-center justify-center px-6 py-16">
              <div className="w-full max-w-4xl text-center">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-center gap-3 mb-10"
                >
                  <div className="w-14 h-14 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                    <Sparkles className="text-white w-8 h-8" />
                  </div>
                  <span className="text-3xl md:text-5xl font-bold tracking-tight">
                    Campus <span className="text-primary">Canteen</span>
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-7xl font-black leading-tight mb-4"
                >
                  Fast. Fresh. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">No Queue.</span>
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-200/90 text-lg md:text-2xl max-w-3xl mx-auto mb-8"
                >
                  Watch, scroll, feel the vibe, then jump in and preorder from your college canteen in seconds.
                </motion.p>

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-slate-100"
                >
                  <Play className="w-4 h-4" /> Scroll to explore
                </motion.div>
              </div>
            </section>

            <section className="px-6 pb-8">
              <div className="max-w-6xl mx-auto mb-8 text-center">
                <p className="text-xs uppercase tracking-[0.22em] text-primary/80 mb-2">Explore the vibe</p>
                <h2 className="text-3xl md:text-5xl font-black mb-2">Visual Menu Experience</h2>
                <p className="text-slate-300 max-w-2xl mx-auto">Scroll through signature looks before you jump into the live canteen menu.</p>
              </div>

              <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
                {showcaseImages.map((image, index) => (
                  <motion.div
                    key={image.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="grid md:grid-cols-2 gap-5 md:gap-8 items-center glass-panel rounded-[2rem] p-4 md:p-7 border-white/20"
                  >
                    <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                      <div className="relative rounded-2xl overflow-hidden">
                        <img
                          src={image.src}
                          alt={image.title}
                          className="w-full h-[320px] md:h-[420px] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                      </div>
                    </div>
                    <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                      <p className="inline-block text-[11px] uppercase tracking-[0.18em] text-primary/95 mb-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/30">{image.accent}</p>
                      <h2 className="text-3xl md:text-5xl font-black mb-3 leading-tight">{image.title}</h2>
                      <p className="text-slate-200 text-base md:text-xl">{image.subtitle}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="px-6 pt-4 pb-24">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                className="max-w-3xl mx-auto text-center glass-panel rounded-[2.5rem] p-7 md:p-10"
              >
                <h2 className="text-3xl md:text-5xl font-black mb-3">Ready to enter?</h2>
                <p className="text-slate-300 mb-8">Your menu is waiting. One tap and you are in.</p>

                <button
                  onClick={() => setShowEntryPage(true)}
                  className="mx-auto bg-gradient-to-r from-primary to-secondary text-white font-black py-4 px-9 rounded-2xl text-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                >
                  Enter Campus Canteen <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => navigate('/admin/login')}
                  className="mx-auto mt-5 text-slate-300 hover:text-white text-sm flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Canteen Head Login
                </button>
              </motion.div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="entry"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex items-center justify-center px-6 py-12 relative z-10"
          >
            <div className="w-full max-w-md">
              <div className="flex items-center justify-center gap-3 mb-12">
                <div className="w-12 h-12 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <UtensilsCrossed className="text-white w-7 h-7" />
                </div>
                <span className="text-2xl font-bold tracking-tight">
                  Campus <span className="text-primary">Canteen</span>
                </span>
              </div>

              <div className="glass-panel rounded-[2.5rem] p-8">
                <h1 className="text-3xl font-black mb-2">Order from your canteen</h1>
                <p className="text-slate-200/80 mb-8">Enter your college code to see the menu and place a preorder.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="College Code (e.g. SIU, MIT)"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      maxLength={8}
                      className="w-full glass-panel bg-white/5 rounded-xl px-5 py-4 text-lg font-mono font-bold tracking-widest outline-none focus:border-primary/50 border border-white/10 transition-colors placeholder:font-normal placeholder:tracking-normal"
                      autoFocus
                    />
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-2 px-1"
                      >
                        {error}
                      </motion.p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!code.trim() || isLoading}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Checking...' : 'View Menu'}
                    {!isLoading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <p className="text-slate-300/70 text-sm text-center mt-6">
                  Don't know your code? Ask your canteen head.
                </p>
              </div>

              <div className="text-center mt-6">
                <a
                  href="/admin/login"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white text-sm transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/admin/login');
                  }}
                >
                  <Lock className="w-4 h-4" />
                  Canteen Head Login
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollegeCodeEntryPage;
