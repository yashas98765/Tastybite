import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [stage, setStage] = useState(1); // 1: enter email, 2: set new password
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage(res.data.message);
        setStage(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await API.post('/auth/reset-password', { email, newPassword });
      if (res.data.success) {
        setMessage('Password has been successfully updated. You can now log in.');
        setStage(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-stone-900 font-display">
          Password Recovery
        </h1>
        <p className="text-xs text-stone-500">
          Reset your TastyBite login credentials securely
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        {stage === 1 && (
          <form onSubmit={handleRequestReset} className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Registered Email</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {loading ? 'Sending Instructions...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {stage === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Enter New Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        {stage === 3 && (
          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-block bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
            >
              Proceed to Sign In
            </Link>
          </div>
        )}

        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          Remember your password?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
