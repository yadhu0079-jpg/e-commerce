import React, { useState } from 'react';
import { X, Star, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/currency';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart
}: ProductDetailsModalProps) {
  const [qty, setQty] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleDecrease = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleIncrease = () => {
    if (qty < product.stock) setQty(qty + 1);
  };

  const handleAddToCart = () => {
    onAddToCart(product, qty);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" id="product-modal-backdrop">
      {/* Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl glass-card p-6 shadow-2xl transition-all sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          id="product-modal-close"
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Product Image Frame */}
        <div className="w-full md:w-1/2 aspect-square rounded-xl overflow-hidden bg-slate-900/40 border border-white/5">
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Product Info Block */}
        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category / Rating Row */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md">
                {product.category}
              </span>
              <div className="flex items-center space-x-1.5 text-amber-500">
                <Star className="h-4 w-4 fill-amber-500" />
                <span className="text-sm font-bold text-slate-300">{product.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            {/* Title / Price */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{product.name}</h2>
              <p className="mt-2 text-2xl font-bold text-slate-100">{formatPrice(product.price)}</p>
            </div>

            {/* Decription */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Specifications</h3>
              <p className="mt-1.5 text-sm text-slate-300 leading-relaxed font-sans">{product.description}</p>
            </div>

            {/* In Stock Levels */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-slate-450">In-Stock Levels:</span>
              {product.stock > 0 ? (
                <span className={`font-bold ${product.stock <= 5 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
                  {product.stock} units available
                </span>
              ) : (
                <span className="font-bold text-rose-500">Permanently Sold Out</span>
              )}
            </div>

            {/* Guarantee Statement */}
            <div className="rounded-xl bg-indigo-950/25 border border-indigo-500/15 p-3 flex items-start space-x-2.5">
              <Sparkles className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0 animate-pulse" />
              <p className="text-[11px] text-slate-400 leading-normal">
                Includes Atelier complimentary lifetime guarantee and 100-day returns. Delivered in certified zero-carbon premium paperboard modules.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center gap-4">
            {product.stock > 0 ? (
              <>
                {/* Quantity Switch */}
                <div className="flex items-center rounded-xl border border-white/10 bg-slate-950/50">
                  <button
                    onClick={handleDecrease}
                    disabled={qty <= 1}
                    className="px-3 py-2 text-slate-450 hover:text-white disabled:text-slate-650 disabled:cursor-not-allowed transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 font-semibold text-sm text-white">{qty}</span>
                  <button
                    onClick={handleIncrease}
                    disabled={qty >= product.stock}
                    className="px-3 py-2 text-slate-450 hover:text-white disabled:text-slate-650 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add To Cart button */}
                <button
                  onClick={handleAddToCart}
                  disabled={addedSuccess}
                  id="modal-add-to-cart-btn"
                  className={`flex-1 w-full rounded-xl py-3 px-6 text-sm font-semibold tracking-wide text-white transition-all flex items-center justify-center space-x-2 ${
                    addedSuccess 
                      ? 'bg-emerald-600 border border-emerald-500 shadow-md shadow-emerald-600/10' 
                      : 'bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-100" />
                      <span>Added to Basket</span>
                    </>
                  ) : (
                    <>
                      <span>Add {qty} to Basket</span>
                      <ArrowRight className="h-4 w-4 text-indigo-200" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                disabled
                className="w-full rounded-xl py-3 px-6 text-sm font-semibold text-slate-500 bg-slate-950/40 border border-white/5 text-center cursor-not-allowed"
              >
                Inquiries Open (Sold Out)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
