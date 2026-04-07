import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, TrendingDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <svg key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {count > 0 && <span className="text-xs text-stone-400">({count})</span>}
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  // Calculate deal badge from price_history if available
  const highestPrice = product.price_history?.length
    ? Math.max(...product.price_history.map(h => parseFloat(h.price)))
    : null;
  const dealPct = highestPrice && highestPrice > parseFloat(product.price)
    ? Math.round(((highestPrice - parseFloat(product.price)) / highestPrice) * 100)
    : null;

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (product.stock === 0) return;
    addItem(product);
    toast.success(`Added to cart`);
  };

  const handleWishlist = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggle(product);
  };

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="card overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
        <div className="relative aspect-square bg-stone-100 overflow-hidden">
          <img
            src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.src = `https://picsum.photos/seed/${product.id + 10}/400/400`; }}
          />

          {/* Overlay badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.stock === 0 && <span className="badge bg-stone-800 text-white text-xs">Out of stock</span>}
            {product.stock > 0 && product.stock <= 5 && <span className="badge bg-amber-500 text-white text-xs">Only {product.stock} left</span>}
            {dealPct >= 5 && <span className="badge bg-green-600 text-white text-xs flex items-center gap-1"><TrendingDown className="w-3 h-3" />{dealPct}% off</span>}
          </div>

          {/* Wishlist heart */}
          <button onClick={handleWishlist}
            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all
              ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-stone-400 hover:text-red-400'}`}>
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Quick add — visible on hover */}
          {product.stock > 0 && (
            <button onClick={handleAdd}
              className="absolute bottom-0 left-0 right-0 bg-stone-800 text-white text-xs font-medium py-2.5
                         translate-y-full group-hover:translate-y-0 transition-transform duration-200 flex items-center justify-center gap-2">
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </button>
          )}
        </div>

        <div className="p-3.5">
          <p className="text-xs text-stone-400 mb-1">{product.category_name}</p>
          <h3 className="text-sm font-medium text-stone-800 line-clamp-2 leading-snug mb-2 group-hover:text-stone-600 transition-colors">
            {product.name}
          </h3>
          <StarRating rating={parseFloat(product.avg_rating)} count={product.review_count} />
          <div className="flex items-center justify-between mt-2.5">
            <div>
              <span className="text-base font-semibold text-stone-900">₹{Number(product.price).toLocaleString('en-IN')}</span>
              {dealPct >= 5 && highestPrice && (
                <span className="ml-1.5 text-xs text-stone-400 line-through">₹{Number(highestPrice).toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
