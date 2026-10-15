import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Shield,
  Users,
  CreditCard,
  Sparkles,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Flame,
  Award,
  Heart,
  ShoppingBag,
  ExternalLink,
  Store,
  UserCheck,
  Receipt
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../services/api';

const PortalHub = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { totalCount, grandTotal } = useCart();
  const navigate = useNavigate();

  const [activeOrder, setActiveOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLatestOrder();
    } else {
      setLoadingOrder(false);
    }
  }, [isAuthenticated]);

  const fetchLatestOrder = async () => {
    try {
      const res = await API.get('/orders/my-orders');
      if (res.data.success && res.data.orders?.length > 0) {
        // Find in-flight order first, or most recent
        const inFlight = res.data.orders.find(o =>
          ['ORDER_PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
        );
        setActiveOrder(inFlight || res.data.orders[0]);
      }
    } catch (e) {
      console.error('Failed to load active order', e);
    } finally {
      setLoadingOrder(false);
    }
  };

  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'ORDER_PLACED':
      case 'CONFIRMED':
        return 0;
      case 'PREPARING':
      case 'READY':
        return 1;
      case 'OUT_FOR_DELIVERY':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 1;
    }
  };

  const currentStep = activeOrder ? getStatusStepIndex(activeOrder.orderStatus) : 1;

  const trackingSteps = [
    { label: 'Confirmed' },
    { label: 'Preparing' },
    { label: 'Out for Delivery' },
    { label: 'Delivered' }
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-white selection:bg-orange-500 selection:text-white">
      
      {/* 1. TOP HERO PORTAL BANNER */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pb-20 border-b border-stone-800/80 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
        
        {/* Ambient Glowing Radial Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          
          {/* Brand Pill */}
          <div className="inline-flex items-center gap-2 bg-stone-900/90 border border-orange-500/30 text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-orange-950/40">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
            <span>Good Food, Just a Bite Away.</span>
          </div>

          {/* Main Welcome Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display">
            Welcome to <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500 bg-clip-text text-transparent">TastyBite</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-stone-400 max-w-2xl mx-auto leading-relaxed">
            {isAuthenticated ? (
              <>
                Hello, <strong className="text-white">{user?.name || 'Foodie'}</strong>! Select your portal below to get started, manage shared carts, or explore our premium dining features.
              </>
            ) : (
              'Select your portal below to get started, or explore our premium features.'
            )}
          </p>

          {/* User Quick Status Chip if Authenticated */}
          {isAuthenticated && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
              <span className="bg-stone-900 border border-stone-800 px-3.5 py-1.5 rounded-full text-stone-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Active Session: <strong>{user?.email}</strong>
              </span>
              <span className="bg-stone-900 border border-stone-800 px-3.5 py-1.5 rounded-full text-stone-300">
                Role: <strong className="capitalize text-orange-400">{user?.role || 'Customer'}</strong>
              </span>
              {totalCount > 0 && (
                <Link
                  to="/cart"
                  className="bg-orange-600/20 border border-orange-500/40 px-3.5 py-1.5 rounded-full text-orange-300 hover:bg-orange-600 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Cart: <strong>{totalCount} items</strong>
                </Link>
              )}
            </div>
          )}

          {/* Quick Access Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/menu"
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-orange-900/40 transition-all flex items-center gap-2 group"
            >
              <span>Explore Food Menu (14 Categories)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/"
              className="bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all"
            >
              Browse Discovery Home
            </Link>
          </div>

        </div>
      </section>

      {/* 2. THE 6 PRIMARY PORTALS GRID */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* CARD 1: CUSTOMER PORTAL */}
          <Link
            to="/menu"
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-orange-500/60 rounded-3xl p-7 transition-all duration-300 shadow-xl hover:shadow-orange-950/20 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                  ORDER FOOD
                </span>
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-orange-400 transition-colors font-display">
                  Customer Portal
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 mt-2 leading-relaxed">
                  Browse local restaurants, explore our 14 official categories, place orders, create shared carts, and enjoy fast doorstep delivery.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-800/80 flex items-center justify-between text-xs font-bold text-orange-400">
              <span>Enter Customer Portal</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* CARD 2: ADMIN PORTAL */}
          <Link
            to={isAdmin ? '/admin/dashboard' : '/login'}
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-purple-500/60 rounded-3xl p-7 transition-all duration-300 shadow-xl hover:shadow-purple-950/20 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                  MANAGEMENT
                </span>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors font-display">
                    Admin Portal
                  </h3>
                  {isAdmin ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Authorized
                    </span>
                  ) : (
                    <span className="text-[10px] bg-stone-800 text-stone-400 font-bold px-2 py-0.5 rounded-full">
                      Admin Login Req.
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-stone-400 mt-2 leading-relaxed">
                  Manage menu items, view real-time sales analytics, dispatch orders, update inventory prices, and oversee restaurant activities.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-800/80 flex items-center justify-between text-xs font-bold text-purple-400">
              <span>{isAdmin ? 'Launch Admin Console' : 'Sign in as Admin (admin@tastybite.com)'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* CARD 3: GROUP ORDERING */}
          <Link
            to="/group-orders"
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-teal-500/60 rounded-3xl p-7 transition-all duration-300 shadow-xl hover:shadow-teal-950/20 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
                  SOCIAL EATING
                </span>
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-teal-400 transition-colors font-display">
                  Group Ordering
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 mt-2 leading-relaxed">
                  Create shared carts with family and friends. Order together seamlessly, combine deliveries into one order, and avoid duplicate fees.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-800/80 flex items-center justify-between text-xs font-bold text-teal-400">
              <span>Start or Join a Group Feast</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* CARD 4: SMART SPLIT BILL */}
          <Link
            to="/group-orders"
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/60 rounded-3xl p-7 transition-all duration-300 shadow-xl hover:shadow-amber-950/20 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                  PAYMENTS
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors font-display">
                  Smart Split Bill
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 mt-2 leading-relaxed">
                  Split the cost of your group meals effortlessly. Automated itemized calculation, proportional tax/delivery shares, and Razorpay checkouts.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-800/80 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Explore Automated Split Billing</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* CARD 5: AI RECOMMENDATION */}
          <Link
            to="/smart-picks"
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-rose-500/60 rounded-3xl p-7 transition-all duration-300 shadow-xl hover:shadow-rose-950/20 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full">
                  AI ASSISTANT
                </span>
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-rose-400 transition-colors font-display">
                  TastyBite Smart Picks AI
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 mt-2 leading-relaxed">
                  Feeling indecisive? Tell us your mood, spice affinity, or hunger level, and let our intelligent flavor algorithm recommend the perfect dish.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-800/80 flex items-center justify-between text-xs font-bold text-rose-400">
              <span>Get AI Recommendation</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* CARD 6: REAL-TIME ORDER TRACKING */}
          <Link
            to={activeOrder ? `/order-tracking/${activeOrder._id}` : '/orders'}
            className="group relative bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-blue-500/60 rounded-3xl p-7 transition-all duration-300 shadow-xl hover:shadow-blue-950/20 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                  ORDER STATUS
                </span>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Truck className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors font-display">
                  Real-Time Order Tracking
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 mt-2 leading-relaxed">
                  Track your order status in real time from confirmation to delivery with live WebSocket status updates and estimated delivery time (ETA).
                </p>

                {/* Interactive Status Timeline Strip */}
                <div className="mt-5 p-4 rounded-2xl bg-stone-950/70 border border-stone-800/90 space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-stone-400">
                    {trackingSteps.map((step, idx) => (
                      <span
                        key={step.label}
                        className={idx <= currentStep ? 'text-orange-400 font-extrabold' : 'text-stone-600'}
                      >
                        {step.label}
                      </span>
                    ))}
                  </div>

                  <div className="relative flex items-center">
                    <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500"
                        style={{ width: `${((currentStep + 1) / trackingSteps.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {activeOrder && (
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-stone-300">
                        Order <strong>{activeOrder.orderNumber}</strong>
                      </span>
                      <span className="text-emerald-400 font-bold capitalize">
                        ● {activeOrder.orderStatus?.replace('_', ' ').toLowerCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-800/80 flex items-center justify-between text-xs font-bold text-blue-400">
              <span>{activeOrder ? 'View Live Order Progress' : 'View Order History'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

        </div>
      </section>

      {/* 3. FOUR VALUE PROPS HIGHLIGHTS */}
      <section className="bg-stone-900/60 border-t border-b border-stone-800 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Prop 1 */}
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Fast Food Delivery</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Get fresh, piping hot meals delivered to your doorstep in record time.
              </p>
            </div>

            {/* Prop 2 */}
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Secure Online Payment</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Pay with confidence using our multiple encrypted secure payment options & Razorpay.
              </p>
            </div>

            {/* Prop 3 */}
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Smart Split Bill</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Easily split orders and bills with friends for hassle-free group dining.
              </p>
            </div>

            {/* Prop 4 */}
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800/80 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                <Headphones className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">24/7 Customer Support</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                We are here to help you anytime, day or night, with dedicated care & WhatsApp.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FOOTER CALL TO ACTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center space-y-6">
        <h3 className="text-2xl font-black text-white font-display">
          Ready to satisfy your cravings?
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/menu"
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md"
          >
            Open Full Menu
          </Link>
          <Link
            to="/restaurants"
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all"
          >
            View Partner Restaurants
          </Link>
          <Link
            to="/contact"
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all"
          >
            Contact Support & WhatsApp
          </Link>
        </div>
      </section>

    </div>
  );
};

export default PortalHub;
