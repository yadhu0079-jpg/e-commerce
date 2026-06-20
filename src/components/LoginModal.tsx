import React, { useState } from 'react';
import { X, User, Key, Mail, Lock, UserCheck, ShieldAlert } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (email: string, password: string, name: string) => Promise<boolean>;
}

export default function LoginModal({
  onClose,
  onLogin,
  onRegister
}: LoginModalProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorStatus, setErrorStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quick Login convenience triggers
  const handleQuickLogin = async (role: 'user' | 'admin') => {
    setSubmitting(true);
    setErrorStatus('');
    const targetEmail = role === 'admin' ? 'admin@example.com' : 'user@example.com';
    const targetPassword = role === 'admin' ? 'admin123' : 'user123';
    
    try {
      const loggedIn = await onLogin(targetEmail, targetPassword);
      if (loggedIn) {
        onClose();
      } else {
        setErrorStatus('Quick Login Credentials failed unexpectedly.');
      }
    } catch {
      setErrorStatus('Error connecting to the authentication server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegisterMode && !name)) {
      setErrorStatus('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorStatus('');

    try {
      if (isRegisterMode) {
        const registered = await onRegister(email, password, name);
        if (registered) {
          // Immediately log them in
          await onLogin(email, password);
          onClose();
        } else {
          setErrorStatus('Email address already exists in our database.');
        }
      } else {
        const logged = await onLogin(email, password);
        if (logged) {
          onClose();
        } else {
          setErrorStatus('Invalid account credentials. Try again or quick-fill.');
        }
      }
    } catch {
      setErrorStatus('Communication error with authentication API.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-45" id="login-modal-backdrop">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Container */}
      <div className="relative w-full max-w-sm transform overflow-hidden rounded-2xl p-6 shadow-2xl transition-all glass-card border border-white/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          id="login-modal-close"
          className="absolute top-4 right-4 rounded-full p-1 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand identity badge */}
        <div className="text-center pt-2 pb-5">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 mb-3">
            <UserCheck className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {isRegisterMode ? 'Form Atelier Account' : 'Authenticate Credentials'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Unlock seamless order logging and historic tracking records.</p>
        </div>

        {/* Demo Fast Logins Block */}
        <div className="mb-5 rounded-xl bg-white/3 border border-white/5 p-3 text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 font-mono">Test Accounts Quick Fill</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="quick-login-user"
              onClick={() => handleQuickLogin('user')}
              className="py-1.5 rounded-lg border border-white/5 bg-slate-900/60 text-[10px] font-bold text-slate-300 hover:text-white hover:bg-slate-900/90 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <span className="text-slate-205 font-bold">Alex (Customer)</span>
              <span className="text-[9px] text-slate-450 font-normal">user@example.com</span>
            </button>
            <button
              id="quick-login-admin"
              onClick={() => handleQuickLogin('admin')}
              className="py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/20 text-[10px] font-bold text-amber-300 hover:text-white hover:bg-amber-500/30 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <span className="text-amber-205 font-bold">Admin Dashboard</span>
              <span className="text-[9px] text-amber-455 font-normal">admin@example.com</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorStatus && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-2 text-xs text-rose-300 font-semibold mb-4">
              <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0 text-rose-400" />
              <span>{errorStatus}</span>
            </div>
          )}

          {isRegisterMode && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 font-mono">Your Full Name</label>
              <div className="relative mt-1">
                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-name-input"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl glass-input py-2 pl-9 pr-3 text-xs outline-none placeholder:text-slate-650"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 font-mono">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="login-email-input"
                type="email"
                required
                placeholder="e.g. email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl glass-input py-2 pl-9 pr-3 text-xs outline-none placeholder:text-slate-650"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 font-mono">Password Code</label>
            <div className="relative mt-1">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                id="login-password-input"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl glass-input py-2 pl-9 pr-3 text-xs outline-none placeholder:text-slate-650"
              />
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={submitting}
            className="w-full rounded-xl py-2.5 px-4 bg-indigo-600 hover:bg-indigo-505 text-white border border-indigo-500/30 text-xs uppercase font-bold tracking-widest transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            {submitting ? 'Validation Processing...' : isRegisterMode ? 'Sign Up Atelier Account' : 'Authorize Secure Session'}
          </button>
        </form>

        {/* Mode Toggler */}
        <div className="mt-5 text-center text-xs">
          <span className="text-slate-400">
            {isRegisterMode ? 'Already hold an account?' : 'Curious for a private logging space?'}
          </span>
          <button
            id="toggle-auth-mode"
            onClick={() => { setIsRegisterMode(!isRegisterMode); setErrorStatus(''); }}
            className="ml-1 font-bold text-slate-200 underline hover:text-white cursor-pointer"
          >
            {isRegisterMode ? 'Login here' : 'Register account'}
          </button>
        </div>
      </div>
    </div>
  );
}
