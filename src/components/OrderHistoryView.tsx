import React, { useState } from 'react';
import { Package, Clock, Truck, CheckCircle2, ChevronDown, ChevronUp, Search, Calendar } from 'lucide-react';
import { Order } from '../types';
import { formatPrice } from '../utils/currency';

interface OrderHistoryViewProps {
  orders: Order[];
}

export default function OrderHistoryView({ orders }: OrderHistoryViewProps) {
  const [searchId, setSearchId] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    if (expandedOrders.includes(id)) {
      setExpandedOrders(expandedOrders.filter(x => x !== id));
    } else {
      setExpandedOrders([...expandedOrders, id]);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchId.toLowerCase()) ||
    o.items.some(item => item.name.toLowerCase().includes(searchId.toLowerCase()))
  );

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4 text-amber-400" />;
      case 'Shipped':
        return <Truck className="h-4 w-4 text-sky-400 animate-pulse" />;
      case 'Delivered':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      default:
        return <Package className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/25';
      case 'Shipped':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/25';
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25';
      default:
        return 'bg-white/5 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Your Dispatched Orders</h2>
          <p className="text-xs text-slate-400 mt-1">Check current transit progress logs or inspect purchase listings.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="order-search"
            type="text"
            placeholder="Search order ID or product name..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full rounded-xl glass-input py-2 pr-4 pl-9 text-xs outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl glass-card">
          <Package className="h-8 w-8 text-slate-500 mb-3" />
          <h3 className="font-semibold text-white text-sm">No recorded orders found</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">When you checkout items from your shopping basket, they will emerge here dynamically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isExpanded = expandedOrders.includes(order.id);
            return (
              <div 
                key={order.id} 
                className="rounded-2xl glass-card overflow-hidden shadow-sm transition-all"
                id={`order-block-${order.id}`}
              >
                {/* Summary header */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 cursor-pointer bg-white/3 hover:bg-white/8 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-white uppercase">ID: {order.id}</span>
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1 sm:mt-1.5">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                        <span>•</span>
                        <span>{order.items.reduce((sum, i) => sum + i.quantity, 0)} elements</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-455 block font-mono">Grand Total</span>
                      <span className="text-sm font-bold text-white">{formatPrice(order.totalAmount)}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-slate-400" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-4 sm:p-6 space-y-6 bg-slate-950/20 animate-fade-in">
                    {/* Items grid list */}
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-455 font-mono">Order Items</h4>
                      <div className="divide-y divide-white/5 border border-white/5 rounded-xl bg-slate-950/40 overflow-hidden p-3 sm:p-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover object-center bg-slate-900 border border-white/5"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 flex justify-between items-center text-xs">
                              <div>
                                <p className="font-semibold text-white">{item.name}</p>
                                <p className="text-slate-400 mt-0.5">Quantity: {item.quantity} × {formatPrice(item.price)}</p>
                              </div>
                              <span className="font-bold text-white">{formatPrice(item.quantity * item.price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress tracking path bar */}
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-455 font-mono">Logistics Milestones</h4>
                      <div className="grid grid-cols-3 gap-2 py-4">
                        <div className="text-center relative">
                          <div className={`mx-auto h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                            ['Pending', 'Shipped', 'Delivered'].includes(order.status) 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                              : 'bg-white/5 border-white/10 text-slate-500'
                          }`}>
                            1
                          </div>
                          <span className="text-[10px] font-semibold text-slate-350 block mt-1.5">Registered</span>
                        </div>
                        <div className="text-center relative">
                          <div className={`mx-auto h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                            ['Shipped', 'Delivered'].includes(order.status) 
                              ? 'bg-sky-500/20 text-sky-305 border-sky-500/30' 
                              : 'bg-white/5 border-white/10 text-slate-500'
                          }`}>
                            2
                          </div>
                          <span className="text-[10px] font-semibold text-slate-355 block mt-1.5">In Transit</span>
                        </div>
                        <div className="text-center relative">
                          <div className={`mx-auto h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                            order.status === 'Delivered' 
                              ? 'bg-emerald-500/20 text-emerald-305 border-emerald-500/30' 
                              : 'bg-white/5 border-white/10 text-slate-500'
                          }`}>
                            3
                          </div>
                          <span className="text-[10px] font-semibold text-slate-355 block mt-1.5">Arrived / Handed</span>
                        </div>
                      </div>
                    </div>

                    {/* Address block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-5">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-455 font-mono mb-2">Transit Destination</h4>
                        <div className="p-3.5 rounded-xl border border-white/5 font-sans text-xs text-slate-300 space-y-1 bg-slate-950/40">
                          <p className="font-semibold text-white">{order.shippingAddress.name}</p>
                          <p>{order.shippingAddress.line1}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-455 font-mono mb-2">Financial Invoice</h4>
                        <div className="p-3.5 rounded-xl border border-white/5 font-mono text-xs text-slate-400 space-y-1.5 bg-slate-950/40">
                          <div className="flex justify-between">
                            <span>Billed Account ID:</span>
                            <span className="text-slate-200">{order.userId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Account Email:</span>
                            <span className="text-slate-205">{order.userEmail}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-white/5 font-bold text-white font-sans text-sm">
                            <span>Billed Total:</span>
                            <span>{formatPrice(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
