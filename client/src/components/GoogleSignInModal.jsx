import React, { useState } from 'react';
import { X, UserPlus, Check, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const GoogleLogo = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.59H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.41l4.03-3.13z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.59l4.03 3.13c.95-2.83 3.6-4.97 6.72-4.97z"/>
  </svg>
);

const PRESET_GOOGLE_ACCOUNTS = [
  {
    name: 'Yashas S H',
    email: 'yashas.s.h2601@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    initials: 'YS',
    badge: 'Detected Google Session'
  },
  {
    name: 'Foodie Gourmet',
    email: 'foodie.gourmet@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    initials: 'FG',
    badge: 'TastyBite Member'
  }
];

const GoogleSignInModal = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogle } = useAuth();
  const [loadingEmail, setLoadingEmail] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSelectAccount = async (account) => {
    try {
      setLoadingEmail(account.email);
      setError(null);
      const res = await loginWithGoogle({
        email: account.email,
        name: account.name,
        avatar: account.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(account.name)}`
      });

      if (res.success) {
        if (onSuccess) {
          onSuccess(res.user);
        }
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoadingEmail(null);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    const resolvedName = customName.trim() || customEmail.split('@')[0];
    handleSelectAccount({
      name: resolvedName,
      email: customEmail.trim(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}`
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-stone-800 transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Google Popup Header */}
        <div className="p-6 border-b border-stone-100 flex items-start justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <GoogleLogo className="w-7 h-7 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-stone-900 font-display">Sign in with Google</h2>
              <p className="text-xs text-stone-500">to continue to <span className="font-semibold text-orange-600">TastyBite</span></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-semibold text-stone-600">
            Choose an account to sign in to TastyBite
          </p>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Preset Google Accounts */}
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            {PRESET_GOOGLE_ACCOUNTS.map((acc) => {
              const isSelected = loadingEmail === acc.email;
              return (
                <button
                  key={acc.email}
                  disabled={loadingEmail !== null}
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full text-left p-3.5 flex items-center gap-3 hover:bg-stone-50 transition-colors disabled:opacity-60 cursor-pointer group"
                >
                  <div className="relative">
                    <img 
                      src={acc.avatar} 
                      alt={acc.name} 
                      className="w-10 h-10 rounded-full object-cover border border-stone-200"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
                      <GoogleLogo className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-stone-900 truncate group-hover:text-orange-600 transition-colors">
                        {acc.name}
                      </p>
                      {acc.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          {acc.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">{acc.email}</p>
                  </div>
                  <div>
                    {isSelected ? (
                      <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </button>
              );
            })}

            {/* Custom Account Toggle Button */}
            {!showCustomInput && (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full text-left p-3.5 flex items-center gap-3 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 border border-stone-200 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-stone-800 group-hover:text-orange-600 transition-colors">
                    Use another Google account
                  </p>
                  <p className="text-[10px] text-stone-400">Enter custom Gmail address</p>
                </div>
              </button>
            )}
          </div>

          {/* Custom Account Input Form */}
          {showCustomInput && (
            <form onSubmit={handleCustomSubmit} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">Enter Google Account Details</span>
                <button 
                  type="button" 
                  onClick={() => setShowCustomInput(false)}
                  className="text-[10px] text-stone-500 hover:text-stone-800 underline"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Yashas S H"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-white px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Gmail / Google Email</label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  required
                  className="w-full bg-white px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={loadingEmail !== null}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loadingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GoogleLogo className="w-4 h-4" />}
                <span>Continue with this Account</span>
              </button>
            </form>
          )}

          {/* Google Official Disclaimer */}
          <div className="text-[11px] text-stone-400 text-center leading-relaxed px-2">
            To continue, Google will share your name, email address, and profile picture with <span className="font-semibold text-stone-600">TastyBite</span>.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span>Protected by Google Identity</span>
          <button 
            type="button" 
            onClick={onClose}
            className="hover:text-stone-800 font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignInModal;
