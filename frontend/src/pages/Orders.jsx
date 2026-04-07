import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Package, MapPin, CreditCard } from 'lucide-react';
import api from '../api';

const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
const statusColors = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
};
const statusLabels = {
  pending: 'Order Placed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered'
};

function OrderStepper({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 py-3">
        <span className="badge bg-red-100 text-red-700 text-sm px-3 py-1.5">Order Cancelled</span>
      </div>
    );
  }
  const currentIdx = statusSteps.indexOf(status);
  return (
    <div className="py-4">
      <div className="flex items-center">
        {statusSteps.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                ${i <= currentIdx ? 'bg-stone-800 border-stone-800 text-white' : 'border-stone-300 text-stone-400 bg-white'}`}>
                {i < currentIdx ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium hidden sm:block ${i <= currentIdx ? 'text-stone-800' : 'text-stone-400'}`}>
                {statusLabels[step]}
              </span>
            </div>
            {i < statusSteps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < currentIdx ? 'bg-stone-800' : 'bg-stone-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-3">
      {[1,2,3].map(i => <div key={i} className="card p-5 skeleton h-24" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-xl font-semibold text-stone-800 mb-1">My Orders</h1>
      <p className="text-sm text-stone-400 mb-6">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>

      {orders.length === 0 ? (
        <div className="text-center py-16 card p-8">
          <Package className="w-12 h-12 mx-auto text-stone-300 mb-3" />
          <p className="text-stone-600 font-medium">No orders yet</p>
          <p className="text-sm text-stone-400 mt-1 mb-5">Your order history will appear here</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`}
              className="card p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition-all group">
              {/* Thumbnail strip */}
              <div className="flex -space-x-2 flex-shrink-0">
                {(order.items || []).slice(0, 3).map((item, i) => (
                  <img key={i}
                    src={item.product_image || `https://picsum.photos/seed/${item.product_id}/60/60`}
                    alt="" className="w-10 h-10 rounded-lg object-cover border-2 border-white bg-stone-100"
                    onError={e => { e.target.src = `https://picsum.photos/seed/${(item.product_id||0)+5}/60/60`; }} />
                ))}
                {(order.items || []).length > 3 && (
                  <div className="w-10 h-10 rounded-lg bg-stone-100 border-2 border-white flex items-center justify-center text-xs font-semibold text-stone-500">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-stone-800">Order #{order.id}</span>
                  <span className={`badge text-xs ${statusColors[order.status] || 'bg-stone-100 text-stone-600'}`}>{order.status}</span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}{(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-stone-900">₹{Number(order.total).toLocaleString('en-IN')}</p>
                <span className="text-xs text-stone-400 group-hover:text-stone-600 transition-colors">View details →</span>
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

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8"><div className="card p-6 skeleton h-64" /></div>;
  if (!order) return <div className="max-w-2xl mx-auto px-4 py-8 text-center text-stone-500">Order not found</div>;

  const addr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link to="/orders" className="text-stone-400 hover:text-stone-600 transition-colors">My Orders</Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-700 font-medium">Order #{order.id}</span>
      </div>

      {/* Header card */}
      <div className="card p-5 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-stone-800">Order #{order.id}</h1>
            <p className="text-xs text-stone-400 mt-0.5">
              Placed {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className={`badge text-sm px-3 py-1.5 ${statusColors[order.status] || 'bg-stone-100 text-stone-600'}`}>
            {order.status}
          </span>
        </div>

        {/* Status stepper */}
        <OrderStepper status={order.status} />
      </div>

      {/* Items */}
      <div className="card p-5 mb-4">
        <h2 className="text-sm font-semibold text-stone-800 mb-4">Items Ordered</h2>
        <div className="space-y-4">
          {order.items?.map(item => (
            <div key={item.id} className="flex gap-3 items-center">
              <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
                <img src={item.image_url || `https://picsum.photos/seed/${item.product_id}/80/80`}
                  alt={item.product_name}
                  className="w-16 h-16 rounded-xl object-cover bg-stone-100"
                  onError={e => { e.target.src = `https://picsum.photos/seed/${item.product_id+5}/80/80`; }} />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product_id}`}
                  className="text-sm font-medium text-stone-800 hover:text-stone-600 transition-colors line-clamp-2 leading-snug">
                  {item.product_name}
                </Link>
                <p className="text-xs text-stone-400 mt-0.5">
                  ₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold text-stone-900 flex-shrink-0">
                ₹{(item.quantity * item.price).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-stone-100 mt-5 pt-4 space-y-1.5">
          <div className="flex justify-between text-sm text-stone-500">
            <span>Subtotal</span><span>₹{Number(order.total).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm text-stone-500">
            <span>Delivery</span><span className="text-green-600">Free</span>
          </div>
          <div className="flex justify-between text-base font-bold text-stone-900 pt-1 border-t border-stone-100">
            <span>Total</span><span>₹{Number(order.total).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Two column — address + payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addr && (
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-stone-400" />
              <h2 className="text-sm font-semibold text-stone-800">Shipping Address</h2>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              {addr.name && <span className="font-medium block">{addr.name}</span>}
              {addr.address}<br />
              {addr.city}{addr.state ? `, ${addr.state}` : ''}<br />
              PIN: {addr.pincode}
              {addr.phone && <span className="block mt-1 text-stone-400">{addr.phone}</span>}
            </p>
          </div>
        )}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-stone-400" />
            <h2 className="text-sm font-semibold text-stone-800">Payment</h2>
          </div>
          <p className="text-sm text-stone-600">
            {order.payment_method === 'card' ? 'Credit / Debit Card' : order.payment_method}
          </p>
          <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Paid</span>
        </div>
      </div>
    </div>
  );
}
