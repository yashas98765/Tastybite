import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Award,
  Sparkles,
  ShoppingBag,
  Heart,
  Settings,
  Lock,
  Bell,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  Star,
  DollarSign,
  Utensils,
  Clock,
  LogOut,
  RefreshCw,
  Gift,
  Tag,
  FileText,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { downloadInvoice } from '../utils/downloadHelper';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80'
];

const REWARDS_CATALOG = [
  {
    id: 'TB50',
    title: '₹50 Flat Discount Voucher',
    desc: 'Instant ₹50 off on any meal above ₹199',
    pointsCost: 200,
    discountAmount: 50,
    badge: 'Popular',
    icon: Tag
  },
  {
    id: 'DELFREE',
    title: 'Free Delivery Pass',
    desc: 'Waives ₹30-₹50 delivery charge on next order',
    pointsCost: 150,
    discountAmount: 30,
    badge: 'Saver',
    icon: Sparkles
  },
  {
    id: 'FEAST100',
    title: '₹100 Mega Feast Voucher',
    desc: 'Save ₹100 on family & group feast orders above ₹499',
    pointsCost: 350,
    discountAmount: 100,
    badge: 'Best Value',
    icon: Gift
  },
  {
    id: 'GOURMET20',
    title: '20% OFF Gourmet Pass',
    desc: 'Enjoy 20% off up to ₹250 on premium partner restaurants',
    pointsCost: 500,
    discountPercentage: 20,
    badge: 'VIP Only',
    icon: Award
  }
];

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateProfile, addAddress, updateAddress, deleteAddress, changePassword, logout } = useAuth();
  const { addToCart } = useCart();

  const tabParam = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabParam);

  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [notification, setNotification] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Profile Edit form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || PRESET_AVATARS[0],
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPass, setChangingPass] = useState(false);

  // Address modal states
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    tag: 'Home',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    zipCode: '560038',
    country: 'India',
    phone: user?.phone || '+91 98450 12345',
    isDefault: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    orderUpdates: user?.notificationPreferences?.orderUpdates ?? true,
    promotionalOffers: user?.notificationPreferences?.promotionalOffers ?? true,
    smsAlerts: user?.notificationPreferences?.smsAlerts ?? false,
    emailReceipts: user?.notificationPreferences?.emailReceipts ?? true
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Reward redemption states
  const [redeemedCode, setRedeemedCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [redeemingId, setRedeemingId] = useState(null);

  // Sync tab with URL
  useEffect(() => {
    if (tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Fetch dynamic stats from MongoDB
  useEffect(() => {
    fetchProfileStats();
  }, [user?._id]);

  const fetchProfileStats = async () => {
    try {
      setLoadingStats(true);
      const res = await API.get('/auth/profile-stats');
      if (res.data.success) {
        setStatsData(res.data.stats);
        if (res.data.user) {
          setProfileForm({
            name: res.data.user.name || '',
            phone: res.data.user.phone || '',
            avatar: res.data.user.avatar || PRESET_AVATARS[0],
            dateOfBirth: res.data.user.dateOfBirth ? new Date(res.data.user.dateOfBirth).toISOString().split('T')[0] : ''
          });
          if (res.data.user.notificationPreferences) {
            setNotifPrefs(res.data.user.notificationPreferences);
          }
        }
      }
    } catch (err) {
      console.warn('Could not load profile stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const showSuccess = (msg) => {
    setNotification(msg);
    setErrorMsg(null);
    setTimeout(() => setNotification(null), 4000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setNotification(null);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showError('Please enter your full name');
      return;
    }
    try {
      setSavingProfile(true);
      const res = await updateProfile(profileForm);
      if (res.success) {
        showSuccess('Profile information updated successfully!');
        fetchProfileStats();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      showError('Please enter your current password');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showError('New password must be at least 6 characters long');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    try {
      setChangingPass(true);
      const res = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (res.success) {
        showSuccess('Password updated successfully! Please keep it secure.');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to change password. Check your current password.');
    } finally {
      setChangingPass(false);
    }
  };

  // Handle Address Save (Add or Edit)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street.trim() || !addressForm.city.trim() || !addressForm.zipCode.trim()) {
      showError('Please fill out street, city, and zip code');
      return;
    }

    try {
      setSavingAddress(true);
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
        showSuccess('Delivery address updated successfully');
      } else {
        await addAddress(addressForm);
        showSuccess('New delivery address added successfully');
      }
      setAddressModalOpen(false);
      setEditingAddressId(null);
      fetchProfileStats();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save delivery address');
    } finally {
      setSavingAddress(false);
    }
  };

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      tag: 'Home',
      street: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560038',
      country: 'India',
      phone: user?.phone || '+91 98450 12345',
      isDefault: false
    });
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      tag: addr.tag || 'Home',
      street: addr.street || '',
      city: addr.city || 'Bengaluru',
      state: addr.state || 'Karnataka',
      zipCode: addr.zipCode || '560038',
      country: addr.country || 'India',
      phone: addr.phone || user?.phone || '',
      isDefault: !!addr.isDefault
    });
    setAddressModalOpen(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(id);
      showSuccess('Address deleted successfully');
      fetchProfileStats();
    } catch (err) {
      showError('Failed to remove address');
    }
  };

  // Handle Notification Preferences Save
  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      setSavingPrefs(true);
      const res = await updateProfile({ notificationPreferences: notifPrefs });
      if (res.success) {
        showSuccess('Notification preferences updated!');
      }
    } catch (err) {
      showError('Failed to update notification settings');
    } finally {
      setSavingPrefs(false);
    }
  };

  // Handle Reward Points Redemption
  const handleRedeemReward = async (reward) => {
    const currentPts = statsData?.rewardPoints || 0;
    if (currentPts < reward.pointsCost) {
      showError(`You need ${reward.pointsCost} points for this voucher. You currently have ${currentPts} points.`);
      return;
    }

    try {
      setRedeemingId(reward.id);
      const res = await API.post('/auth/rewards/redeem', {
        rewardId: reward.id,
        pointsCost: reward.pointsCost,
        title: reward.title,
        discountAmount: reward.discountAmount,
        discountPercentage: reward.discountPercentage
      });

      if (res.data.success) {
        setRedeemedCode(res.data.couponCode);
        showSuccess(`🎉 Congratulations! Code ${res.data.couponCode} is now active.`);
        fetchProfileStats();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Redemption failed. Please try again.');
    } finally {
      setRedeemingId(null);
    }
  };

  const copyVoucherToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Quick stats extraction
  const totalOrders = statsData?.totalOrders ?? 0;
  const completedOrders = statsData?.completedOrders ?? 0;
  const totalSpent = statsData?.totalSpent ?? 0;
  const rewardPoints = statsData?.rewardPoints ?? 250;
  const favoriteFood = statsData?.favoriteFood ?? 'Chicken Dum Biryani';
  const favoriteRestaurant = statsData?.favoriteRestaurant ?? 'Royal Biryani House';
  const reviewsCount = statsData?.reviewsCount ?? 0;
  const avgRating = statsData?.avgRatingGiven ?? 5.0;
  const membershipTier = statsData?.membershipTier ?? 'Bronze Starter';
  const profileCompletion = statsData?.profileCompletion ?? 75;
  const recentOrders = statsData?.recentOrders ?? [];
  const rewardsHistory = statsData?.rewardsHistory ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. HERO PROFILE BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={user?.avatar || PRESET_AVATARS[0]}
                alt={user?.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-orange-500/50 shadow-md shadow-orange-500/20"
              />
              <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                {membershipTier.split(' ')[0]}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                  {user?.name || 'TastyBite Foodie'}
                </h1>
                <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  {membershipTier}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-stone-400" />{user?.email}</span>
                {user?.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-stone-400" />{user.phone}</span>
                )}
                <span className="text-stone-400 text-xs">
                  • Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2026'}
                </span>
              </p>
              <p className="text-[11px] text-orange-200/80 pt-0.5 italic">
                "Good Food, Just a Bite Away."
              </p>
            </div>
          </div>

          {/* Quick Metrics Capsule in Hero */}
          <div className="w-full md:w-auto flex items-center justify-between sm:justify-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Rewards</span>
              <span className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {rewardPoints} pts
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Completed</span>
              <span className="text-xl font-black text-emerald-400">
                {completedOrders} Orders
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Total Spent</span>
              <span className="text-xl font-black text-white">
                {formatCurrency(totalSpent)}
              </span>
            </div>
          </div>

        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-stone-300">Profile Completion:</span>
            <div className="w-40 sm:w-56 h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <span className="font-black text-emerald-400">{profileCompletion}%</span>
          </div>
          {profileCompletion < 100 && (
            <button
              onClick={() => switchTab('settings')}
              className="text-orange-400 hover:text-orange-300 font-semibold underline text-left sm:text-right cursor-pointer"
            >
              Complete full profile (+{100 - profileCompletion}% to unlock VIP status)
            </button>
          )}
        </div>
      </div>

      {/* ALERT NOTIFICATIONS */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-xs font-bold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:underline">Dismiss</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-900 text-xs font-bold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:underline">Dismiss</button>
        </div>
      )}

      {/* 2. DASHBOARD TABS NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'orders', label: 'My Orders', icon: ShoppingBag, count: totalOrders },
          { id: 'rewards', label: 'Rewards & Points', icon: Award, count: `${rewardPoints} pts` },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin, count: user?.addresses?.length },
          { id: 'favorites', label: 'Favorites', icon: Heart, count: user?.wishlist?.length },
          { id: 'settings', label: 'Account Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                  : 'bg-white text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ml-0.5 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENTS */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          
          {/* Dynamic Stat Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-stone-400 tracking-wider block">
                  Total Orders
                </span>
                <span className="text-2xl font-black text-stone-900 font-display mt-0.5 block">
                  {totalOrders}
                </span>
                <span className="text-[11px] text-emerald-600 font-bold">
                  {completedOrders} completed
                </span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-stone-400 tracking-wider block">
                  Total Spent
                </span>
                <span className="text-2xl font-black text-stone-900 font-display mt-0.5 block">
                  {formatCurrency(totalSpent)}
                </span>
                <span className="text-[11px] text-stone-400">
                  Lifetime culinary spend
                </span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-stone-400 tracking-wider block">
                  Favorite Dish
                </span>
                <span className="text-sm font-extrabold text-stone-900 line-clamp-1 mt-0.5 block" title={favoriteFood}>
                  {favoriteFood}
                </span>
                <span className="text-[11px] text-orange-600 font-bold">
                  Most frequently ordered
                </span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Utensils className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-stone-400 tracking-wider block">
                  TastyBite Points
                </span>
                <span className="text-2xl font-black text-amber-500 font-display mt-0.5 block">
                  {rewardPoints}
                </span>
                <button
                  onClick={() => switchTab('rewards')}
                  className="text-[11px] text-orange-600 hover:underline font-bold cursor-pointer"
                >
                  Redeem for vouchers →
                </button>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Quick Shortcuts Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => switchTab('orders')}
              className="bg-white hover:bg-orange-50/50 p-4 rounded-2xl border border-stone-200 text-left transition-all group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between text-orange-600 mb-1">
                <ShoppingBag className="w-5 h-5" />
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">Order History</h4>
              <p className="text-[10px] text-stone-400">View & track past deliveries</p>
            </button>

            <button
              onClick={() => switchTab('addresses')}
              className="bg-white hover:bg-orange-50/50 p-4 rounded-2xl border border-stone-200 text-left transition-all group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between text-blue-600 mb-1">
                <MapPin className="w-5 h-5" />
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">Saved Addresses</h4>
              <p className="text-[10px] text-stone-400">Manage delivery locations</p>
            </button>

            <button
              onClick={() => switchTab('favorites')}
              className="bg-white hover:bg-orange-50/50 p-4 rounded-2xl border border-stone-200 text-left transition-all group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between text-rose-600 mb-1">
                <Heart className="w-5 h-5" />
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">Wishlist Foods</h4>
              <p className="text-[10px] text-stone-400">Quick reorder your favorites</p>
            </button>

            <button
              onClick={() => switchTab('rewards')}
              className="bg-white hover:bg-orange-50/50 p-4 rounded-2xl border border-stone-200 text-left transition-all group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between text-amber-500 mb-1">
                <Gift className="w-5 h-5" />
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">Redeem Rewards</h4>
              <p className="text-[10px] text-stone-400">Convert points to discounts</p>
            </button>
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  Recent Orders
                </h3>
                <p className="text-xs text-stone-400">Your latest food orders dynamically pulled from MongoDB</p>
              </div>
              <button
                onClick={() => switchTab('orders')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                View All Orders ({totalOrders}) →
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-stone-800 text-sm">No Orders Yet</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Explore top restaurants in your area and place your first delicious TastyBite order!
                </p>
                <Link
                  to="/menu"
                  className="inline-block bg-orange-600 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-sm"
                >
                  Explore Delicious Menu
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {recentOrders.map((ord) => (
                  <div key={ord._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={ord.restaurant?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&q=80'}
                        alt={ord.restaurant?.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">
                            {ord.restaurant?.name || 'TastyBite Partner'}
                          </h4>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            ord.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {ord.orderStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          Order #{ord.orderNumber} • {ord.items?.length} items • {new Date(ord.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="font-black text-stone-900 text-sm">
                        {formatCurrency(ord.totalAmount)}
                      </span>
                      <Link
                        to={`/track/${ord._id}`}
                        className="bg-stone-100 hover:bg-orange-50 text-stone-700 hover:text-orange-600 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-stone-200 transition-colors"
                      >
                        Track Status
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-stone-900 font-display">My Order History</h2>
              <p className="text-xs text-stone-500">Track current orders, download tax invoices, and reorder</p>
            </div>
            <Link
              to="/menu"
              className="bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
            >
              Order Something Fresh
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
              <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-bold text-stone-800 text-sm">No Orders Placed Yet</h3>
              <p className="text-xs text-stone-500">All your food delivery receipts will be archived here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((ord) => (
                <div key={ord._id} className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-400 block">
                        Order #{ord.orderNumber} • {new Date(ord.createdAt).toLocaleString()}
                      </span>
                      <h3 className="font-extrabold text-stone-900 text-base">{ord.restaurant?.name || 'Partner Kitchen'}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs bg-stone-100 text-stone-700 px-2 py-1 rounded-md font-semibold">
                        Paid via {ord.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="space-y-1.5 text-xs">
                    {ord.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-stone-700">
                        <span>{item.quantity}x {item.name || item.food?.name}</span>
                        <span className="font-mono font-bold">{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase font-bold">Total Paid</span>
                      <span className="text-base font-black text-orange-600">{formatCurrency(ord.totalAmount)}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/track/${ord._id}`}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors"
                      >
                        Live Tracking
                      </Link>
                      <button
                        type="button"
                        onClick={() => downloadInvoice(ord._id, ord.orderNumber)}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-orange-600" />
                        Tax Invoice PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REWARDS & POINTS */}
      {activeTab === 'rewards' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          
          {/* Rewards Status Banner */}
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-black/20 text-yellow-100 text-xs font-bold px-3 py-1 rounded-full border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>TastyBite Loyalty Program</span>
              </div>
              <h2 className="text-3xl font-black font-display tracking-tight text-white">
                You have {rewardPoints} Reward Points
              </h2>
              <p className="text-xs text-amber-100 max-w-lg">
                Earn 10 points for every ₹100 spent on TastyBite, 50 points for every restaurant review, and 100 points for hosting group feast orders!
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center w-full md:w-auto">
              <span className="text-[10px] uppercase font-extrabold tracking-wider block text-yellow-200">Current Status</span>
              <span className="text-xl font-black text-white block mt-0.5">{membershipTier}</span>
              <span className="text-[11px] text-amber-100 mt-1 block">Tier perks active on every checkout</span>
            </div>
          </div>

          {/* Redeemed Voucher Notification */}
          {redeemedCode && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 space-y-3 shadow-md animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Your Discount Coupon is Ready!
                </span>
                <button
                  onClick={() => setRedeemedCode(null)}
                  className="text-xs text-stone-400 hover:text-stone-600 font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-emerald-200">
                <div>
                  <span className="font-mono text-lg font-black text-emerald-700 tracking-wider">
                    {redeemedCode}
                  </span>
                  <p className="text-[11px] text-stone-500">Apply this code on the cart or checkout page for an instant discount.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyVoucherToClipboard(redeemedCode)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <Link
                    to="/cart"
                    className="bg-stone-900 hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs"
                  >
                    Use in Cart →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Available Rewards Catalog */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <Gift className="w-4 h-4 text-orange-600" />
                Redeemable Coupons & Vouchers
              </h3>
              <p className="text-xs text-stone-500">Choose a reward to convert your points into active MongoDB promo coupons.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REWARDS_CATALOG.map((rew) => {
                const Icon = rew.icon;
                const canRedeem = rewardPoints >= rew.pointsCost;
                const isRedeeming = redeemingId === rew.id;

                return (
                  <div
                    key={rew.id}
                    className={`bg-white rounded-3xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 shadow-xs ${
                      canRedeem ? 'border-amber-200 hover:border-amber-400' : 'border-stone-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-stone-900 text-sm">{rew.title}</h4>
                            <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              {rew.badge}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{rew.desc}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block">Cost</span>
                        <span className="font-black text-amber-600 text-sm flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          {rew.pointsCost} Points
                        </span>
                      </div>

                      <button
                        onClick={() => handleRedeemReward(rew)}
                        disabled={!canRedeem || isRedeeming}
                        className={`text-xs font-extrabold px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          canRedeem
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20'
                            : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        {isRedeeming ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : canRedeem ? (
                          'Redeem Voucher'
                        ) : (
                          `Need ${rew.pointsCost - rewardPoints} more pts`
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points History Ledger */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-500" />
              Points Activity History
            </h3>

            {rewardsHistory.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6">No points transactions recorded yet.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {rewardsHistory.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-800 block">{item.description}</span>
                      <span className="text-[10px] text-stone-400">
                        {item.date ? new Date(item.date).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <span className={`font-mono font-black text-sm ${
                      item.type === 'REDEEMED' ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {item.points > 0 ? `+${item.points}` : item.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 4: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-stone-900 font-display">Saved Delivery Addresses</h2>
              <p className="text-xs text-stone-500">Manage home, office, and hostel addresses for rapid 1-click checkout</p>
            </div>
            <button
              onClick={openAddAddressModal}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {(!user?.addresses || user.addresses.length === 0) ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
              <MapPin className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-bold text-stone-800 text-sm">No Addresses Saved</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Add your home or office address to speed up your order checkouts.
              </p>
              <button
                onClick={openAddAddressModal}
                className="bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`bg-white rounded-3xl p-5 border-2 transition-all flex flex-col justify-between space-y-3 shadow-xs ${
                    addr.isDefault ? 'border-orange-500 bg-orange-50/10' : 'border-stone-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {addr.tag || 'Home'}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-black uppercase bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          Default Address
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-stone-900 leading-relaxed pt-1">
                      {addr.street}
                    </p>
                    <p className="text-xs text-stone-500">
                      {addr.city}, {addr.state} - {addr.zipCode}
                    </p>
                    <p className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-stone-400" />
                      {addr.phone}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => openEditAddressModal(addr)}
                      className="font-bold text-stone-600 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    <div className="flex items-center gap-3">
                      {!addr.isDefault && (
                        <button
                          onClick={async () => {
                            try {
                              await updateAddress(addr._id, { ...addr, isDefault: true });
                              showSuccess('Set as default address');
                              fetchProfileStats();
                            } catch (e) {
                              showError('Failed to set default');
                            }
                          }}
                          className="font-bold text-orange-600 hover:underline cursor-pointer"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: FAVORITES / WISHLIST */}
      {activeTab === 'favorites' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div>
            <h2 className="text-xl font-black text-stone-900 font-display">My Wishlist & Favorites</h2>
            <p className="text-xs text-stone-500">Your hand-picked dishes from top local partner kitchens</p>
          </div>

          {(!user?.wishlist || user.wishlist.length === 0) ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
              <Heart className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-bold text-stone-800 text-sm">Your Wishlist is Empty</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Click the heart icon on any mouth-watering dish while browsing the menu to save it here!
              </p>
              <Link
                to="/menu"
                className="inline-block bg-orange-600 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs"
              >
                Browse Tasty Dishes
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {user.wishlist.map((food) => {
                if (!food || typeof food === 'string') return null;
                return (
                  <div key={food._id} className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs flex flex-col justify-between">
                    <div className="relative h-44">
                      <img
                        src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'}
                        alt={food.name}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-3 left-3 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        food.isVeg ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}>
                        {food.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-sm line-clamp-1">{food.name}</h4>
                        <p className="text-xs text-stone-500 line-clamp-1">{food.restaurant?.name || 'TastyBite Kitchen'}</p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="font-black text-orange-600 text-base">{formatCurrency(food.price)}</span>
                        <button
                          onClick={() => {
                            addToCart(food, 1);
                            showSuccess(`Added "${food.name}" to your cart!`);
                          }}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: ACCOUNT SETTINGS & SECURITY */}
      {activeTab === 'settings' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 6 Cols: Edit Profile Form */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-600" />
                  Edit Personal Information
                </h3>
                <p className="text-xs text-stone-400">Update your public profile details</p>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 block mb-2">
                  Choose Profile Avatar
                </label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {PRESET_AVATARS.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="Preset"
                      onClick={() => setProfileForm(p => ({ ...p, avatar: av }))}
                      className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 transition-all ${
                        profileForm.avatar === av ? 'border-orange-600 scale-110 shadow-sm' : 'border-stone-200 hover:border-orange-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-800 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Email Address (Verified)</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-stone-100 border border-stone-200 rounded-xl p-2.5 font-mono text-stone-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">Contact support if you need to alter your registered email.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98450 12345"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-800 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) => setProfileForm(p => ({ ...p, dateOfBirth: e.target.value }))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-800 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Custom Avatar Image URL</label>
                  <input
                    type="url"
                    value={profileForm.avatar}
                    onChange={(e) => setProfileForm(p => ({ ...p, avatar: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-stone-800 focus:outline-none focus:border-orange-500 text-[11px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3 rounded-2xl shadow-md shadow-orange-600/20 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Profile Changes</span>
                </button>
              </form>
            </div>

            {/* Right 6 Cols: Security & Password */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Change Password Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-600" />
                    Security & Change Password
                  </h3>
                  <p className="text-xs text-stone-400">Ensure your account remains safe with a strong password</p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-800 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">New Password (min. 6 chars)</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-800 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-bold text-stone-800 focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={changingPass}
                    className="w-full bg-stone-900 hover:bg-black text-white font-extrabold py-3 rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {changingPass ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Update Password</span>
                  </button>
                </form>
              </div>

              {/* Notification Preferences */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" />
                    Notification Preferences
                  </h3>
                  <p className="text-xs text-stone-400">Control which alerts you receive from TastyBite</p>
                </div>

                <form onSubmit={handleSavePreferences} className="space-y-3 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <div>
                      <span className="font-bold text-stone-800 block">Order Status Updates</span>
                      <span className="text-[11px] text-stone-400">Live WebSockets, SMS, & push notifications</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs.orderUpdates}
                      onChange={(e) => setNotifPrefs(p => ({ ...p, orderUpdates: e.target.checked }))}
                      className="w-4 h-4 accent-orange-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <div>
                      <span className="font-bold text-stone-800 block">Promotions & Vouchers</span>
                      <span className="text-[11px] text-stone-400">Discounts and weekly promo codes</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs.promotionalOffers}
                      onChange={(e) => setNotifPrefs(p => ({ ...p, promotionalOffers: e.target.checked }))}
                      className="w-4 h-4 accent-orange-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <div>
                      <span className="font-bold text-stone-800 block">Email Invoices & Receipts</span>
                      <span className="text-[11px] text-stone-400">Automatically receive PDF receipts via email</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifPrefs.emailReceipts}
                      onChange={(e) => setNotifPrefs(p => ({ ...p, emailReceipts: e.target.checked }))}
                      className="w-4 h-4 accent-orange-600"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={savingPrefs}
                    className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-2.5 rounded-xl border border-stone-300 transition-colors cursor-pointer"
                  >
                    Save Notification Preferences
                  </button>
                </form>
              </div>

              {/* Danger Zone / Logout */}
              <div className="bg-rose-50/60 rounded-3xl p-6 border border-rose-200 space-y-3">
                <h4 className="font-extrabold text-rose-900 text-sm">Account Session</h4>
                <p className="text-xs text-rose-700">Sign out of your current device session securely.</p>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of TastyBite
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 4. ADDRESS MODAL (ADD / EDIT) */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-stone-900 text-base">
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Address Label / Tag</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Home', 'Office', 'Hostel', 'Other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAddressForm(a => ({ ...a, tag: t }))}
                      className={`py-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        addressForm.tag === t
                          ? 'border-orange-600 bg-orange-50 text-orange-700'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Street Address / Flat / Floor</label>
                <input
                  type="text"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm(a => ({ ...a, street: e.target.value }))}
                  placeholder="e.g. 102 Green Heights, 12th Main Road"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-800 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(a => ({ ...a, city: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-800 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm(a => ({ ...a, state: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-800 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">PIN / Zip Code</label>
                  <input
                    type="text"
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm(a => ({ ...a, zipCode: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-800 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Delivery Contact Phone</label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm(a => ({ ...a, phone: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 font-semibold text-stone-800 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm(a => ({ ...a, isDefault: e.target.checked }))}
                  className="w-4 h-4 accent-orange-600 rounded"
                />
                <span className="font-bold text-stone-700">Set as my default delivery address</span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
