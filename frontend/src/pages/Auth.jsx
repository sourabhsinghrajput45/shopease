import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Store } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
      navigate(res.data.user.role === 'seller' ? '/seller' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <h1 className="text-xl font-semibold text-stone-800">Sign in to ShopEase</h1>
          <p className="text-sm text-stone-500 mt-1">Welcome back</p>
        </div>
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-stone-600 block mb-1.5">Email</label>
              <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 block mb-1.5">Password</label>
              <input type="password" className="input" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-1">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <div className="mt-4 pt-4 border-t border-stone-100">
            <p className="text-xs text-stone-400 text-center mb-2">Demo accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setForm({ email: 'customer@shopease.com', password: 'demo1234' })}
                className="text-xs border border-stone-200 rounded-lg px-3 py-2 text-stone-500 hover:bg-stone-50 transition-colors text-left">
                <span className="block font-medium text-stone-700">Customer</span>
                <span>customer@shopease.com</span>
              </button>
              <button onClick={() => setForm({ email: 'seller@shopease.com', password: 'demo1234' })}
                className="text-xs border border-stone-200 rounded-lg px-3 py-2 text-stone-500 hover:bg-stone-50 transition-colors text-left">
                <span className="block font-medium text-stone-700">Seller</span>
                <span>seller@shopease.com</span>
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-stone-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-stone-800 font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      toast.success('Account created!');
      navigate(res.data.user.role === 'seller' ? '/seller' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <h1 className="text-xl font-semibold text-stone-800">Create your account</h1>
          <p className="text-sm text-stone-500 mt-1">Free, takes a minute</p>
        </div>
        <div className="card p-6">
          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            <button type="button" onClick={() => set('role', 'customer')}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.role === 'customer' ? 'border-stone-800 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
              <ShoppingBag className={`w-4 h-4 ${form.role === 'customer' ? 'text-stone-800' : 'text-stone-400'}`} />
              <div className="text-left">
                <p className={`text-xs font-semibold ${form.role === 'customer' ? 'text-stone-800' : 'text-stone-500'}`}>Customer</p>
                <p className="text-xs text-stone-400">Shop products</p>
              </div>
            </button>
            <button type="button" onClick={() => set('role', 'seller')}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.role === 'seller' ? 'border-stone-800 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}>
              <Store className={`w-4 h-4 ${form.role === 'seller' ? 'text-stone-800' : 'text-stone-400'}`} />
              <div className="text-left">
                <p className={`text-xs font-semibold ${form.role === 'seller' ? 'text-stone-800' : 'text-stone-500'}`}>Seller</p>
                <p className="text-xs text-stone-400">List products</p>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-stone-600 block mb-1.5">Full Name</label>
              <input type="text" className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" required />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 block mb-1.5">Email</label>
              <input type="email" className="input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-600 block mb-1.5">Password</label>
              <input type="password" className="input" value={form.password} onChange={e => set('password', e.target.value)} placeholder="At least 6 characters" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating account…' : `Create ${form.role === 'seller' ? 'Seller' : ''} Account`}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-stone-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-stone-800 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
