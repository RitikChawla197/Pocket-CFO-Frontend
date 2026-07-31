import React, { useState } from 'react';
import { Landmark, X, Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { FinancialState } from '../types/financial';
import { INITIAL_DATA, EMPTY_STATE } from '../utils/storage';

import { API_ENDPOINTS } from '../utils/api';

export interface UserSession {
  id: number;
  name: string;
  email: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserSession, data: FinancialState) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'register' && !name)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'register' ? API_ENDPOINTS.register : API_ENDPOINTS.login;
      const body = mode === 'register' ? { name, email, password } : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || 'Authentication failed');
      }

      toast.success(mode === 'register' ? 'Account created successfully!' : 'Welcome back!', {
        description: mode === 'register' ? 'Your fresh zero-balance CFO dashboard is ready.' : `Logged in as ${resData.user.name}`,
      });

      // Save auth token to localStorage
      localStorage.setItem('cfo_user_session', JSON.stringify(resData.user));
      onSuccess(resData.user, resData.data || EMPTY_STATE);
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      toast.error(err.message || 'Authentication error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser: UserSession = { id: 999, name: 'Rahul Sharma (Demo)', email: 'demo@personalcfo.ai' };
    localStorage.setItem('cfo_user_session', JSON.stringify(demoUser));
    toast.success('Loaded Live Demo Mode!', {
      description: 'Viewing sample financial snapshot with pre-filled figures.',
    });
    onSuccess(demoUser, INITIAL_DATA);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-[#142E22] border border-[#2A5440] rounded-3xl max-w-md w-full p-6 sm:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-white hover:bg-emerald-900/50 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-900/90 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
            <Landmark className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold font-display text-white m-0">
            {mode === 'register' ? 'Create Your CFO Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-emerald-200/70 font-body max-w-xs mx-auto">
            {mode === 'register' 
              ? 'Start with a clean slate. Track income, expenses, assets, and AI insights securely.'
              : 'Sign in to access your stored financial snapshots and AI diagnostics.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-emerald-950/80 rounded-xl border border-emerald-800/60">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-emerald-500 text-[#1A3B2B] shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-emerald-500 text-[#1A3B2B] shadow-sm'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-emerald-300 block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full bg-emerald-950/60 border border-emerald-700/60 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-stone-100 placeholder-emerald-700/60 focus:outline-none focus:border-emerald-400 transition-colors"
                />
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/70" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-300 block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full bg-emerald-950/60 border border-emerald-700/60 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-stone-100 placeholder-emerald-700/60 focus:outline-none focus:border-emerald-400 transition-colors"
              />
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/70" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-300 block">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-emerald-950/60 border border-emerald-700/60 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-stone-100 placeholder-emerald-700/60 focus:outline-none focus:border-emerald-400 font-mono transition-colors"
              />
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/70" />
            </div>
          </div>

          {mode === 'register' && (
            <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/40 text-[11px] text-emerald-200/80 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>New account starts with <strong>0 pre-filled entries</strong> so you can enter your exact real figures.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-[#1A3B2B] font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Processing...' : mode === 'register' ? 'Create Account & Open Dashboard' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-emerald-800/60 w-full"></div>
          <span className="bg-[#142E22] px-3 text-[10px] uppercase font-bold text-emerald-400/60 font-display shrink-0">OR EXPLORE DEMO</span>
        </div>

        {/* Demo Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full py-2.5 bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Launch Demo Dashboard with Sample Figures</span>
        </button>
      </div>
    </div>
  );
};
