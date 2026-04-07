import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package, ShoppingBag, TrendingUp, AlertTriangle,
  Plus, Pencil, Trash2, X, BarChart2, ClipboardList,
  ArrowUpRight, ArrowDownRight, Minus as MinusIcon,
  Star, Store, ShoppingCart, Award, MessageSquare,
  Layers, Clock, CheckCircle, XCircle, Truck
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ─── Chart: Revenue bar chart ────────────────────────────────────────────────
function RevenueBarChart({ data }) {
  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center justify-center h-32 text-stone-400 gap-2">
      <BarChart2 className="w-8 h-8 text-stone-300" />
      <p className="text-sm">No orders yet in the last 30 days</p>
    </div>
  );
  const CHART_H = 112; // px — matches h-28
  const max = Math.max(...data.map(d => parseFloat(d.revenue)));
  return (
    <div className="flex items-end gap-0.5 w-full" style={{ height: CHART_H }}>
      {data.map((d, i) => {
        const barH = max > 0 ? Math.max((parseFloat(d.revenue) / max) * CHART_H, 4) : 4;
        const isWeekend = [0,6].includes(new Date(d.date).getDay());
        return (
          <div key={i} className="flex-1 group relative">
            <div className={`rounded-t-sm transition-colors ${isWeekend ? 'bg-stone-400 group-hover:bg-stone-500' : 'bg-stone-800 group-hover:bg-stone-600'}`}
              style={{ height: barH }} />
            <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-xs px-2.5 py-1.5 rounded-lg
                            whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
              <p className="font-medium">{new Date(d.date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' })}</p>
              <p className="text-stone-300">₹{Number(d.revenue).toLocaleString('en-IN')} · {d.order_count} order{d.order_count!=1?'s':''}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Chart: Category donut (pure SVG) ─────────────────────────────────────
function CategoryDonut({ data }) {
  if (!data || data.length === 0 || data.every(d => d.revenue == 0)) return (
    <div className="flex items-center justify-center h-28 text-sm text-stone-400">No category data yet</div>
  );
  const total = data.reduce((s, d) => s + parseFloat(d.revenue), 0);
  const colors = ['#292524','#57534e','#a8a29e','#d6d3d1','#e7e5e4','#78716c'];
  const r = 40; const cx = 50; const cy = 50;
  let angle = -Math.PI / 2;
  const slices = data.filter(d => d.revenue > 0).map((d, i) => {
    const frac = parseFloat(d.revenue) / total;
    const start = angle;
    angle += frac * 2 * Math.PI;
    const x1 = cx + r * Math.cos(start); const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(angle); const y2 = cy + r * Math.sin(angle);
    const large = frac > 0.5 ? 1 : 0;
    return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, color: colors[i % colors.length], name: d.category, frac, revenue: d.revenue };
  });
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
        {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} className="hover:opacity-80 transition-opacity cursor-pointer"><title>{s.name}: ₹{Number(s.revenue).toLocaleString('en-IN')}</title></path>)}
        <circle cx="50" cy="50" r="22" fill="white" />
        <text x="50" y="47" textAnchor="middle" className="text-xs" style={{fontSize:'8px',fill:'#78716c'}}>Total</text>
        <text x="50" y="57" textAnchor="middle" style={{fontSize:'7px',fontWeight:'bold',fill:'#1c1917'}}>₹{total > 999 ? (total/1000).toFixed(1)+'k' : Math.round(total)}</text>
      </svg>
      <div className="flex-1 space-y-1.5 min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-stone-600 truncate flex-1">{s.name}</span>
            <span className="text-xs font-semibold text-stone-800">{(s.frac*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chart: Order status donut ────────────────────────────────────────────
function StatusDonut({ data }) {
  const statusConfig = {
    pending:    { color: '#f59e0b', label: 'Pending' },
    processing: { color: '#3b82f6', label: 'Processing' },
    shipped:    { color: '#6366f1', label: 'Shipped' },
    delivered:  { color: '#22c55e', label: 'Delivered' },
    cancelled:  { color: '#ef4444', label: 'Cancelled' },
  };
  if (!data || data.length === 0) return (
    <div className="flex items-center justify-center h-20 text-sm text-stone-400">No orders yet</div>
  );
  const total = data.reduce((s, d) => s + parseInt(d.count), 0);
  return (
    <div className="space-y-2">
      {data.map(d => {
        const cfg = statusConfig[d.status] || { color: '#a8a29e', label: d.status };
        const pct = total > 0 ? (parseInt(d.count) / total) * 100 : 0;
        return (
          <div key={d.status} className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
            <span className="text-xs text-stone-600 flex-1">{cfg.label}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cfg.color }} />
              </div>
              <span className="text-xs font-semibold text-stone-700 w-5 text-right">{d.count}</span>
            </div>
          </div>
        );
      })}
      <p className="text-xs text-stone-400 pt-1">{total} total orders</p>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  const colorMap = {
    stone: 'bg-stone-100 text-stone-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    blue:  'bg-blue-100 text-blue-700',
    red:   'bg-red-100 text-red-600',
    violet:'bg-violet-100 text-violet-700',
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.stone}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full
            ${trend > 0 ? 'bg-green-50 text-green-600' : trend < 0 ? 'bg-red-50 text-red-500' : 'bg-stone-100 text-stone-400'}`}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : <MinusIcon className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-stone-900 leading-tight">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5 font-medium">{label}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Star display ─────────────────────────────────────────────────────────
function Stars({ rating, size = 'sm' }) {
  const r = parseFloat(rating) || 0;
  const w = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`${w} ${i <= Math.round(r) ? 'text-amber-400' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────
function ProductForm({ product, categories, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: product?.name || '', description: product?.description || '',
    price: product?.price || '', stock: product?.stock || '',
    image_url: product?.image_url || '', category_id: product?.category_id || '',
    is_featured: product?.is_featured || 0,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (product?.id) { await api.put(`/seller/products/${product.id}`, form); toast.success('Product updated'); }
      else { await api.post('/seller/products', form); toast.success('Product listed!'); }
      onSave();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-stone-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-semibold text-stone-800">{product?.id ? 'Edit Product' : 'List New Product'}</h2>
          <button onClick={onCancel} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {form.image_url && (
            <div className="w-full h-36 rounded-xl overflow-hidden bg-stone-100">
              <img src={form.image_url} alt="" className="w-full h-full object-cover"
                onError={e => { e.target.style.display='none'; }} />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-1.5">Product Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Wireless Earbuds Pro" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-1.5">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description}
              onChange={e => set('description', e.target.value)} placeholder="Describe your product…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1.5">Price (₹) *</label>
              <input type="number" className="input" value={form.price}
                onChange={e => set('price', e.target.value)} placeholder="999" min="0" step="0.01" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600 block mb-1.5">Stock *</label>
              <input type="number" className="input" value={form.stock}
                onChange={e => set('stock', e.target.value)} placeholder="50" min="0" required />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-1.5">Category *</label>
            <select className="input" value={form.category_id}
              onChange={e => set('category_id', e.target.value)} required>
              <option value="">Select a category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 block mb-1.5">Image URL</label>
            <input className="input" value={form.image_url}
              onChange={e => set('image_url', e.target.value)} placeholder="https://…" />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-amber-50 rounded-xl border border-amber-100">
            <input type="checkbox" checked={!!form.is_featured} onChange={e => set('is_featured', e.target.checked ? 1 : 0)}
              className="w-4 h-4 rounded accent-stone-800" />
            <div>
              <span className="text-sm font-medium text-stone-700 block">Feature on homepage</span>
              <span className="text-xs text-stone-400">Appears in the Featured Products section</span>
            </div>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : product?.id ? 'Save Changes' : 'List Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────
const statusColors = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};

// ─── Main Dashboard ───────────────────────────────────────────────────────
export default function SellerDashboard() {
  const { user, isSeller } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!isSeller) { navigate('/'); return; }
    loadAll();
  }, [isSeller]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, catsRes, analyticsRes] = await Promise.all([
        api.get('/seller/stats'),
        api.get('/products/categories'),
        api.get('/seller/analytics')
      ]);
      setStats(statsRes.data);
      setCategories(catsRes.data);
      setAnalytics(analyticsRes.data);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'products' && products.length === 0)
      api.get('/seller/products').then(r => setProducts(r.data)).catch(() => {});
    if (tab === 'orders' && orders.length === 0)
      api.get('/seller/orders').then(r => setOrders(r.data)).catch(() => {});
  }, [tab]);

  const handleDelete = async (id) => {
    if (!confirm('Remove this product?')) return;
    try {
      await api.delete(`/seller/products/${id}`);
      toast.success('Product removed');
      setProducts(p => p.filter(x => x.id !== id));
      loadAll();
    } catch { toast.error('Failed to remove'); }
  };

  const revenueTrend = analytics ? (() => {
    const t = parseFloat(analytics.thisMonth);
    const l = parseFloat(analytics.lastMonth);
    if (l === 0) return t > 0 ? 100 : 0;
    return Math.round(((t - l) / l) * 100);
  })() : 0;

  const ordersTrend = analytics ? (() => {
    const t = parseInt(analytics.thisMonthOrders || 0);
    const l = parseInt(analytics.lastMonthOrders || 0);
    if (l === 0) return t > 0 ? 100 : 0;
    return Math.round(((t - l) / l) * 100);
  })() : 0;

  const tabs = [
    { id: 'overview',  label: 'Overview',  icon: BarChart2 },
    { id: 'products',  label: 'Products',  icon: Package },
    { id: 'orders',    label: 'Orders',    icon: ClipboardList },
    { id: 'reviews',   label: 'Reviews',   icon: MessageSquare },
  ];

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="card p-5 skeleton h-28" />)}
      </div>
      <div className="card p-6 skeleton h-52" />
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-6 skeleton h-40" />
        <div className="card p-6 skeleton h-40" />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">

      {/* Product form modal */}
      {(showForm || editProduct) && (
        <ProductForm product={editProduct} categories={categories}
          onSave={() => {
            setShowForm(false); setEditProduct(null);
            api.get('/seller/products').then(r => setProducts(r.data));
            loadAll();
          }}
          onCancel={() => { setShowForm(false); setEditProduct(null); }} />
      )}

      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-amber-700" />
            </div>
            <h1 className="text-xl font-semibold text-stone-800">Seller Dashboard</h1>
          </div>
          <p className="text-sm text-stone-400 ml-10">Welcome back, {user?.name?.split(' ')[0]}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditProduct(null); }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Product
        </button>
      </div>

      {/* KPI stat row */}
      {stats && analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={Package} label="Active Listings" value={stats.total_products} color="stone"
            sub={`${stats.low_stock} low stock`} />
          <StatCard icon={TrendingUp} label="Total Revenue"
            value={`₹${Number(stats.total_revenue).toLocaleString('en-IN')}`}
            color="green" trend={revenueTrend} sub="vs last month" />
          <StatCard icon={ShoppingCart} label="Orders Received" value={stats.total_orders}
            color="blue" trend={ordersTrend} sub="vs last month" />
          <StatCard icon={Award} label="Avg Rating"
            value={parseFloat(analytics.avgRating) > 0 ? parseFloat(analytics.avgRating).toFixed(1) : '—'}
            color="amber"
            sub={analytics.totalReviews > 0 ? `${analytics.totalReviews} reviews` : 'No reviews yet'} />
        </div>
      )}

      {/* Second KPI row */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-stone-900">
                ₹{Number(analytics.avgOrderValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-stone-500">Avg order value</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-stone-900">
                ₹{Number(analytics.thisMonth).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-stone-500">This month's revenue</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
              ${stats.low_stock > 0 ? 'bg-red-100' : 'bg-stone-100'}`}>
              <AlertTriangle className={`w-4 h-4 ${stats.low_stock > 0 ? 'text-red-600' : 'text-stone-500'}`} />
            </div>
            <div>
              <p className={`text-lg font-bold ${stats.low_stock > 0 ? 'text-red-600' : 'text-stone-900'}`}>
                {stats.low_stock}
              </p>
              <p className="text-xs text-stone-500">
                {stats.low_stock > 0 ? 'Items need restocking' : 'All items stocked'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-6 gap-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors
              ${tab === t.id
                ? 'border-stone-800 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-700 hover:border-stone-300'}`}>
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.slice(0,4)}</span>
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────── */}
      {tab === 'overview' && analytics && (
        <div className="space-y-5">

          {/* Revenue chart — full width */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="font-semibold text-stone-800">Daily Revenue</h3>
                <p className="text-xs text-stone-400 mt-0.5">Last 30 days · hover a bar for details</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-xl font-bold text-stone-900">
                    ₹{Number(analytics.thisMonth).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                  {revenueTrend !== 0 && (
                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${revenueTrend > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {revenueTrend > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {Math.abs(revenueTrend)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-400">this month vs last</p>
              </div>
            </div>
            <div className="mt-4">
              <RevenueBarChart data={analytics.dailyRevenue} />
            </div>
            {analytics.dailyRevenue.length > 1 && (
              <div className="flex justify-between text-xs text-stone-400 mt-2">
                <span>{new Date(analytics.dailyRevenue[0].date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-stone-800 rounded-sm inline-block" />Weekday</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-stone-400 rounded-sm inline-block" />Weekend</span>
                </span>
                <span>{new Date(analytics.dailyRevenue[analytics.dailyRevenue.length-1].date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
              </div>
            )}
          </div>

          {/* Two column row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Top products */}
            <div className="card p-5">
              <h3 className="font-semibold text-stone-800 mb-4">Top Products by Revenue</h3>
              {analytics.topProducts.every(p => p.units_sold == 0) ? (
                <div className="text-center py-6 text-stone-400">
                  <Package className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                  <p className="text-sm">No sales yet</p>
                  <p className="text-xs mt-1">Products will rank here once orders come in</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.topProducts.map((p, i) => {
                    const maxRev = Math.max(...analytics.topProducts.map(x => parseFloat(x.revenue)));
                    const pct = maxRev > 0 ? (parseFloat(p.revenue) / maxRev) * 100 : 0;
                    return (
                      <div key={p.id}>
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className="text-xs font-bold text-stone-400 w-4">#{i+1}</span>
                          <img src={p.image_url || `https://picsum.photos/seed/${p.id}/40`} alt={p.name}
                            className="w-7 h-7 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                            onError={e => { e.target.src = `https://picsum.photos/seed/${p.id+5}/40`; }} />
                          <span className="text-sm font-medium text-stone-700 flex-1 truncate">{p.name}</span>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs font-bold text-stone-900">₹{Number(p.revenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                            <p className="text-xs text-stone-400">{p.units_sold} sold</p>
                          </div>
                        </div>
                        <div className="ml-[1.875rem] h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-stone-800 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category breakdown */}
            <div className="card p-5">
              <h3 className="font-semibold text-stone-800 mb-4">Revenue by Category</h3>
              <CategoryDonut data={analytics.revenueByCategory} />
            </div>
          </div>

          {/* Second two-column row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Order status breakdown */}
            <div className="card p-5">
              <h3 className="font-semibold text-stone-800 mb-4">Order Status Breakdown</h3>
              <StatusDonut data={analytics.statusBreakdown} />
            </div>

            {/* Stock health */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800">Stock Health</h3>
                <span className="text-xs text-stone-400">Lowest stock first</span>
              </div>
              {analytics.stockHealth.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-4">No active products</p>
              ) : (
                <div className="space-y-2">
                  {analytics.stockHealth.map(p => {
                    const level = p.stock === 0 ? 'out' : p.stock <= 5 ? 'low' : p.stock <= 20 ? 'medium' : 'good';
                    const barColor = { out: 'bg-red-500', low: 'bg-amber-500', medium: 'bg-blue-400', good: 'bg-green-500' }[level];
                    const pct = Math.min((p.stock / 50) * 100, 100);
                    return (
                      <div key={p.id} className="flex items-center gap-2.5">
                        <img src={p.image_url || `https://picsum.photos/seed/${p.id}/40`} alt={p.name}
                          className="w-7 h-7 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                          onError={e => { e.target.src = `https://picsum.photos/seed/${p.id+5}/40`; }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-medium text-stone-700 truncate">{p.name}</span>
                            <span className={`text-xs font-bold ml-2 flex-shrink-0 ${
                              level==='out' ? 'text-red-600' : level==='low' ? 'text-amber-600' : 'text-stone-700'}`}>
                              {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                            </span>
                          </div>
                          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.max(pct, p.stock===0?0:4)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCTS TAB ─────────────────────────────────────── */}
      {tab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-stone-500">{products.length} product{products.length !== 1 ? 's' : ''}</p>
            <button onClick={() => { setShowForm(true); setEditProduct(null); }}
              className="btn-primary text-sm flex items-center gap-2 py-2">
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="card p-12 text-center">
              <Package className="w-12 h-12 mx-auto text-stone-300 mb-3" />
              <p className="font-medium text-stone-600">No products yet</p>
              <p className="text-sm text-stone-400 mt-1 mb-4">Your listings will appear here</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">List your first product</button>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map(p => (
                <div key={p.id} className="card p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                  <img src={p.image_url || `https://picsum.photos/seed/${p.id}/80`} alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                    onError={e => { e.target.src = `https://picsum.photos/seed/${p.id+5}/80`; }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-stone-800 truncate">{p.name}</span>
                      {p.is_featured === 1 && <span className="badge bg-amber-100 text-amber-700 text-xs">⭐ Featured</span>}
                      {!p.is_active && <span className="badge bg-stone-200 text-stone-500 text-xs">Inactive</span>}
                      {p.stock === 0 && <span className="badge bg-red-100 text-red-600 text-xs">Out of stock</span>}
                      {p.stock > 0 && p.stock <= 5 && <span className="badge bg-amber-100 text-amber-700 text-xs">Low stock</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                      <span className="font-semibold text-stone-800">₹{Number(p.price).toLocaleString('en-IN')}</span>
                      <span>{p.stock} in stock</span>
                      <span>{p.category_name}</span>
                      <span className="font-medium text-stone-700">{p.total_sold} sold</span>
                      {parseFloat(p.avg_rating) > 0 && (
                        <span className="flex items-center gap-1">
                          <Stars rating={p.avg_rating} />
                          <span className="font-medium text-stone-700">{parseFloat(p.avg_rating).toFixed(1)}</span>
                          <span className="text-stone-400">({p.review_count})</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock bar */}
                  <div className="hidden sm:block w-20 flex-shrink-0">
                    <p className="text-xs text-stone-400 mb-1 text-center">{p.stock} units</p>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        p.stock === 0 ? 'bg-red-500' : p.stock <= 5 ? 'bg-amber-500' : p.stock <= 20 ? 'bg-blue-400' : 'bg-green-500'}`}
                        style={{ width: `${Math.min((p.stock / 50) * 100, 100)}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => { setEditProduct(p); setShowForm(false); }}
                      className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ORDERS TAB ───────────────────────────────────────── */}
      {tab === 'orders' && (
        <div>
          <p className="text-sm text-stone-500 mb-4">{orders.length} order{orders.length !== 1 ? 's' : ''} received</p>

          {orders.length === 0 ? (
            <div className="card p-12 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto text-stone-300 mb-3" />
              <p className="font-medium text-stone-600">No orders yet</p>
              <p className="text-sm text-stone-400 mt-1">Orders containing your products will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map(o => {
                const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
                const isExpanded = expandedOrder === o.id;
                return (
                  <div key={o.id} className="card overflow-hidden">
                    {/* Order row */}
                    <button className="w-full text-left p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors"
                      onClick={() => setExpandedOrder(isExpanded ? null : o.id)}>
                      {/* Product thumb stack */}
                      <div className="flex -space-x-2 flex-shrink-0">
                        {items.slice(0, 3).map((item, i) => (
                          <img key={i}
                            src={item.image_url || `https://picsum.photos/seed/${item.product_id}/50`}
                            alt="" className="w-9 h-9 rounded-lg border-2 border-white object-cover bg-stone-100"
                            onError={e => { e.target.src = `https://picsum.photos/seed/${(item.product_id||0)+3}/50`; }} />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-stone-800">Order #{o.id}</span>
                          <span className={`badge text-xs ${statusColors[o.status] || 'bg-stone-100 text-stone-600'}`}>{o.status}</span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">
                          <span className="text-stone-600 font-medium">{o.customer_name}</span>
                          {' · '}
                          {new Date(o.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                          {' · '}
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-stone-900">₹{Number(o.seller_revenue).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-stone-400">your earnings</p>
                      </div>
                      <span className={`text-stone-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>›</span>
                    </button>

                    {/* Expanded items */}
                    {isExpanded && (
                      <div className="border-t border-stone-100 px-4 py-3 bg-stone-50 space-y-2.5 animate-fade-in">
                        {items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <img src={item.image_url || `https://picsum.photos/seed/${item.product_id}/60`}
                              alt={item.product_name} className="w-10 h-10 rounded-lg object-cover bg-stone-200 flex-shrink-0"
                              onError={e => { e.target.src = `https://picsum.photos/seed/${(item.product_id||0)+3}/60`; }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-700 truncate">{item.product_name}</p>
                              <p className="text-xs text-stone-400">
                                ₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-stone-900 flex-shrink-0">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── REVIEWS TAB ──────────────────────────────────────── */}
      {tab === 'reviews' && (
        <div>
          {/* Summary header */}
          {analytics && (
            <div className="card p-5 mb-4 flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <p className="text-3xl font-bold text-stone-900">
                  {parseFloat(analytics.avgRating) > 0 ? parseFloat(analytics.avgRating).toFixed(1) : '—'}
                </p>
                <Stars rating={analytics.avgRating} size="md" />
                <p className="text-xs text-stone-400 mt-1">{analytics.totalReviews} reviews</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-700 mb-1">Overall store rating</p>
                <p className="text-sm text-stone-500">
                  {analytics.totalReviews === 0
                    ? 'No reviews yet. Encourage customers to leave feedback.'
                    : analytics.avgRating >= 4.5
                      ? 'Excellent! Customers love your products.'
                      : analytics.avgRating >= 3.5
                        ? 'Good ratings. Keep improving product quality.'
                        : 'Consider reviewing product descriptions and quality.'}
                </p>
              </div>
            </div>
          )}

          {/* Recent reviews list */}
          {!analytics?.recentReviews?.length ? (
            <div className="card p-12 text-center">
              <MessageSquare className="w-10 h-10 mx-auto text-stone-300 mb-3" />
              <p className="font-medium text-stone-600">No reviews yet</p>
              <p className="text-sm text-stone-400 mt-1">Customer reviews on your products will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-stone-700 mb-2">Recent Reviews</h3>
              {analytics.recentReviews.map((r, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center font-semibold text-stone-600 text-xs flex-shrink-0">
                        {r.reviewer[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-stone-800">{r.reviewer}</p>
                        <Stars rating={r.rating} />
                      </div>
                    </div>
                    <p className="text-xs text-stone-400 flex-shrink-0">
                      {new Date(r.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>
                  <Link to={`/products/${r.product_id}`}
                    className="text-xs text-stone-500 hover:text-stone-800 font-medium mb-2 block transition-colors">
                    → {r.product_name}
                  </Link>
                  {r.comment && <p className="text-sm text-stone-600 leading-relaxed">"{r.comment}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}