import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Store,
  Users,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  Gift,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import API from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    restaurant,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    deliveryFee,
    discount,
    grandTotal,
    totalCount,
    coupon,
    applyCouponCode,
    removeCoupon
  } = useCart();

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAllCoupons, setShowAllCoupons] = useState(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await API.get('/coupons');
        if (res.data?.success && Array.isArray(res.data.coupons)) {
          setAvailableCoupons(res.data.coupons);
        }
      } catch (err) {
        console.warn('Failed to fetch coupons:', err.message);
      }
    };
    fetchCoupons();
  }, []);

  const handleApplyCouponCode = async (codeToApply) => {
    if (!codeToApply || !codeToApply.trim()) return;
    setApplying(true);
    setCouponError(null);
    setCouponMessage(null);

    const res = await applyCouponCode(codeToApply.trim());
    if (res.success) {
      setCouponMessage(res.message);
      setPromoCodeInput('');
    } else {
      setCouponError(res.message);
    }
    setApplying(false);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    handleApplyCouponCode(promoCodeInput);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
          Looks like you haven't added any delicious food to your cart yet. Explore our restaurant menus to get started!
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/menu"
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer"
          >
            Explore Menu Dishes
          </Link>
          <Link
            to="/group-orders"
            className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4 text-teal-600" />
            <span>Join a Group Feast</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
            Order Review
          </span>
          <h1 className="text-3xl font-black text-stone-900 font-display">
            Your Cart ({totalCount} {totalCount === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Restaurant Header */}
          {restaurant && (
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">{restaurant.name}</h3>
                  <span className="text-xs text-stone-400">{restaurant.location?.area || 'Bangalore'}</span>
                </div>
              </div>
              <Link
                to={`/restaurant/${restaurant._id}`}
                className="text-xs font-bold text-orange-600 hover:text-orange-700"
              >
                + Add More
              </Link>
            </div>
          )}

          {/* Items Box */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
            {cartItems.map((item) => {
              const itemTotal = item.price * item.quantity;
              return (
                <div key={item.food._id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  
                  {/* Food Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={item.food.image}
                      alt={item.food.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 bg-stone-100"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${item.food.isVeg ? 'border-emerald-600' : 'border-rose-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 uppercase">
                          {item.food.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm sm:text-base truncate">
                        {item.food.name}
                      </h4>
                      <span className="text-xs text-stone-500 font-semibold block">
                        {formatCurrency(item.price)} each
                      </span>
                    </div>
                  </div>

                  {/* Actions & Total */}
                  <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                    
                    {/* Stepper */}
                    <div className="flex items-center bg-stone-100 rounded-xl overflow-hidden border border-stone-200">
                      <button
                        onClick={() => updateQuantity(item.food._id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 font-bold text-xs text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.food._id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[70px]">
                      <span className="font-black text-stone-900 text-sm sm:text-base block">
                        {formatCurrency(itemTotal)}
                      </span>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeFromCart(item.food._id)}
                      className="text-stone-300 hover:text-rose-600 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Group Order Callout in Cart */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-teal-700 shrink-0" />
              <div>
                <h4 className="font-bold text-teal-900 text-xs sm:text-sm">Ordering with colleagues or roommates?</h4>
                <p className="text-[11px] text-teal-700">Turn this into a TastyBite Group Feast to let others add items and split bill automatically.</p>
              </div>
            </div>
            <Link
              to="/group-orders"
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shrink-0"
            >
              Start Group Order
            </Link>
          </div>

        </div>

        {/* Right Column: Promo & Bill Summary */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Promo Code Box */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-600" />
              Have a Promo Coupon?
            </h3>

            {coupon ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-emerald-900 text-sm font-mono">{coupon.code}</span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-0.5">{coupon.description}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  placeholder="Try TASTY50 or BITE100..."
                  className="flex-1 bg-stone-100 text-stone-800 uppercase font-mono text-xs rounded-xl px-3.5 py-2.5 border border-stone-200 focus:outline-none focus:border-orange-500 font-bold"
                />
                <button
                  type="submit"
                  disabled={applying || !promoCodeInput.trim()}
                  className="bg-stone-900 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && (
              <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {couponError}
              </p>
            )}
            {couponMessage && (
              <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                {couponMessage}
              </p>
            )}

            {/* Available Coupons Drawer */}
            {availableCoupons.length > 0 && (
              <div className="pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Available Coupons ({availableCoupons.length})
                  </span>
                  {availableCoupons.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllCoupons(!showAllCoupons)}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer"
                    >
                      {showAllCoupons ? 'Show Less' : `View All (${availableCoupons.length})`}
                      {showAllCoupons ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {(showAllCoupons ? availableCoupons : availableCoupons.slice(0, 3)).map((item) => {
                    const isCurrent = coupon?.code === item.code;
                    const meetsMin = subtotal >= (item.minOrderAmount || 0);

                    return (
                      <div
                        key={item._id || item.code}
                        className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                          isCurrent
                            ? 'bg-emerald-50/80 border-emerald-300'
                            : meetsMin
                            ? 'bg-stone-50 hover:bg-orange-50/40 border-stone-200 hover:border-orange-200'
                            : 'bg-stone-50/50 border-stone-200/60 opacity-70'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-stone-900 font-mono tracking-wider bg-white px-2 py-0.5 rounded-md border border-stone-200">
                              {item.code}
                            </span>
                            {item.discountPercentage > 0 && (
                              <span className="text-[10px] font-extrabold text-orange-600 bg-orange-100/70 px-1.5 py-0.5 rounded">
                                {item.discountPercentage}% OFF
                              </span>
                            )}
                            {item.flatDiscount > 0 && (
                              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                                ₹{item.flatDiscount} OFF
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600 mt-1 truncate">
                            {item.description}
                          </p>
                          {item.minOrderAmount > 0 && (
                            <span className="text-[10px] text-stone-400 block mt-0.5">
                              {meetsMin
                                ? `Min order: ${formatCurrency(item.minOrderAmount)}`
                                : `Add ${formatCurrency(item.minOrderAmount - subtotal)} more to unlock`}
                            </span>
                          )}
                        </div>

                        <div>
                          {isCurrent ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Applied
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApplyCouponCode(item.code)}
                              disabled={applying || !meetsMin}
                              className={`text-[11px] font-extrabold px-3 py-1 rounded-xl transition-all cursor-pointer ${
                                meetsMin
                                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
                                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                              }`}
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bill Summary Box */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-stone-900 text-base font-display">
              Bill Breakdown
            </h3>

            <div className="space-y-2.5 text-xs text-stone-600 border-b border-stone-100 pb-4">
              <div className="flex items-center justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-stone-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Fee {subtotal >= 500 && <strong className="text-emerald-600 font-bold">(FREE)</strong>}</span>
                <span className="font-bold text-stone-800">
                  {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Taxes & GST (5%)</span>
                <span className="font-bold text-stone-800">{formatCurrency(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-black text-stone-900 text-lg sm:text-xl block">
                  Grand Total
                </span>
                <span className="text-[10px] text-stone-400 font-medium">Inclusive of all taxes</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-orange-600 font-display">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg shadow-orange-500/25 transition-all hover:scale-101 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Encrypted 256-bit Checkout</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Cart;
