import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="h-6 skeleton w-1/4 rounded mb-6" />
      {[1,2,3].map(i => <div key={i} className="card p-5 mb-3 skeleton h-20" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-xl font-semibold text-stone-800 mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-12 h-12 mx-auto text-stone-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-stone-500 font-medium">No orders yet</p>
          <Link to="/products" className="btn-primary mt-4 inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="card p-4 flex items-start justify-between hover:shadow-md transition-shadow group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-stone-800">Order #{order.id}</span>
                  <span className={`badge ${statusColors[order.status] || 'bg-stone-100 text-stone-600'}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}{order.items?.length || 0} item(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-stone-900">₹{Number(order.total).toLocaleString('en-IN')}</p>
                <p className="text-xs text-stone-400 group-hover:text-stone-600 transition-colors mt-0.5">View →</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8"><div className="card p-6 skeleton h-48" /></div>;
  if (!order) return <div className="max-w-2xl mx-auto px-4 py-8 text-center text-stone-500">Order not found</div>;

  const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders" className="text-stone-400 hover:text-stone-600 transition-colors">← Orders</Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-700 font-medium">Order #{order.id}</span>
      </div>

      <div className="card p-5 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-stone-800">Order #{order.id}</h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className={`badge text-sm px-3 py-1 ${statusColors[order.status] || 'bg-stone-100 text-stone-600'}`}>
            {order.status}
          </span>
        </div>

        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex gap-3 items-center">
              <img
                src={item.image_url || `https://picsum.photos/seed/${item.product_id}/80/80`}
                alt={item.product_name}
                className="w-14 h-14 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                onError={e => { e.target.src = `https://picsum.photos/seed/${item.product_id+5}/80/80`; }}
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product_id}`} className="text-sm font-medium text-stone-800 hover:text-stone-600 transition-colors line-clamp-1">
                  {item.product_name}
                </Link>
                <p className="text-xs text-stone-400 mt-0.5">Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}</p>
              </div>
              <span className="text-sm font-semibold text-stone-800">
                ₹{(item.quantity * item.price).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-100 mt-4 pt-3 flex justify-between font-semibold text-stone-900">
          <span>Total</span>
          <span>₹{Number(order.total).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {addr && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-stone-800 mb-2">Shipping Address</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {addr.name}<br />
            {addr.address}, {addr.city}<br />
            {addr.state} — {addr.pincode}<br />
            {addr.phone && <span>{addr.phone}</span>}
          </p>
        </div>
      )}
    </div>
  );
}
