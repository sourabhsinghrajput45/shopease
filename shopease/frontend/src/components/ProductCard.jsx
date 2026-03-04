import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
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

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="card overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="relative aspect-square bg-stone-100 overflow-hidden">
          <img
            src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.src = `https://picsum.photos/seed/${product.id + 10}/400/400`; }}
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="badge bg-stone-100 text-stone-600 font-medium text-sm px-3 py-1">Out of stock</span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-2 left-2">
              <span className="badge bg-amber-100 text-amber-700">Only {product.stock} left</span>
            </div>
          )}
        </div>

        <div className="p-3.5">
          <p className="text-xs text-stone-400 mb-1">{product.category_name}</p>
          <h3 className="text-sm font-medium text-stone-800 line-clamp-2 leading-snug mb-2 group-hover:text-stone-600 transition-colors">
            {product.name}
          </h3>

          <StarRating rating={parseFloat(product.avg_rating)} count={product.review_count} />

          <div className="flex items-center justify-between mt-3">
            <span className="text-base font-semibold text-stone-900">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="w-8 h-8 rounded-lg bg-stone-800 text-white flex items-center justify-center
                         hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Add to cart"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
