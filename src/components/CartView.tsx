import React, { useState } from 'react';
import { ShoppingCart, ArrowLeft, Trash2, ShieldCheck, MapPin, CheckCircle, Rocket, Sparkles } from 'lucide-react';
import { CartItem, ShippingAddress, Order } from '../types';
import { formatPrice } from '../utils/currency';

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (shippingAddress: ShippingAddress) => Promise<Order | null>;
  onClearCart: () => void;
  onBackToShopping: () => void;
}

export default function CartView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onClearCart,
  onBackToShopping
}: CartViewProps) {
  const [address, setAddress] = useState<ShippingAddress>({
    name: '',
    line1: '',
    city: '',
    postalCode: '',
    country: 'United States'
  });
  const [isFinishing, setIsFinishing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);

  // Math totals calculation
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shippingCharge = subtotal >= 150 ? 0 : 15;
  const totalAmount = subtotal + shippingCharge;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.name || !address.line1 || !address.city || !address.postalCode) {
      alert('Please fill out all address details.');
      return;
    }

    setIsFinishing(true);
    try {
      const dispatchedOrder = await onCheckout(address);
      if (dispatchedOrder) {
        setOrderConfirmed(dispatchedOrder);
        onClearCart();
      }
    } catch (err) {
      console.error('Checkout failed.', err);
    } finally {
      setIsFinishing(false);
    }
  };

  // Order Confirmed Visual Screen
  if (orderConfirmed) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 rounded-3xl glass-card text-center shadow-2xl" id="order-success-screen">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
          <CheckCircle className="h-7 w-7" />
        </div>
        
        <h2 className="text-2xl font-bold text-white tracking-tight">Order Dispatched</h2>
        <p className="text-xs font-mono uppercase tracking-widest text-amber-300 mt-2 bg-amber-500/20 border border-amber-500/35 inline-block px-3 py-1 rounded-md">
          ID: {orderConfirmed.id}
        </p>

        <p className="text-sm text-slate-300 mt-4 max-w-sm mx-auto">
          Your payment was successfully logged, and product inventory was updated. We have dispatched your dispatch receipt to <strong>{orderConfirmed.userEmail}</strong>.
        </p>

        {/* Short Summary details */}
        <div className="mt-8 border-t border-b border-white/5 py-5 text-left space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-450 font-mono">Shipment Details</h4>
          <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-1 text-xs text-slate-300 font-sans">
            <p className="font-semibold text-slate-100">{orderConfirmed.shippingAddress.name}</p>
            <p>{orderConfirmed.shippingAddress.line1}</p>
            <p>{orderConfirmed.shippingAddress.city}, {orderConfirmed.shippingAddress.postalCode}</p>
            <p>{orderConfirmed.shippingAddress.country}</p>
          </div>
          <div className="flex justify-between items-center text-xs font-bold text-white pt-2 border-t border-white/5">
            <span>Total Logged Price:</span>
            <span>{formatPrice(orderConfirmed.totalAmount)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onBackToShopping}
            className="rounded-xl bg-indigo-600 border border-indigo-500/30 px-6 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Blank Basket state
  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center rounded-2xl glass-card shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 mb-4 animate-pulse">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-white text-base">Your shopping basket is empty</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-2 leading-relaxed">
          Explore our minimalist Atelier furniture and accessories catalog to load premium items into your basket.
        </p>
        <button
          onClick={onBackToShopping}
          className="mt-6 inline-flex items-center space-x-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 rounded-xl cursor-pointer shadow-md"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <button
          onClick={onBackToShopping}
          className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-white">Your Shopping Basket ({cartItems.length})</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Basket List column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 divide-y divide-white/5">
            {cartItems.map(item => (
              <div key={item.product.id} className="flex gap-4 pt-4 first:pt-0" id={`cart-row-${item.product.id}`}>
                {/* Thumb */}
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-slate-900/40 border border-white/5 flex-shrink-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-full w-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Meta details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 leading-tight">{item.product.name}</h3>
                      <p className="font-mono text-[10px] text-slate-455 uppercase tracking-wider mt-0.5">{item.product.category}</p>
                    </div>
                    <span className="text-sm font-bold text-white">{formatPrice(item.product.price)}</span>
                  </div>

                  {/* Qty incrementors + Delete */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-white/10 bg-slate-950/50">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-1 text-slate-400 hover:text-white text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-2.5 font-mono text-xs text-slate-200 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-2 py-1 text-slate-400 hover:text-white text-xs font-bold disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                    
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-slate-450 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-950/30 border border-transparent hover:border-rose-500/15 transition-colors cursor-pointer"
                      title="Remove product"
                      id={`remove-cart-item-${item.product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Secure transaction guarantees */}
          <div className="rounded-2xl border border-white/5 bg-slate-950/45 p-4 flex items-start space-x-3 text-xs">
            <ShieldCheck className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-semibold text-white">Compliant SSL Encrypted Checkout</p>
              <p className="text-slate-400 mt-0.5">We proxy card operations through dummy API handlers, ensuring absolute secure credentials compliance against unauthorized access.</p>
            </div>
          </div>
        </div>

        {/* Checkout column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Summary Breakdown Card */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-450 font-mono">Billing Summary</h3>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Basket Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Flat-rate Courier Delivery</span>
                <span>{shippingCharge === 0 ? <strong className="text-emerald-450">Free Courier</strong> : formatPrice(shippingCharge)}</span>
              </div>
              {shippingCharge > 0 && (
                <div className="bg-indigo-950/30 border border-indigo-500/15 rounded-xl p-2.5 flex items-center space-x-1.5 text-[11px] text-indigo-300">
                  <Rocket className="h-3.5 w-3.5 animate-bounce" />
                  <span>Add <strong>{formatPrice(150 - subtotal)}</strong> more to unlock complimentary Free Courier delivery.</span>
                </div>
              )}
              <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-base font-bold text-white">
                <span>Total Amount Due</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Checkout/Delivery Address form */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <MapPin className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-bold text-white">Shipping Delivery Destination</h3>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Recipient full name</label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  placeholder="e.g. Alex Jones"
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  className="mt-1 w-full rounded-xl glass-input py-2 px-3 text-sm outline-none placeholder:text-slate-650"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Street / Line 1 Address</label>
                <input
                  id="checkout-line1"
                  type="text"
                  required
                  placeholder="e.g. 123 Serene Boulevard"
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  className="mt-1 w-full rounded-xl glass-input py-2 px-3 text-sm outline-none placeholder:text-slate-650"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Town / City</label>
                  <input
                    id="checkout-city"
                    type="text"
                    required
                    placeholder="e.g. San Francisco"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="mt-1 w-full rounded-xl glass-input py-2 px-3 text-sm outline-none placeholder:text-slate-650"
                  />
                </div>
                <div>
                   <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Zip / Postal Code</label>
                  <input
                    id="checkout-postalCode"
                    type="text"
                    required
                    placeholder="e.g. 94103"
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    className="mt-1 w-full rounded-xl glass-input py-2 px-3 text-sm outline-none placeholder:text-slate-650"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Country / Region</label>
                <select
                  id="checkout-country"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 text-slate-300 py-2 px-3 text-sm outline-none focus:border-indigo-500/50"
                >
                  <option value="United States" className="bg-slate-950 text-slate-350">United States</option>
                  <option value="United Kingdom" className="bg-slate-950 text-slate-350">United Kingdom</option>
                  <option value="Germany" className="bg-slate-950 text-slate-350">Germany</option>
                  <option value="Japan" className="bg-slate-950 text-slate-350">Japan</option>
                  <option value="Singapore" className="bg-slate-950 text-slate-350">Singapore</option>
                  <option value="India" className="bg-slate-950 text-slate-350">India</option>
                </select>
              </div>

              <button
                type="submit"
                id="checkout-submit-btn"
                disabled={isFinishing}
                className="mt-6 w-full rounded-xl py-3 px-4 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 text-white text-xs uppercase font-bold tracking-widest transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-indigo-600/10"
              >
                <span>{isFinishing ? 'Communicating Backend API...' : 'Log Atelier Purchase Order'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
