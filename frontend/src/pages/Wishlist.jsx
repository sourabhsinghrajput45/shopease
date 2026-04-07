import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { items, remove } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (item) => {
    addItem(item);
    remove(item.id);
    toast.success('Moved to cart!');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-red-300" />
        </div>
        <h2 className="text-xl font-semibold text-stone-800 mb-2">Your wishlist is empty</h2>
        <p className="text-stone-500 text-sm mb-6">Save products you love by tapping the heart icon.</p>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">Wishlist</h1>
          <p className="text-sm text-stone-400 mt-0.5">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="card p-4 flex gap-4 group">
            <Link to={`/products/${item.id}`} className="flex-shrink-0">
              <img
                src={item.image_url || `https://picsum.photos/seed/${item.id}/120/120`}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover bg-stone-100"
                onError={e => { e.target.src = `https://picsum.photos/seed/${item.id+10}/120/120`; }}
              />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-stone-400 mb-0.5">{item.category_name}</p>
              <Link to={`/products/${item.id}`}
                className="text-sm font-medium text-stone-800 hover:text-stone-600 line-clamp-2 leading-snug block mb-2">
                {item.name}
              </Link>
              <p className="text-base font-semibold text-stone-900 mb-3">
                ₹{Number(item.price).toLocaleString('en-IN')}
              </p>
              <div className="flex gap-2">
                <button onClick={() => handleMoveToCart(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-stone-800 text-white text-xs font-medium py-2 rounded-lg hover:bg-stone-700 transition-colors">
                  <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                </button>
                <button onClick={() => remove(item.id)}
                  className="p-2 border border-stone-200 rounded-lg text-stone-400 hover:text-red-500 hover:border-red-200 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-700">Want them all?</p>
          <p className="text-xs text-stone-400 mt-0.5">Move everything to cart in one click</p>
        </div>
        <button
          onClick={() => { items.forEach(i => addItem(i)); items.forEach(i => remove(i.id)); toast.success('All items moved to cart!'); }}
          className="btn-primary text-sm py-2 px-4 flex-shrink-0">
          Add All to Cart
        </button>
      </div>
    </div>
  );
}
