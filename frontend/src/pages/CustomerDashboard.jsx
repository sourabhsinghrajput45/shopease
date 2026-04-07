import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Package, Clock, ChevronRight, TrendingUp, Star } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';

const statusColors = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

function StatCard({ icon: Icon, label, value, to, color }) {
  const content = (
    <div className={`card p-5 flex items-center gap-4 transition-all ${to ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-stone-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-stone-900 leading-tight">{value}</p>
      </div>
      {to && <ChevronRight className="w-4 h-4 text-stone-300" />}
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { items: recentItems } = useRecentlyViewed();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const active = orders.filter(o => ['pending','processing','shipped'].includes(o.status)).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-stone-400 text-sm mt-1">Here's what's going on with your account</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard icon={Package}    label="Total Orders"  value={loading ? '—' : orders.length}  to="/orders"    color="bg-blue-50 text-blue-600" />
        <StatCard icon={TrendingUp} label="Total Spent"   value={loading ? '—' : `₹${Math.round(totalSpent/100)*100 > 0 ? (totalSpent).toLocaleString('en-IN') : 0}`} color="bg-green-50 text-green-600" />
        <StatCard icon={ShoppingBag} label="Active Orders" value={loading ? '—' : active}        to="/orders"    color="bg-amber-50 text-amber-600" />
        <StatCard icon={Heart}      label="Wishlist"      value={wishlistItems.length}            to="/wishlist"  color="bg-red-50 text-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">See all →</Link>
          </div>

          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="card p-4 skeleton h-16" />)}</div>
          ) : orders.length === 0 ? (
            <div className="card p-8 text-center">
              <Package className="w-10 h-10 mx-auto text-stone-300 mb-3" />
              <p className="text-stone-500 font-medium text-sm">No orders yet</p>
              <Link to="/products" className="btn-primary mt-4 text-sm inline-block">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map(order => (
                <Link key={order.id} to={`/orders/${order.id}`}
                  className="card p-4 flex items-center gap-3 hover:shadow-md transition-all group">
                  <div className="flex -space-x-1.5 flex-shrink-0">
                    {(order.items || []).slice(0, 2).map((item, i) => (
                      <img key={i}
                        src={item.product_image || `https://picsum.photos/seed/${item.product_id}/60/60`}
                        alt="" className="w-9 h-9 rounded-lg border-2 border-white object-cover bg-stone-100"
                        onError={e => { e.target.src = `https://picsum.photos/seed/${(item.product_id||0)+3}/60/60`; }} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-stone-700">Order #{order.id}</span>
                      <span className={`badge text-xs ${statusColors[order.status]}`}>{order.status}</span>
                    </div>
                    <p className="text-xs text-stone-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-stone-900">₹{Number(order.total).toLocaleString('en-IN')}</p>
                    <span className="text-xs text-stone-300 group-hover:text-stone-500 transition-colors">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Wishlist preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-stone-800">Wishlist</h2>
              <Link to="/wishlist" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">See all →</Link>
            </div>
            {wishlistItems.length === 0 ? (
              <div className="card p-5 text-center">
                <Heart className="w-8 h-8 mx-auto text-stone-200 mb-2" />
                <p className="text-xs text-stone-400">Nothing saved yet</p>
                <Link to="/products" className="text-xs text-stone-600 underline mt-1 block">Browse products</Link>
              </div>
            ) : (
              <div className="card overflow-hidden">
                {wishlistItems.slice(0, 3).map((item, i) => (
                  <Link key={item.id} to={`/products/${item.id}`}
                    className={`flex items-center gap-3 p-3.5 hover:bg-stone-50 transition-colors ${i > 0 ? 'border-t border-stone-100' : ''}`}>
                    <img src={item.image_url || `https://picsum.photos/seed/${item.id}/60/60`}
                      alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                      onError={e => { e.target.src = `https://picsum.photos/seed/${item.id+3}/60/60`; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-700 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-stone-400">₹{Number(item.price).toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
                {wishlistItems.length > 3 && (
                  <Link to="/wishlist" className="block px-3.5 py-2.5 text-xs text-stone-400 hover:text-stone-700 text-center border-t border-stone-100 transition-colors">
                    +{wishlistItems.length - 3} more items →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Recently viewed preview */}
          {recentItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-stone-400" />
                <h2 className="font-semibold text-stone-800">Recently Viewed</h2>
              </div>
              <div className="card overflow-hidden">
                {recentItems.slice(0, 3).map((item, i) => (
                  <Link key={item.id} to={`/products/${item.id}`}
                    className={`flex items-center gap-3 p-3.5 hover:bg-stone-50 transition-colors ${i > 0 ? 'border-t border-stone-100' : ''}`}>
                    <img src={item.image_url || `https://picsum.photos/seed/${item.id}/60/60`}
                      alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                      onError={e => { e.target.src = `https://picsum.photos/seed/${item.id+3}/60/60`; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-700 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-stone-400">₹{Number(item.price).toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Account info */}
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-stone-800 mb-3">Account</h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-700 text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800">{user?.name}</p>
                <p className="text-xs text-stone-400">{user?.email}</p>
              </div>
            </div>
            <div className="text-xs text-stone-400 border-t border-stone-100 pt-3">
              Customer since {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                : 'recently'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
