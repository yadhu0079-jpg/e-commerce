import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Flame, Star, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/currency';

interface ProductCatalogProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductCatalog({
  products,
  onSelectProduct,
  onAddToCart
}: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Categories extraction
  const categories = useMemo(() => {
    const list = ['All'];
    products.forEach(p => {
      if (!list.includes(p.category)) {
        list.push(p.category);
      }
    });
    return list;
  }, [products]);

  // Filtering + Sorting
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sorting
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Discover Atelier</h2>
          <p className="text-sm text-slate-400">Curated, precision-engineered products for high-craft living spaces.</p>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="catalog-search"
            type="text"
            placeholder="Search our catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl glass-input py-2.5 pr-4 pl-9 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Control Buttons (Categories & Sorting) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pill Buttons */}
        <div className="flex flex-wrap gap-2" id="catalog-categories">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                selectedCategory === cat
                  ? 'bg-indigo-600/35 border-indigo-500/30 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  : 'bg-white/5 border-white/10 text-slate-355 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Select Dropdown */}
        <div className="flex items-center space-x-2 self-end">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          <select
            id="catalog-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/60 text-slate-300 py-2 pl-3 pr-8 text-xs font-semibold outline-none hover:border-white/20 hover:text-white focus:border-indigo-500/50"
          >
            <option value="featured" className="bg-slate-950 text-slate-300">Featured Collection</option>
            <option value="price-asc" className="bg-slate-950 text-slate-300">Price: Low to High</option>
            <option value="price-desc" className="bg-slate-950 text-slate-300">Price: High to Low</option>
            <option value="rating" className="bg-slate-950 text-slate-300">Top Rated</option>
            <option value="newest" className="bg-slate-950 text-slate-300">New Additions</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl glass-card">
          <SlidersHorizontal className="h-8 w-8 text-slate-500 mb-3" />
          <h3 className="font-semibold text-white text-sm">No corresponding products found</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">Try tweaking your search parameters or selecting an alternative product category.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSortBy('featured'); }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedProducts.map(product => (
            <div 
              key={product.id} 
              className="group relative flex flex-col overflow-hidden rounded-2xl glass-card transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_12px_40px_-5px_rgba(0,0,0,0.5)]"
              id={`product-card-${product.id}`}
            >
              {/* Product Thumbnail with hover icons */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-950/30">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Low Stock Badge */}
                {product.stock <= 0 ? (
                  <div className="absolute top-3 left-3 rounded-md bg-red-650/90 text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                    Sold Out
                  </div>
                ) : product.stock <= 5 ? (
                  <div className="absolute top-3 left-3 rounded-md bg-amber-500/90 text-slate-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                    <Flame className="h-3 w-3 fill-slate-955" />
                    <span>Low Stock: {product.stock}</span>
                  </div>
                ) : null}

                {/* Cover Overlay Action Hover */}
                <div className="absolute inset-0 flex items-center justify-center space-x-3 bg-slate-950/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 border border-white/10 text-white shadow-md hover:bg-slate-800 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  {product.stock > 0 && (
                    <button
                      onClick={() => onAddToCart(product)}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 border border-indigo-500/30 text-white shadow-md hover:bg-indigo-500 transition-colors"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {product.category}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-500">
                    <Star className="h-3 w-3 fill-amber-500" />
                    <span className="text-xs font-semibold text-slate-300">{product.rating.toFixed(1)}</span>
                  </div>
                </div>

                <h3 className="mt-2 text-sm font-semibold text-slate-100 group-hover:text-white line-clamp-1">
                  <button onClick={() => onSelectProduct(product)} className="text-left outline-none cursor-pointer hover:text-indigo-300 transition-colors">
                    {product.name}
                  </button>
                </h3>
                
                <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1">
                  {product.description}
                </p>

                <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-sm font-bold text-slate-100">{formatPrice(product.price)}</span>
                  {product.stock > 0 ? (
                    <button
                      id={`add-to-cart-quick-${product.id}`}
                      onClick={() => onAddToCart(product)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 hover:underline cursor-pointer"
                    >
                      <span>Add to Cart</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">Temporarily Out of Stock</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
