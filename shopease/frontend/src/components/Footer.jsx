import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-stone-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-stone-800 rounded-md flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/>
                  <path d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
              </div>
              <span className="font-semibold text-stone-900">ShopEase</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">Simple, honest shopping. No clutter, no tricks.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">All Products</Link></li>
              <li><Link to="/products?category=electronics" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=clothing" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Clothing</Link></li>
              <li><Link to="/products?category=books" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Books</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Create Account</Link></li>
              <li><Link to="/orders" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">My Orders</Link></li>
              <li><Link to="/cart" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">Info</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-stone-500">Free delivery over ₹999</span></li>
              <li><span className="text-sm text-stone-500">Easy returns</span></li>
              <li><span className="text-sm text-stone-500">Secure payments</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-stone-400">© 2025 ShopEase. All rights reserved.</p>
          <p className="text-xs text-stone-400">Built with React & Node.js</p>
        </div>
      </div>
    </footer>
  );
}
