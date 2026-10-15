import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Bell,
  Sparkles,
  Users,
  Compass,
  Store,
  ChevronDown,
  LogOut,
  Package,
  CreditCard,
  MapPin,
  Shield,
  LifeBuoy,
  Settings,
  Home as HomeIcon,
  PhoneCall,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';
import { formatCurrency } from '../utils/formatters';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalCount, grandTotal } = useCart();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadNotifications(res.data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setUnreadNotifications(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs transition-all">
      {/* Top Banner Tagline */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white text-xs font-medium py-1 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <span>🍔 Good Food, Just a Bite Away.</span>
        <span className="hidden sm:inline">• Use code <strong className="bg-white/20 px-1.5 py-0.5 rounded text-yellow-200">TASTY50</strong> for 50% OFF!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Branding */}
          <Link
            to={isAuthenticated ? "/portal" : "/"}
            className="flex items-center gap-3 group shrink-0"
            title="TastyBite Portal Hub"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
              <span className="text-white text-2xl font-black">TB</span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold tracking-tight text-stone-900 font-display">
                  Tasty<span className="text-orange-600">Bite</span>
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium tracking-tight -mt-1 hidden sm:block">
                Good Food, Just a Bite Away.
              </p>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden xl:flex flex-1 max-w-xs mx-3 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or restaurants..."
              className="w-full bg-stone-100 text-stone-800 placeholder-stone-400 text-xs rounded-full pl-10 pr-4 py-2 border border-stone-200 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-3" />
          </form>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            <Link
              to="/"
              className={`px-2.5 xl:px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname === '/' ? 'text-orange-600 bg-orange-50 font-bold' : 'text-stone-700 hover:text-orange-600 hover:bg-stone-50'
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              Home
            </Link>

            <Link
              to="/restaurants"
              className={`px-2.5 xl:px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname === '/restaurants' ? 'text-orange-600 bg-orange-50 font-bold' : 'text-stone-700 hover:text-orange-600 hover:bg-stone-50'
              }`}
            >
              <Store className="w-4 h-4" />
              Restaurants
            </Link>

            <Link
              to="/menu"
              className={`px-2.5 xl:px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname === '/menu' ? 'text-orange-600 bg-orange-50 font-bold' : 'text-stone-700 hover:text-orange-600 hover:bg-stone-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Menu
            </Link>

            <Link
              to="/smart-picks"
              className={`px-2.5 xl:px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname === '/smart-picks'
                  ? 'text-purple-600 bg-purple-50 font-bold'
                  : 'text-stone-700 hover:text-purple-600 hover:bg-purple-50/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              Smart Picks
              <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded-full">New</span>
            </Link>

            <Link
              to="/group-orders"
              className={`px-2.5 xl:px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname.startsWith('/group-orders')
                  ? 'text-teal-600 bg-teal-50 font-bold'
                  : 'text-stone-700 hover:text-teal-600 hover:bg-teal-50/50'
              }`}
            >
              <Users className="w-4 h-4 text-teal-600" />
              Group Feast
            </Link>

            <Link
              to="/orders"
              className={`px-2.5 xl:px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname === '/orders'
                  ? 'text-orange-600 bg-orange-50 font-bold'
                  : 'text-stone-700 hover:text-orange-600 hover:bg-stone-50'
              }`}
            >
              <Package className="w-4 h-4" />
              Orders
            </Link>

            <Link
              to="/contact"
              className={`px-2.5 xl:px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                location.pathname === '/contact' || location.pathname === '/contact-us' || location.pathname === '/support'
                  ? 'text-orange-600 bg-orange-50 font-bold'
                  : 'text-stone-700 hover:text-orange-600 hover:bg-stone-50'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              Contact Us
            </Link>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Theme Toggle (Light / Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 text-stone-600 hover:text-amber-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-all cursor-pointer relative"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 animate-in spin-in-180 duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-stone-700 animate-in spin-in-90 duration-300" />
              )}
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2.5 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-full relative transition-colors"
              title="Your Favorites"
            >
              <Heart className="w-5 h-5" />
              {user?.wishlist?.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {user.wishlist.length}
                </span>
              )}
            </Link>

            {/* In-app Notifications */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2.5 text-stone-600 hover:text-orange-600 hover:bg-orange-50 rounded-full relative transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-100 py-3 z-50">
                    <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-orange-600" />
                        <h4 className="font-bold text-stone-900 text-sm">Notifications</h4>
                      </div>
                      {unreadNotifications > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-orange-600 font-semibold hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-stone-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-stone-400 text-sm">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div
                            key={n._id}
                            className={`p-3.5 hover:bg-stone-50 transition-colors ${!n.isRead ? 'bg-orange-50/40' : ''}`}
                          >
                            <p className="text-xs font-bold text-stone-800">{n.title}</p>
                            <p className="text-xs text-stone-600 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-stone-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button */}
            <Link
              to="/cart"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-3.5 py-2 rounded-full font-bold text-sm shadow-md shadow-orange-500/25 transition-all hover:scale-102"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {totalCount > 0 && (
                <span className="bg-white text-orange-600 text-xs px-2 py-0.5 rounded-full font-black ml-1">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-100 transition-colors border border-stone-200 cursor-pointer"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-orange-500/30"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500 hidden sm:block mr-1" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 divide-y divide-stone-100 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 bg-stone-50/70">
                      <p className="text-sm font-bold text-stone-900 truncate">{user?.name}</p>
                      <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 rounded-md">
                          Admin Portal
                        </span>
                      )}
                    </div>

                    <div className="py-1.5">
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-purple-700 font-bold hover:bg-purple-50 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-purple-600" />
                          Admin Dashboard
                        </Link>
                      )}

                      {/* 0. Welcome Portal Hub */}
                      <Link
                        to="/portal"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-orange-600 bg-orange-50/60 hover:bg-orange-100/60 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-orange-600" />
                        TastyBite Welcome Hub
                      </Link>

                      {/* 1. Profile */}
                      <Link
                        to="/profile?tab=overview"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-orange-500" />
                        Profile
                      </Link>

                      {/* 2. My Orders */}
                      <Link
                        to="/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-blue-500" />
                        My Orders
                      </Link>

                      {/* 3. Notifications */}
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setNotificationsOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-stone-700 hover:text-orange-600 hover:bg-orange-50 transition-colors text-left cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <Bell className="w-4 h-4 text-amber-500" />
                          Notifications
                        </span>
                        {unreadNotifications > 0 && (
                          <span className="text-[10px] bg-orange-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                            {unreadNotifications}
                          </span>
                        )}
                      </button>

                      {/* 4. Settings */}
                      <Link
                        to="/profile?tab=settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-stone-500" />
                        Settings
                      </Link>
                    </div>

                    <div className="py-1">
                      {/* 5. Logout */}
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-stone-700 hover:text-orange-600 text-sm font-bold px-3 py-2 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold px-4 py-2 rounded-full transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:text-orange-600 rounded-lg hover:bg-stone-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or restaurants..."
              className="w-full bg-stone-100 text-stone-800 placeholder-stone-400 text-sm rounded-full pl-10 pr-4 py-2 border border-stone-200 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
          </form>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-stone-200 px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-600"
          >
            <HomeIcon className="w-5 h-5 text-orange-500" />
            Home
          </Link>
          <Link
            to="/restaurants"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-600"
          >
            <Store className="w-5 h-5 text-orange-500" />
            Restaurants
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-600"
          >
            <Compass className="w-5 h-5 text-orange-500" />
            Explore Menu
          </Link>
          <Link
            to="/smart-picks"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-purple-700 bg-purple-50/50"
          >
            <Sparkles className="w-5 h-5 text-purple-600" />
            TastyBite Smart Picks
          </Link>
          <Link
            to="/group-orders"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-teal-700 bg-teal-50/50"
          >
            <Users className="w-5 h-5 text-teal-600" />
            Group Feast
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-600"
          >
            <Package className="w-5 h-5 text-orange-500" />
            My Orders
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-600"
          >
            <PhoneCall className="w-5 h-5 text-orange-500" />
            Contact Us & 24/7 Care
          </Link>
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-rose-700 bg-rose-50"
            >
              <Shield className="w-5 h-5 text-rose-600" />
              Admin Dashboard
            </Link>
          )}

          {/* Mobile Theme Toggle */}
          <div className="pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-stone-600" />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold border border-stone-200 dark:border-stone-700">
                {isDark ? 'Dark Theme Active' : 'Light Theme Active'}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
