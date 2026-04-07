import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ShoppingBag } from 'lucide-react';
import api from '../api';
import ProductCard from '../components/ProductCard';
import {
  Laptop,
  Shirt,
  BookOpen,
  Home,
  Dumbbell,
  Sparkles,
  Package,
} from 'lucide-react';


function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-3.5 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-5 w-1/4 rounded mt-2" />
      </div>
    </div>
  );
}

const categoryIcons = {
  electronics: Laptop,
  clothing: Shirt,
  books: BookOpen,
  'home-kitchen': Home,
  sports: Dumbbell,
  beauty: Sparkles,
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [priceFilter, setPriceFilter] = useState(10000);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    api.get('/products/categories').then(r => setCategories(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (category) params.category = category;
    if (search) params.search = search;
    if (sort) params.sort = sort;

    api.get('/products', { params })
      .then(r => {
        const all = r.data.products;
        setProducts(all);
        setTotal(r.data.total);
        setTotalPages(r.data.totalPages);
        if (all.length) {
          const max = Math.max(...all.map(p => parseFloat(p.price)));
          setMaxPrice(Math.ceil(max / 500) * 500);
          setPriceFilter(v => Math.max(v, Math.ceil(max / 500) * 500));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, search, sort, page]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const filteredProducts = products.filter(p => parseFloat(p.price) <= priceFilter);
  const activeFilters = [category, search].filter(Boolean).length;

  const sortOptions = [
    { value: '', label: 'Relevance' },
    { value: 'newest', label: 'Newest first' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'rating', label: 'Best rated' },
  ];

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">Category</h3>
        <ul className="space-y-0.5">
          <li>
            <button onClick={() => setParam('category', '')}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center justify-between
                ${!category ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>
              All Products
            </button>
          </li>
          {categories.map(cat => {
            const Icon = categoryIcons[cat.slug] || Package;

            return (
              <li key={cat.id}>
                <button
                  onClick={() => setParam('category', cat.slug)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2
          ${category === cat.slug
                      ? 'bg-stone-800 text-white'
                      : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Max Price</h3>
          <span className="text-sm font-semibold text-stone-800">₹{priceFilter.toLocaleString('en-IN')}</span>
        </div>
        <input type="range" min={0} max={maxPrice} step={100}
          value={priceFilter} onChange={e => setPriceFilter(Number(e.target.value))}
          className="w-full accent-stone-800" style={{ accentColor: '#292524' }} />
        <div className="flex justify-between text-xs text-stone-400 mt-1">
          <span>₹0</span><span>₹{maxPrice.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {(category || search) && (
        <button onClick={() => { setSearchParams({}); }}
          className="w-full text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
          <X className="w-3.5 h-3.5" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">
            {search ? `"${search}"` : category ? categories.find(c => c.slug === category)?.name || 'Products' : 'All Products'}
          </h1>
          {!loading && <p className="text-sm text-stone-400 mt-0.5">{total} product{total !== 1 ? 's' : ''} found</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile filter toggle */}
          <button onClick={() => setSidebarOpen(true)}
            className="md:hidden flex items-center gap-2 btn-secondary py-2 px-3 text-sm relative">
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {activeFilters > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-stone-800 text-white text-xs rounded-full flex items-center justify-center">{activeFilters}</span>}
          </button>
          {/* Sort */}
          <div className="relative">
            <select value={sort} onChange={e => setParam('sort', e.target.value)}
              className="text-sm border border-stone-200 rounded-lg pl-3 pr-8 py-2 text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-stone-800 appearance-none cursor-pointer">
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {(category || search) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {search && (
            <span className="flex items-center gap-1.5 bg-stone-100 text-stone-700 text-xs px-3 py-1.5 rounded-full font-medium">
              Search: "{search}"
              <button onClick={() => setParam('search', '')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
            </span>
          )}
          {category && (
            <span className="flex items-center gap-1.5 bg-stone-100 text-stone-700 text-xs px-3 py-1.5 rounded-full font-medium">
              {categories.find(c => c.slug === category)?.name}
              <button onClick={() => setParam('category', '')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <div className="card p-4 sticky top-24"><SidebarContent /></div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
            <div className="relative bg-white w-72 h-full ml-auto shadow-xl p-5 overflow-y-auto animate-slide-down">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-stone-800">Filters</h2>
                <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-stone-500" /></button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <p className="font-medium text-stone-600">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search</p>
              <button onClick={() => { setSearchParams({}); setPriceFilter(maxPrice); }}
                className="btn-primary mt-4 text-sm">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button onClick={() => setParam('page', String(page - 1))} disabled={page <= 1}
                className="btn-secondary py-2 px-4 disabled:opacity-40">← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
                <button key={p} onClick={() => setParam('page', String(p))}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-stone-800 text-white' : 'border border-stone-200 text-stone-600 hover:bg-stone-100'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setParam('page', String(page + 1))} disabled={page >= totalPages}
                className="btn-secondary py-2 px-4 disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
