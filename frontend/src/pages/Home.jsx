import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck, RefreshCw, ShieldCheck, Star,
  Laptop, Shirt, BookOpen, UtensilsCrossed, Dumbbell, Sparkles, Baby, Apple, ShoppingBag,
  ArrowRight, Clock
} from 'lucide-react';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-3.5 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-5 w-1/4 rounded mt-2" />
      </div>
    </div>
  );
}

const categoryConfig = [
  { name: 'Electronics', slug: 'electronics', icon: Laptop,         color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { name: 'Clothing',    slug: 'clothing',    icon: Shirt,          color: 'bg-violet-50 text-violet-600 border-violet-100' },
  { name: 'Books',       slug: 'books',       icon: BookOpen,       color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', icon: UtensilsCrossed, color: 'bg-green-50 text-green-600 border-green-100' },
  { name: 'Sports',      slug: 'sports',      icon: Dumbbell,       color: 'bg-red-50 text-red-600 border-red-100' },
  { name: 'Beauty',      slug: 'beauty',      icon: Sparkles,       color: 'bg-pink-50 text-pink-600 border-pink-100' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const { items: recentItems } = useRecentlyViewed();

  useEffect(() => {
    api.get('/products/featured')
      .then(r => setFeatured(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-stone-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
          <div className="max-w-xl">
            <span className="inline-block bg-stone-700 text-stone-300 text-xs font-medium px-3 py-1 rounded-full mb-4 tracking-wide">
              Simple · Honest · Fast
            </span>
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight mb-5 tracking-tight">
              Everything you need,<br />
              <span className="text-stone-400">nothing you don't.</span>
            </h1>
            <p className="text-stone-400 text-base mb-8 leading-relaxed max-w-md">
              Browse thousands of products with transparent pricing, real reviews, and genuine price history — so you always know you're getting a fair deal.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="bg-white text-stone-900 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-100 transition-colors flex items-center gap-2">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/products?sort=newest" className="border border-stone-600 text-stone-300 px-6 py-2.5 rounded-lg text-sm font-medium hover:border-stone-400 hover:text-white transition-colors">
                What's New
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-wrap justify-center sm:justify-between gap-4">
            {[
              { icon: Truck, text: 'Free delivery over ₹999' },
              { icon: RefreshCw, text: 'Easy 30-day returns' },
              { icon: ShieldCheck, text: 'Secure checkout' },
              { icon: Star, text: 'Verified reviews' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-stone-500">
                <item.icon className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-14">

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-stone-800">Shop by Category</h2>
            <Link to="/products" className="text-sm text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1">
              All products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categoryConfig.map(cat => (
              <Link key={cat.slug} to={`/products?category=${cat.slug}`}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group ${cat.color}`}>
                <cat.icon className="w-6 h-6" />
                <span className="text-xs font-semibold text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-stone-800">Featured Products</h2>
              <p className="text-sm text-stone-400 mt-0.5">Hand-picked by our sellers</p>
            </div>
            <Link to="/products" className="text-sm text-stone-500 hover:text-stone-800 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
          {!loading && featured.length === 0 && (
            <div className="text-center py-12 text-stone-400">
              <p>No featured products yet.</p>
              <Link to="/products" className="text-stone-600 underline mt-2 block text-sm">Browse all products</Link>
            </div>
          )}
        </section>

        {/* Recently Viewed */}
        {recentItems.length > 1 && (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-4 h-4 text-stone-400" />
              <h2 className="text-lg font-semibold text-stone-800">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentItems.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Bottom CTA banner */}
        <section className="rounded-2xl bg-stone-800 text-white px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">Want to sell on ShopEase?</h3>
            <p className="text-stone-400 text-sm">List your products in minutes. Reach thousands of buyers instantly.</p>
          </div>
          <Link to="/register" className="flex-shrink-0 bg-white text-stone-900 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-100 transition-colors whitespace-nowrap">
            Start Selling →
          </Link>
        </section>
      </div>
    </div>
  );
}
