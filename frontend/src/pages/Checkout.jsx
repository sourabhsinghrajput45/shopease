import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', state: '', pincode: ''
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const delivery = total >= 999 ? 0 : 49;
  const grandTotal = total + delivery;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.city || !form.pincode) {
      toast.error('Please fill all required fields'); return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
        shipping_address: form,
        payment_method: 'card'
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${res.data.order_id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-stone-500">Your cart is empty.</p>
        <Link to="/products" className="btn-primary mt-4 inline-block">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-xl font-semibold text-stone-800 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-stone-800 mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-500 block mb-1">Full Name *</label>
                <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" required />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">Phone Number</label>
                <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-stone-500 block mb-1">Address *</label>
                <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="House no, Street, Area" required />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">City *</label>
                <input className="input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" required />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">State</label>
                <input className="input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="Maharashtra" />
              </div>
              <div>
                <label className="text-xs text-stone-500 block mb-1">PIN Code *</label>
                <input className="input" value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="400001" required />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-stone-800 mb-3">Payment</h2>
            <div className="flex items-center gap-3 p-3 border border-stone-200 rounded-lg bg-stone-50">
              <div className="w-8 h-8 bg-stone-200 rounded-md flex items-center justify-center text-base">💳</div>
              <div>
                <p className="text-sm font-medium text-stone-700">Credit / Debit Card</p>
                <p className="text-xs text-stone-400">Demo mode — no real payment</p>
              </div>
              <div className="ml-auto w-4 h-4 rounded-full border-2 border-stone-800 bg-stone-800 ring-2 ring-stone-800 ring-offset-2" />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            {submitting ? 'Placing Order…' : `Place Order — ₹${grandTotal.toLocaleString('en-IN')}`}
          </button>
        </form>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="card p-5 sticky top-24">
            <h2 className="text-sm font-semibold text-stone-800 mb-4">Order Items ({items.length})</h2>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-start">
                  <img
                    src={item.image_url || `https://picsum.photos/seed/${item.id}/80/80`}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                    onError={e => { e.target.src = `https://picsum.photos/seed/${item.id+10}/80/80`; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-800 line-clamp-2 leading-snug">{item.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold text-stone-800 flex-shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Delivery</span>
                <span>{delivery === 0 ? <span className="text-green-600">Free</span> : `₹${delivery}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-stone-900 pt-1 border-t border-stone-100">
                <span>Grand Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
