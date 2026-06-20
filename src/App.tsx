import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCatalog from './components/ProductCatalog';
import ProductDetailsModal from './components/ProductDetailsModal';
import CartView from './components/CartView';
import OrderHistoryView from './components/OrderHistoryView';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import { Product, CartItem, User, Order, ShippingAddress } from './types';
import { PackageOpen, Sparkles, UserCheck } from 'lucide-react';

export default function App() {
  // Tabs Routing
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart' | 'orders' | 'admin'>('catalog');
  
  // Core Data models
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Auth details
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Error/Success alert boards
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Initialize and load dependencies
  useEffect(() => {
    // 1. Fetch products
    fetchProducts();

    // 2. Load cached User session
    const cachedUser = localStorage.getItem('atelier_user');
    if (cachedUser) {
      try {
        const userObj: User = JSON.parse(cachedUser);
        setCurrentUser(userObj);
        // Fetch past orders for this verified user
        fetchOrders(userObj.id);
      } catch (e) {
        localStorage.removeItem('atelier_user');
      }
    }

    // 3. Load shopping cart cache
    const cachedCart = localStorage.getItem('atelier_cart');
    if (cachedCart) {
      try {
        setCart(JSON.parse(cachedCart));
      } catch (e) {
        localStorage.removeItem('atelier_cart');
      }
    }
  }, []);

  // Save Cart updates automatically
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('atelier_cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('atelier_cart');
    }
  }, [cart]);

  // Helper trigger to showcase transient alerts
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // REST Backend API synchronization calls
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const list = await res.json();
        setProducts(list);
      }
    } catch (err) {
      console.error('Error downloading products.', err);
    }
  };

  const fetchOrders = async (userId: string) => {
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': userId }
      });
      if (res.ok) {
        const orderHistories = await res.json();
        setOrders(orderHistories);
      }
    } catch (err) {
      console.error('Error fetching past orders catalog.', err);
    }
  };

  // Authentications: Register
  const handleRegister = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      if (res.ok) {
        showNotification('Account generated successfully. Access granted.', 'success');
        return true;
      } else {
        const data = await res.json();
        showNotification(data.error || 'Registration failed.', 'error');
        return false;
      }
    } catch (err) {
      showNotification('Error connecting to the registration backend endpoint.', 'error');
      return false;
    }
  };

  // Authentications: Login
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem('atelier_user', JSON.stringify(data.user));
        
        // Fetch active orders for logged user
        fetchOrders(data.user.id);
        
        showNotification(`Welcome back, ${data.user.name}.`, 'success');
        return true;
      } else {
        const data = await res.json();
        showNotification(data.error || 'Authentication denied.', 'error');
        return false;
      }
    } catch (err) {
      showNotification('Error linking with authentication backend.', 'error');
      return false;
    }
  };

  // Sign out triggers
  const handleLogout = () => {
    setCurrentUser(null);
    setOrders([]);
    localStorage.removeItem('atelier_user');
    showNotification('Session closed safely.', 'success');
    setActiveTab('catalog');
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    if (product.stock <= 0) {
      showNotification('This physical element is sold out.', 'error');
      return;
    }

    setCart(prev => {
      const matchedIdx = prev.findIndex(item => item.product.id === product.id);
      if (matchedIdx !== -1) {
        const updated = [...prev];
        const newQty = updated[matchedIdx].quantity + quantity;
        
        if (newQty > product.stock) {
          showNotification(`Cannot exceed total available stock (${product.stock} units).`, 'error');
          return prev;
        }

        updated[matchedIdx].quantity = newQty;
        showNotification(`Added ${quantity} units of ${product.name} to basket.`, 'success');
        return updated;
      } else {
        showNotification(`${product.name} loaded into shopping basket.`, 'success');
        return [...prev, { product, quantity }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    const matchedProduct = products.find(p => p.id === productId);
    if (matchedProduct && quantity > matchedProduct.stock) {
      showNotification(`Limited options left. Max available: ${matchedProduct.stock}`, 'error');
      return;
    }

    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showNotification('Product removed from basket.', 'success');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Checkout purchase order
  const handleCheckout = async (shippingAddress: ShippingAddress): Promise<Order | null> => {
    const formattedItems = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      imageUrl: item.product.imageUrl
    }));

    const cartSubtotal = cart.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);
    const courierFee = cartSubtotal >= 150 ? 0 : 15;
    const finalAmount = cartSubtotal + courierFee;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser ? currentUser.id : 'u-guest'
        },
        body: JSON.stringify({
          items: formattedItems,
          shippingAddress,
          totalAmount: finalAmount
        })
      });

      if (res.ok) {
        const orderRecord = await res.json();
        showNotification('Compliant checkout order finalized!', 'success');
        
        // Refresh catalog quantities
        fetchProducts();
        
        // If logged, refresh orders timeline
        if (currentUser) {
          fetchOrders(currentUser.id);
        }

        return orderRecord;
      } else {
        const errObj = await res.json();
        showNotification(errObj.error || 'Failed to dispatch order on API.', 'error');
        return null;
      }
    } catch (err) {
      showNotification('Offline fallback checkout denied. Check server connectivity.', 'error');
      return null;
    }
  };

  // Administrator controls: Products modification
  const handleAddProduct = async (productData: Omit<Product, 'id' | 'rating' | 'createdAt'>): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'admin') return false;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.id
        },
        body: JSON.stringify(productData)
      });

      if (res.ok) {
        showNotification('New Atelier element fabricated.', 'success');
        fetchProducts(); // refresh list
        return true;
      } else {
        const err = await res.json();
        showNotification(err.error || 'Failed to initialize element.', 'error');
        return false;
      }
    } catch {
      showNotification('Server rejected product specifications.', 'error');
      return false;
    }
  };

  const handleEditProduct = async (id: string, partialProduct: Partial<Product>): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'admin') return false;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.id
        },
        body: JSON.stringify(partialProduct)
      });

      if (res.ok) {
        showNotification('Product specifications saved successfully.', 'success');
        fetchProducts();
        return true;
      } else {
        const err = await res.json();
        showNotification(err.error || 'Element editing failed.', 'error');
        return false;
      }
    } catch {
      showNotification('Error writing edits to express server.', 'error');
      return false;
    }
  };

  const handleDeleteProduct = async (id: string): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'admin') return false;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': currentUser.id }
      });

      if (res.ok) {
        showNotification('Atelier element deleted from catalog.', 'success');
        fetchProducts();
        return true;
      } else {
        const err = await res.json();
        showNotification(err.error || 'Failed to remove product from catalog.', 'error');
        return false;
      }
    } catch {
      showNotification('Network writing block. Could not execute deletion.', 'error');
      return false;
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'admin') return false;

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': currentUser.id
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        showNotification(`Order ${orderId} marked as ${status} successfully.`, 'success');
        fetchOrders(currentUser.id); // refresh orders list
        return true;
      } else {
        const err = await res.json();
        showNotification(err.error || 'Could not save status change.', 'error');
        return false;
      }
    } catch {
      showNotification('Status writing operation failed.', 'error');
      return false;
    }
  };

  return (
    <div className="min-h-screen mesh-bg text-slate-100 flex flex-col font-sans selection:bg-indigo-550 selection:text-white" id="atelier-applet-root">
      {/* Absolute alert banner notifications block */}
      {notification && (
        <div 
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-2xl backdrop-blur-xl border text-xs font-semibold flex items-center space-x-2 animate-fade-in ${
            notification.type === 'success' 
              ? 'bg-emerald-900/90 border-emerald-500/30 text-emerald-100' 
              : 'bg-rose-950/90 border-rose-500/30 text-rose-100'
          }`}
          id="system-notification"
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* Navigation Controller */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB ROUTER OUTLET VIEWS */}
        {activeTab === 'catalog' && (
          <ProductCatalog
            products={products}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={(p) => handleAddToCart(p, 1)}
          />
        )}

        {activeTab === 'cart' && (
          <CartView
            cartItems={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onCheckout={handleCheckout}
            onClearCart={handleClearCart}
            onBackToShopping={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'orders' && (
          <OrderHistoryView
            orders={orders}
          />
        )}

        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel
            products={products}
            orders={orders}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}
      </main>

      {/* FOOTER METADATA MARKUP */}
      <footer className="border-t border-white/5 bg-slate-950/40 backdrop-blur-md py-10 mt-16 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left font-sans col-span-2">
            <h5 className="font-bold text-slate-100 flex items-center space-x-1">
              <PackageOpen className="h-4 w-4 text-indigo-400" />
              <span>ZEROCK</span>
            </h5>
            <p className="mt-1 text-[11px] text-slate-400">Precision-engineered workspace artifacts & accessories.</p>
          </div>
          <p className="font-mono text-[10px] text-slate-500">Built on Full-Stack Express • Node Sandbox • 2026</p>
        </div>
      </footer>

      {/* MODALS RENDERINGS */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {isLoginOpen && (
        <LoginModal
          onClose={() => setIsLoginOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
}
