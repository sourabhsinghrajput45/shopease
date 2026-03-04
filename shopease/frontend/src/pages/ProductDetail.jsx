import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`${readonly ? '' : 'cursor-pointer'}`}
        >
          <svg
            className={`w-5 h-5 transition-colors ${i <= (hover || value) ? 'text-amber-400' : 'text-stone-200'}`}
            fill="currentColor" viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isLoggedIn } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get(`/products/${id}`).then(r => setProduct(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addItem(product, qty);
    toast.success(`${product.name} added to cart!`);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/reviews/${id}`, { rating, comment });
      toast.success('Review submitted!');
      setComment('');
      setRating(5);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="skeleton aspect-square rounded-xl" />
        <div className="space-y-4">
          <div className="skeleton h-6 w-3/4 rounded" />
          <div className="skeleton h-8 w-1/3 rounded" />
          <div className="skeleton h-20 w-full rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
      <p className="text-stone-500">Product not found.</p>
      <Link to="/products" className="btn-primary mt-4 inline-block">Browse Products</Link>
    </div>
  );

  const avgRating = parseFloat(product.avg_rating);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex gap-1.5 text-sm text-stone-400 mb-6">
        <Link to="/" className="hover:text-stone-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-stone-600 transition-colors">Products</Link>
        <span>/</span>
        <span className="text-stone-600 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="aspect-square rounded-xl overflow-hidden bg-stone-100">
          <img
            src={product.image_url || `https://picsum.photos/seed/${product.id}/600/600`}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = `https://picsum.photos/seed/${product.id + 10}/600/600`; }}
          />
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-stone-400 mb-1">{product.category_name}</p>
          <h1 className="text-2xl font-semibold text-stone-900 leading-snug mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating value={Math.round(avgRating)} readonly />
            <span className="text-sm text-stone-500">
              {avgRating > 0 ? `${avgRating.toFixed(1)} (${product.review_count} reviews)` : 'No reviews yet'}
            </span>
          </div>

          <div className="text-3xl font-bold text-stone-900 mb-4">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </div>

          {product.description && (
            <p className="text-stone-600 text-sm leading-relaxed mb-5">{product.description}</p>
          )}

          {/* Stock */}
          <div className="mb-5">
            {product.stock === 0 ? (
              <span className="text-red-600 text-sm font-medium">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-amber-600 text-sm font-medium">Only {product.stock} left in stock</span>
            ) : (
              <span className="text-green-700 text-sm font-medium">In stock</span>
            )}
          </div>

          {/* Qty + Add */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100 transition-colors"
                >−</button>
                <span className="px-4 py-2 text-sm font-medium text-stone-800 min-w-[2.5rem] text-center">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100 transition-colors"
                >+</button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary flex-1 py-2.5">
                Add to Cart
              </button>
            </div>
          )}

          <div className="border-t border-stone-100 pt-4 mt-4 space-y-1.5 text-xs text-stone-500">
            <div className="flex gap-2"><span>🚚</span><span>Free delivery on orders over ₹999</span></div>
            <div className="flex gap-2"><span>↩️</span><span>Easy 30-day returns</span></div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-stone-800 mb-6">Customer Reviews</h2>

        {/* Add review */}
        {isLoggedIn ? (
          <div className="card p-5 mb-6">
            <h3 className="text-sm font-medium text-stone-700 mb-3">Write a Review</h3>
            <form onSubmit={handleReview} className="space-y-3">
              <div>
                <label className="text-xs text-stone-500 block mb-1">Your Rating</label>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your thoughts about this product…"
                rows={3}
                className="input resize-none"
              />
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <div className="card p-5 mb-6 flex items-center justify-between">
            <p className="text-sm text-stone-600">Sign in to leave a review</p>
            <Link to="/login" className="btn-secondary py-1.5 px-4 text-sm">Sign In</Link>
          </div>
        )}

        {/* Review list */}
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map(r => (
              <div key={r.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{r.user_name}</p>
                    <StarRating value={r.rating} readonly />
                  </div>
                  <p className="text-xs text-stone-400">
                    {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {r.comment && <p className="text-sm text-stone-600 mt-2 leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-stone-400 text-sm text-center py-8">No reviews yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
