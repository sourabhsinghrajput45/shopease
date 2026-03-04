import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck, RefreshCw, ShieldCheck, Star,
  Laptop, Shirt, BookOpen, Home as HomeIcon,
  Dumbbell, Sparkles, Baby, Apple, ShoppingBag,
  Cpu, UtensilsCrossed
} from 'lucide-react';
import api from '../api';
import ProductCard from '../components/ProductCard';

function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-3.5 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-5 w-1/4 rounded mt-3" />
      </div>
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/products/featured'),
      api.get('/products/categories')
    ]).then(([featRes, catRes]) => {
      setFeatured(featRes.data);
      setCategories(catRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categoryIcons = {
    electronics: Laptop,
    clothing: Shirt,
    books: BookOpen,
    'home-kitchen': UtensilsCrossed,
    sports: Dumbbell,
    beauty: Sparkles,
    toys: Baby,
    food: Apple,
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-stone-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="max-w-lg">
            <p className="text-stone-400 text-sm font-medium mb-2 tracking-wide uppercase">Welcome to ShopEase</p>
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight mb-4">
              Everything you need, nothing you don't.
            </h1>
            <p className="text-stone-400 text-base mb-7 leading-relaxed">
              Clean, simple shopping. Browse thousands of products with honest prices and fast delivery.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="bg-white text-stone-800 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-100 transition-colors">
                Browse All Products
              </Link>
              <Link to="/products?sort=newest" className="border border-stone-600 text-stone-300 px-6 py-2.5 rounded-lg text-sm font-medium hover:border-stone-400 transition-colors">
                What's New
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap justify-center sm:justify-between gap-4 text-sm text-stone-500">
            {[
              { icon: Truck,        text: 'Free delivery over ₹999' },
              { icon: RefreshCw,    text: 'Easy 30-day returns' },
              { icon: ShieldCheck,  text: 'Secure checkout' },
              { icon: Star,         text: 'Verified reviews' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span className="font-medium text-stone-600">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-stone-800 mb-5">Shop by Category</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all group"
                >
                  {(() => { const Icon = categoryIcons[cat.slug] || ShoppingBag; return <Icon className="w-5 h-5 text-stone-500 group-hover:text-stone-700 transition-colors" />; })()}
                  <span className="text-xs text-stone-600 font-medium text-center leading-tight group-hover:text-stone-900 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Featured */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-stone-800">Featured Products</h2>
            <Link to="/products" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.map(product => <ProductCard key={product.id} product={product} />)
            }
          </div>
          {!loading && featured.length === 0 && (
            <div className="text-center py-12 text-stone-400">
              <p>No featured products yet.</p>
              <Link to="/products" className="text-stone-600 underline mt-2 block text-sm">Browse all products</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
