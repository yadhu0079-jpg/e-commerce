import React, { useState } from 'react';
import { LayoutDashboard, DollarSign, Package, ShoppingBag, AlertTriangle, Plus, Edit, Trash2, Check, CheckCircle2, RotateCcw } from 'lucide-react';
import { Product, Order } from '../types';
import { formatPrice, CONVERSION_RATE } from '../utils/currency';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Omit<Product, 'id' | 'rating' | 'createdAt'>) => Promise<boolean>;
  onEditProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
}

export default function AdminPanel({
  products,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus
}: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'products' | 'orders'>('analytics');
  
  // Product Form states
  const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or productId
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formCategory, setFormCategory] = useState('Desk Setup');
  const [formStock, setFormStock] = useState(1);
  const [formImage, setFormImage] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Template Images for convenient quick-filling
  const QUICK_IMAGE_SUGGESTIONS = [
    { label: 'Unsplash Keyboard Case', url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600' },
    { label: 'Unsplash Minimalist Lamp', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600' },
    { label: 'Unsplash Audio Console', url: 'https://images.unsplash.com/photo-1461301214746-1e109215d6d3?auto=format&fit=crop&q=80&w=600' }
  ];

  // Advanced calculations
  const totalEarnings = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderVal = orders.length > 0 ? Math.round(totalEarnings / orders.length) : 0;
  const lowStockCount = products.filter(p => p.stock <= 5).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

  // Form Loaders
  const handleOpenNewForm = () => {
    setIsEditing('new');
    setFormName('');
    setFormDesc('');
    setFormPrice(49);
    setFormCategory('Desk Setup');
    setFormStock(15);
    setFormImage(QUICK_IMAGE_SUGGESTIONS[0].url);
    setFormError('');
  };

  const handleOpenEditForm = (p: Product) => {
    setIsEditing(p.id);
    setFormName(p.name);
    setFormDesc(p.description);
    setFormPrice(p.price);
    setFormCategory(p.category);
    setFormStock(p.stock);
    setFormImage(p.imageUrl);
    setFormError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formDesc || !formImage || formPrice <= 0 || formStock < 0) {
      setFormError('Please enter compliant logical product values');
      return;
    }

    setFormLoading(true);
    setFormError('');

    try {
      if (isEditing === 'new') {
        const success = await onAddProduct({
          name: formName,
          description: formDesc,
          price: Number(formPrice),
          category: formCategory,
          stock: Number(formStock),
          imageUrl: formImage
        });
        if (success) setIsEditing(null);
      } else {
        const success = await onEditProduct(isEditing!, {
          name: formName,
          description: formDesc,
          price: Number(formPrice),
          category: formCategory,
          stock: Number(formStock),
          imageUrl: formImage
        });
        if (success) setIsEditing(null);
      }
    } catch (err: any) {
      setFormError('Failed to execute database API write call');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm('Are you sure you want to remove this Atelier element?')) {
      await onDeleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Atelier Management</h2>
          <p className="text-xs text-slate-400 mt-1">Configure stock lines, review purchase logs, and examine operations.</p>
        </div>

        {/* Sub Navigation */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 self-start sm:self-center">
          <button
            onClick={() => { setActiveSubTab('analytics'); setIsEditing(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'analytics' ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-slate-400 hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => { setActiveSubTab('products'); setIsEditing(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'products' ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => { setActiveSubTab('orders'); setIsEditing(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'orders' ? 'bg-white/10 text-white shadow-lg shadow-white/5' : 'text-slate-400 hover:text-white'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {/* SUBTAB 1: ANALYTICS BOARDS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          {/* Card stats grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Sales */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-455 font-mono">Total Revenue</span>
                <div className="p-2 bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <DollarSign className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{formatPrice(totalEarnings)}</p>
              <p className="mt-1 text-[11px] text-slate-450">Sum of overall approved orders</p>
            </div>

            {/* Total Orders */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-455 font-mono">Total Invoices</span>
                <div className="p-2 bg-indigo-500/20 border border-indigo-500/20 rounded-xl text-indigo-400">
                  <ShoppingBag className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{orders.length}</p>
              <p className="mt-1 text-[11px] text-slate-450">{pendingOrdersCount} pending shipping logs</p>
            </div>

            {/* Average Order Value */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-455 font-mono">Average Cart Value</span>
                <div className="p-2 bg-sky-500/20 border border-sky-500/20 rounded-xl text-sky-455">
                  <RotateCcw className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{formatPrice(avgOrderVal)}</p>
              <p className="mt-1 text-[11px] text-slate-450">Ticket size of overall transactions</p>
            </div>

            {/* Low Stocks */}
            <div className="glass-card rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-455 font-mono">Restock Indicators</span>
                <div className={`p-2 rounded-xl border ${lowStockCount > 0 ? 'bg-amber-500/20 text-amber-400 border-amber-500/35 animate-pulse' : 'bg-emerald-500/20 text-emerald-450 border-emerald-500/20'}`}>
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-white">{lowStockCount}</p>
              <p className="mt-1 text-[11px] text-slate-450">{products.length} catalog items tracked</p>
            </div>
          </div>

          {/* Quick lists summaries panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Low inventory items alerts */}
            <div className="glass-card rounded-2xl p-5 bg-white/2 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/25 flex items-center space-x-2 font-mono">
                <AlertTriangle className="h-4 w-4" />
                <span>Restock alerts & warning thresholds</span>
              </h3>
              
              {products.filter(p => p.stock <= 5).length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-semibold">Store inventory levels stable.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 space-y-3">
                  {products.filter(p => p.stock <= 5).map(p => (
                    <div key={p.id} className="flex justify-between items-center pt-3 first:pt-0">
                      <div>
                        <p className="text-xs font-semibold text-slate-100">{p.name}</p>
                        <p className="text-[10px] text-slate-450 uppercase tracking-wider mt-0.5">{p.category}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${p.stock === 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                        {p.stock === 0 ? 'Out of Stock' : `${p.stock} units left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Short recent activity tracker */}
            <div className="glass-card rounded-2xl p-5 bg-white/2 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-455 font-mono">Atelier Activity Logs</h3>
              <div className="space-y-4 text-xs text-slate-300">
                <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-2">
                  <p className="font-semibold text-slate-100 flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-450"></span>
                    <span>REST Server listening securely</span>
                  </p>
                  <p className="text-[11px] text-slate-450">Database server initialized via JSON FS write permissions at port 3000.</p>
                </div>
                <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-2">
                  <p className="font-semibold text-slate-100 flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                    <span>Admin Credentials</span>
                  </p>
                  <p className="text-[11px] text-slate-455">Quick Login available on login console using test passwords.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PRODUCT MANAGEMENT */}
      {activeSubTab === 'products' && (
        <div className="space-y-6 animate-fade-in">
          {/* Headline and additive controls */}
          {!isEditing && (
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-455 font-mono">{products.length} elements mapped</h3>
              <button
                id="admin-add-product-btn"
                onClick={handleOpenNewForm}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 border border-indigo-500/30 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-555 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Element</span>
              </button>
            </div>
          )}

          {/* Form Editor Block */}
          {isEditing && (
            <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-md" id="product-form-block">
              <h4 className="text-sm font-bold text-white border-b border-white/5 pb-3 mb-4 font-sans">
                {isEditing === 'new' ? 'Fabricate New Atelier Element' : 'Modify Atelier Element Specifications'}
              </h4>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {formError && <p className="text-xs text-rose-450 font-semibold">{formError}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 font-mono">Element title</label>
                    <input
                      id="form-product-name"
                      type="text"
                      required
                      placeholder="e.g. Keystone Oak Keyboard"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="mt-1 w-full rounded-xl glass-input py-2.5 px-3 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 font-mono">Category</label>
                    <select
                      id="form-product-category"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 text-slate-350 py-2.5 px-3 text-xs outline-none focus:border-indigo-555/50"
                    >
                      <option value="Desk Setup" className="bg-slate-950 text-slate-350">Desk Setup</option>
                      <option value="Audio" className="bg-slate-950 text-slate-350">Audio</option>
                      <option value="Accessories" className="bg-slate-950 text-slate-350">Accessories</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 font-mono">Detail descriptions</label>
                  <textarea
                    id="form-product-desc"
                    required
                    placeholder="Provide pristine elegant parameters, sizes, colors and materials..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-xl glass-input py-2.5 px-3 text-xs text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 font-mono">Price (USD Base)</label>
                    <input
                      id="form-product-price"
                      type="number"
                      required
                      min={1}
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl glass-input py-2.5 px-3 text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 font-mono">Inventory Stock Level</label>
                    <input
                      id="form-product-stock"
                      type="number"
                      required
                      min={0}
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl glass-input py-2.5 px-3 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-455 font-mono">Product Image URL</label>
                  <input
                    id="form-product-image"
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="mt-1 w-full rounded-xl glass-input py-2.5 px-3 text-xs text-white outline-none"
                  />
                  {/* Image Quick Recommendations */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {QUICK_IMAGE_SUGGESTIONS.map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setFormImage(img.url)}
                        className="text-[10px] bg-white/5 border border-white/10 hover:border-white/20 rounded px-2.5 py-1 text-slate-400 hover:text-white cursor-pointer transition-colors"
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submits buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(null)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-350 hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    id="product-form-submit"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 px-4 py-2.5 text-xs font-semibold text-white transition-all flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    {formLoading ? <span>Saving...</span> : <><span>Validate Specifications</span></>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grid listing products */}
          {!isEditing && (
            <div className="glass-card rounded-2xl overflow-hidden shadow-sm" id="admin-products-table">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/3 text-[10px] font-bold uppercase tracking-wider text-slate-455 font-mono border-b border-white/5">
                      <th className="py-4 px-6">Element</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Stock</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-white/2 transition-colors" id={`admin-product-row-${p.id}`}>
                        <td className="py-4 px-6 flex items-center space-x-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover bg-slate-900 border border-white/5 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-semibold text-white">{p.name}</p>
                            <p className="text-[10px] text-slate-450 font-mono">ID: {p.id}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold">{p.category}</td>
                        <td className="py-4 px-6 font-bold text-white">{formatPrice(p.price)}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border leading-normal ${
                            p.stock <= 5 ? 'bg-amber-500/20 text-amber-300 border-amber-500/25' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              id={`admin-edit-prod-${p.id}`}
                              onClick={() => handleOpenEditForm(p)}
                              className="p-1 px-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-350 hover:text-white bg-white/5 flex items-center space-x-1 cursor-pointer transition-colors"
                              title="Edit specifications"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-semibold font-mono">Modify</span>
                            </button>
                            <button
                              id={`admin-delete-prod-${p.id}`}
                              onClick={() => handleDeleteClick(p.id)}
                              className="p-1 px-2 rounded-lg border border-rose-500/30 hover:bg-rose-950/20 text-rose-400 bg-rose-950/10 hover:text-rose-355 flex items-center space-x-1 cursor-pointer transition-colors"
                              title="Delete element"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-semibold font-mono">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: ORDER OPERATION LISTS */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4 animate-fade-in" id="admin-orders-tab">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-455 font-mono">{orders.length} transaction invoices overall</h3>

          <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/3 text-[10px] font-bold uppercase tracking-wider text-slate-455 font-mono border-b border-white/5">
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Purchased Items</th>
                    <th className="py-4 px-6">Amount Billed</th>
                    <th className="py-4 px-6">Transit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-350">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-white/2 transition-colors" id={`admin-order-row-${order.id}`}>
                      <td className="py-4 px-6 font-mono font-bold text-white uppercase">
                        {order.id}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-100">{order.userName}</p>
                          <p className="text-[10px] text-slate-450 font-sans">{order.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="max-w-[200px] line-clamp-2 text-slate-300">
                          {order.items.map((i, idx) => (
                            <span key={idx} className="block font-medium">
                              {i.quantity}× {i.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-white">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {/* Transit Dropdown Switch */}
                          <select
                            id={`status-dropdown-${order.id}`}
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                            className={`rounded-lg border py-1.5 px-3.5 text-xs font-semibold outline-none transition-colors cursor-pointer ${
                              order.status === 'Pending' ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' :
                              order.status === 'Shipped' ? 'bg-sky-500/20 border-sky-500/30 text-sky-305' :
                              order.status === 'Delivered' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-355' :
                              'bg-white/5 border-white/10 text-slate-400'
                            }`}
                          >
                            <option value="Pending" className="bg-slate-950 text-slate-300">Pending</option>
                            <option value="Shipped" className="bg-slate-950 text-slate-300">Shipped</option>
                            <option value="Delivered" className="bg-slate-950 text-slate-300">Delivered</option>
                            <option value="Cancelled" className="bg-slate-950 text-slate-300">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
