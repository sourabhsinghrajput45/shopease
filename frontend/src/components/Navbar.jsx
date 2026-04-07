import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag, Heart, LayoutDashboard, ClipboardList,
  LogOut, User, Search, ChevronDown, Store,
  Laptop, Shirt, BookOpen, UtensilsCrossed, Dumbbell, Sparkles, Baby, Apple, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const categoryLinks = [
  { name: 'Electronics', slug: 'electronics', icon: Laptop },
  { name: 'Clothing',    slug: 'clothing',    icon: Shirt },
  { name: 'Books',       slug: 'books',       icon: BookOpen },
  { name: 'Home & Kitchen', slug: 'home-kitchen', icon: UtensilsCrossed },
  { name: 'Sports',      slug: 'sports',      icon: Dumbbell },
  { name: 'Beauty',      slug: 'beauty',      icon: Sparkles },
];

export default function Navbar() {
  const { user, logout, isLoggedIn, isSeller } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [userMenu, setUserMenu] = useState(false);
  const [catMenu, setCatMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userRef = useRef(null);
  const catRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenu(false);
      if (catRef.current && !catRef.current.contains(e.target)) setCatMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); setUserMenu(false); }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/products?search=${encodeURIComponent(search.trim())}`); setSearch(''); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
      {/* Main bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
            <div className="w-7 h-7 bg-stone-800 rounded-md flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-stone-900 text-lg tracking-tight">ShopEase</span>
          </Link>

          {/* Category dropdown — desktop */}
          {!isSeller && (
            <div className="hidden md:block relative" ref={catRef}>
              <button
                onClick={() => setCatMenu(v => !v)}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors
                  ${catMenu ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'}`}
              >
                Categories <ChevronDown className={`w-3.5 h-3.5 transition-transform ${catMenu ? 'rotate-180' : ''}`} />
              </button>
              {catMenu && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-stone-200 rounded-xl shadow-lg py-1.5 animate-slide-down">
                  {categoryLinks.map(cat => (
                    <Link key={cat.slug} to={`/products?category=${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                      <cat.icon className="w-4 h-4 text-stone-400" />
                      {cat.name}
                    </Link>
                  ))}
                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <Link to="/products" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50">
                      <Package className="w-4 h-4 text-stone-400" /> All Products
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full border border-stone-200 rounded-lg pl-9 pr-4 py-2 text-sm bg-stone-50
                           focus:outline-none focus:ring-2 focus:ring-stone-800 focus:bg-white focus:border-transparent transition-all" />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">

            {/* Wishlist — customers only */}
            {(!isSeller) && (
              <Link to="/wishlist" title="Wishlist"
                className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-600 hover:text-stone-900">
                <Heart className="w-5 h-5" />
                {wishCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-medium">
                    {wishCount > 9 ? '9+' : wishCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart — customers only */}
            {!isSeller && (
              <Link to="/cart" title="Cart"
                className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors text-stone-600 hover:text-stone-900">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-stone-800 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-medium">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth */}
            {isLoggedIn ? (
              <div className="relative" ref={userRef}>
                <button onClick={() => setUserMenu(v => !v)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors ml-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${isSeller ? 'bg-amber-100 text-amber-700' : 'bg-stone-200 text-stone-700'}`}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm text-stone-700 font-medium max-w-[80px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-stone-400 transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-1 w-52 bg-white border border-stone-200 rounded-xl shadow-lg py-1.5 animate-slide-down">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-sm font-semibold text-stone-800 truncate">{user.name}</p>
                      <p className="text-xs text-stone-400 truncate">{user.email}</p>
                      {isSeller && <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Seller Account</span>}
                    </div>
                    {isSeller ? (
                      <>
                        <Link to="/seller" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                          <LayoutDashboard className="w-4 h-4 text-stone-400" /> Dashboard
                        </Link>
                        <Link to="/seller/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                          <ClipboardList className="w-4 h-4 text-stone-400" /> Orders Received
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/account" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                          <User className="w-4 h-4 text-stone-400" /> My Account
                        </Link>
                        <Link to="/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                          <ClipboardList className="w-4 h-4 text-stone-400" /> My Orders
                        </Link>
                        <Link to="/wishlist" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">
                          <Heart className="w-4 h-4 text-stone-400" /> Wishlist {wishCount > 0 && <span className="ml-auto text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full">{wishCount}</span>}
                        </Link>
                      </>
                    )}
                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link to="/login" className="hidden sm:block text-sm text-stone-600 hover:text-stone-900 font-medium px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors">Sign In</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Join</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(v => !v)} className="sm:hidden p-2 rounded-lg hover:bg-stone-100 ml-1">
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 bg-stone-700 transition-all ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 bg-stone-700 transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-stone-700 transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full border border-stone-200 rounded-lg pl-9 pr-4 py-2 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-800 focus:bg-white transition-all" />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-stone-100 bg-white animate-slide-down">
          <div className="px-4 py-3 space-y-0.5">
            {!isSeller && categoryLinks.map(cat => (
              <Link key={cat.slug} to={`/products?category=${cat.slug}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900">
                <cat.icon className="w-4 h-4 text-stone-400" /> {cat.name}
              </Link>
            ))}
            {!isLoggedIn && (
              <div className="flex gap-2 pt-2 border-t border-stone-100 mt-2">
                <Link to="/login" className="btn-secondary flex-1 text-center py-2">Sign In</Link>
                <Link to="/register" className="btn-primary flex-1 text-center py-2">Join</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
