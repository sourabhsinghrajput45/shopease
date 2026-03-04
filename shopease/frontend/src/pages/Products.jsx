import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

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
        setProducts(r.data.products);
        setTotalPages(r.data.totalPages);
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

  const sortOptions = [
    { value: '', label: 'Relevance' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Best Rated' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-800">
          {search ? `Search: "${search}"` : category ? categories.find(c => c.slug === category)?.name || 'Products' : 'All Products'}
        </h1>
        {(search || category) && (
          <button onClick={() => setSearchParams({})} className="text-sm text-stone-400 hover:text-stone-600 mt-1 transition-colors">
            ← Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar */}
        <aside className="sm:w-48 flex-shrink-0">
          <div className="card p-4 sticky top-24">
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Categories</h3>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => setParam('category', '')}
                  className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${!category ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                >
                  All
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => setParam('category', cat.slug)}
                    className={`w-full text-left text-sm px-2.5 py-1.5 rounded-lg transition-colors ${category === cat.slug ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-stone-500">
              {loading ? '…' : `${products.length} products`}
            </span>
            <select
              value={sort}
              onChange={e => setParam('sort', e.target.value)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-stone-800"
            >
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton aspect-square" />
                  <div className="p-3.5 space-y-2">
                    <div className="skeleton h-3 w-1/3 rounded" />
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-5 w-1/4 rounded mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">No products found</p>
              <p className="text-sm mt-1">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setParam('page', String(page - 1))}
                disabled={page <= 1}
                className="btn-secondary py-2 px-4 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="flex items-center px-4 text-sm text-stone-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setParam('page', String(page + 1))}
                disabled={page >= totalPages}
                className="btn-secondary py-2 px-4 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
