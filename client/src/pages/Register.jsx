import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignInModal, { GoogleLogo } from '../components/GoogleSignInModal';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please provide all required fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await register({ name, email, password, phone });
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
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
          Create Foodie Account
        </h1>
        <p className="text-xs text-stone-500">
          Join TastyBite to enjoy instant group ordering, discounts, and real-time tracking
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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
            or register with email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full bg-stone-100 pl-10 pr-3.5 py-3 rounded-xl border border-stone-200 font-semibold focus:outline-none focus:border-orange-500"
                required
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full bg-stone-100 pl-10 pr-3.5 py-3 rounded-xl border border-stone-200 font-semibold focus:outline-none focus:border-orange-500"
                required
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Phone Number</label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 12345"
                className="w-full bg-stone-100 pl-10 pr-3.5 py-3 rounded-xl border border-stone-200 font-semibold focus:outline-none focus:border-orange-500"
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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
            <span>{loading ? 'Registering Account...' : 'Complete Sign Up'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>

      {/* Google Sign-in Modal */}
      <GoogleSignInModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSuccess={() => navigate('/portal')}
      />
    </div>
  );
};

export default Register;
