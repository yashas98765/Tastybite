import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInModal, { GoogleLogo } from '../components/GoogleSignInModal';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'admin' && redirectUrl === '/') {
          navigate('/admin/dashboard');
        } else if (redirectUrl === '/') {
          navigate('/portal');
        } else {
          navigate(redirectUrl);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'admin') {
      setEmail('admin@tastybite.com');
      setPassword('Admin@123');
    } else {
      setEmail('customer@tastybite.com');
      setPassword('Customer@123');
    }
  };

  const handleGoogleSuccess = (user) => {
    if (user.role === 'admin' && redirectUrl === '/') {
      navigate('/admin/dashboard');
    } else if (redirectUrl === '/') {
      navigate('/portal');
    } else {
      navigate(redirectUrl);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-black">TB</span>
          </div>
          <span className="text-2xl font-black text-stone-900 font-display">
            Tasty<span className="text-orange-600">Bite</span>
          </span>
        </Link>
        <h1 className="text-2xl font-black text-stone-900 font-display">
          Welcome Back Foodie!
        </h1>
        <p className="text-xs text-stone-500">
          Sign in to track orders, manage favorites, and join group feasts
        </p>
      </div>

      {/* Demo Credentials Helper Pill */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs">
        <span className="font-extrabold text-amber-900 block text-[11px] uppercase tracking-wider">
          ⚡ 1-Click Evaluation Accounts:
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount('customer')}
            className="flex-1 bg-white hover:bg-amber-100 text-stone-800 font-bold p-2 rounded-xl border border-amber-300 transition-colors cursor-pointer"
          >
            Customer Demo
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('admin')}
            className="flex-1 bg-white hover:bg-amber-100 text-purple-900 font-bold p-2 rounded-xl border border-purple-300 transition-colors cursor-pointer"
          >
            Admin Demo
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={() => setGoogleModalOpen(true)}
          className="w-full bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 text-stone-700 font-bold text-xs py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer group"
        >
          <GoogleLogo className="w-4 h-4 shrink-0" />
          <span className="group-hover:text-stone-900 transition-colors">Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-stone-200 w-full"></div>
          <span className="bg-white px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider absolute">
            or continue with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-stone-100 pl-10 pr-3.5 py-3 rounded-xl border border-stone-200 font-semibold focus:outline-none focus:border-orange-500"
                required
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-bold text-orange-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-100 pl-10 pr-3.5 py-3 rounded-xl border border-stone-200 font-semibold focus:outline-none focus:border-orange-500"
                required
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to TastyBite'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-orange-600 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>

      {/* Google Sign-in Modal */}
      <GoogleSignInModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
      />
    </div>
  );
};

export default Login;
