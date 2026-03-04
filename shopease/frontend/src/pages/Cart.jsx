import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <svg className="w-16 h-16 mx-auto text-stone-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 className="text-xl font-semibold text-stone-800 mb-2">Your cart is empty</h2>
        <p className="text-stone-500 mb-6 text-sm">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    navigate('/checkout');
  };

  const delivery = total >= 999 ? 0 : 49;
  const grandTotal = total + delivery;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-stone-800">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-stone-400 hover:text-red-500 transition-colors">
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4">
              <Link to={`/products/${item.id}`} className="flex-shrink-0">
                <img
                  src={item.image_url || `https://picsum.photos/seed/${item.id}/120/120`}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg bg-stone-100"
                  onError={e => { e.target.src = `https://picsum.photos/seed/${item.id + 10}/120/120`; }}
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <Link to={`/products/${item.id}`} className="text-sm font-medium text-stone-800 hover:text-stone-600 transition-colors line-clamp-2 leading-snug">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-stone-300 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-stone-400 mt-0.5 mb-3">{item.category_name}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-stone-500 hover:bg-stone-100 text-sm transition-colors"
                    >−</button>
                    <span className="px-3 py-1 text-sm font-medium text-stone-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                      className="px-2.5 py-1 text-stone-500 hover:bg-stone-100 text-sm transition-colors"
                    >+</button>
                  </div>
                  <span className="text-sm font-semibold text-stone-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-5 sticky top-24">
            <h2 className="text-sm font-semibold text-stone-800 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery</span>
                <span>{delivery === 0 ? <span className="text-green-600">Free</span> : `₹${delivery}`}</span>
              </div>
              {delivery > 0 && (
                <p className="text-xs text-stone-400">Add ₹{(999 - total).toFixed(0)} more for free delivery</p>
              )}
              <div className="pt-3 border-t border-stone-100 flex justify-between font-semibold text-stone-900">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full mt-5 py-3">
              {isLoggedIn ? 'Proceed to Checkout' : 'Sign In to Checkout'}
            </button>
            <Link to="/products" className="block text-center text-sm text-stone-400 hover:text-stone-600 mt-3 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
