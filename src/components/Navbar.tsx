import React from 'react';
import { ShoppingBag, LayoutDashboard, UserCheck, LogOut, PackageOpen, ShoppingCart, User } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentUser: UserType | null;
  activeTab: 'catalog' | 'cart' | 'orders' | 'admin';
  setActiveTab: (tab: 'catalog' | 'cart' | 'orders' | 'admin') => void;
  cartCount: number;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export default function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  cartCount,
  onOpenLogin,
  onLogout
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and title */}
        <div 
          className="flex cursor-pointer items-center space-x-2.5" 
          onClick={() => setActiveTab('catalog')}
          id="nav-logo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <PackageOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg tracking-tight text-white text-nowrap">
              ZEROCK
            </h1>
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
              Living & Office
            </p>
          </div>
        </div>

        {/* Navigation links for tabs */}
        <nav className="hidden md:flex items-center space-x-1.5">
          <button
            id="tab-btn-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'catalog'
                ? 'bg-white/10 text-white border border-white/10'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Catalog
          </button>
          
          {currentUser && (
            <button
              id="tab-btn-orders"
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'orders'
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              My Orders
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              id="tab-btn-admin"
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center space-x-1.5 ${
                activeTab === 'admin'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Admin Management</span>
            </button>
          )}
        </nav>

        {/* Action icons / auth controls */}
        <div className="flex items-center space-x-4">
          {/* Cart Icon Button */}
          <button
            id="nav-cart-btn"
            onClick={() => setActiveTab('cart')}
            className={`relative p-2 rounded-xl border transition-all ${
              activeTab === 'cart'
                ? 'border-indigo-500/30 bg-indigo-600/30 text-indigo-250 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                : 'border-white/15 text-slate-300 bg-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                activeTab === 'cart' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-600 text-white'
              }`}>
                {cartCount}
              </span>
            )}
          </button>

          {/* User Section */}
          {currentUser ? (
            <div className="flex items-center space-x-3 pl-3 border-l border-white/10">
              <div className="hidden lg:block text-right">
                <p id="user-display-name" className="text-xs font-semibold text-slate-100">{currentUser.name}</p>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  currentUser.role === 'admin' 
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                    : 'bg-white/15 text-slate-300'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <div 
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-200 border border-white/5 cursor-pointer hover:bg-white/20 transition-colors"
                title={`${currentUser.name} (${currentUser.role})`}
              >
                <UserCheck className="h-4 w-4" />
              </div>
              <button
                id="logout-btn"
                onClick={onLogout}
                className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-rose-900/20 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              id="login-trigger-btn"
              onClick={onOpenLogin}
              className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/10 transition-all"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav Header */}
      <div className="flex md:hidden border-t border-white/5 px-4 py-2 justify-around bg-slate-950/60 backdrop-blur-lg">
        <button
          id="mobile-btn-catalog"
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center py-1 text-[11px] font-medium transition-colors ${
            activeTab === 'catalog' ? 'text-white font-bold' : 'text-slate-400'
          }`}
        >
          <span>Catalog</span>
        </button>
        {currentUser && (
          <button
            id="mobile-btn-orders"
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'orders' ? 'text-white font-bold' : 'text-slate-400'
            }`}
          >
            <span>My Orders</span>
          </button>
        )}
        {currentUser?.role === 'admin' && (
          <button
            id="mobile-btn-admin"
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center py-1 text-[11px] font-medium transition-colors ${
              activeTab === 'admin' ? 'text-amber-300 font-bold' : 'text-amber-500/70'
            }`}
          >
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
}
