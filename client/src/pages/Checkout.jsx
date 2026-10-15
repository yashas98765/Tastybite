import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  Banknote,
  Wallet,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../services/api';
import { formatCurrency } from '../utils/formatters';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, addAddress } = useAuth();
  const {
    cartItems,
    restaurant,
    subtotal,
    tax,
    deliveryFee,
    discount,
    grandTotal,
    coupon,
    clearCart,
    deliveryInstructions,
    setDeliveryInstructions
  } = useCart();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New address form state
  const [newAddr, setNewAddr] = useState({
    street: '',
    city: 'Bangalore',
    state: 'Karnataka',
    zipCode: '560103',
    country: 'India',
    phone: user?.phone || '+91 98450 67890',
    tag: 'Home',
    isDefault: false
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-orange-600 mx-auto" />
        <h2 className="text-2xl font-bold text-stone-900">Sign in to Checkout</h2>
        <p className="text-xs text-stone-500">
          Please log in to your TastyBite account to select delivery addresses and place your order.
        </p>
        <Link
          to="/login?redirect=/checkout"
          className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md"
        >
          Login to Continue
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Your Cart is Empty</h2>
        <p className="text-xs text-stone-500">Add dishes before proceeding to checkout.</p>
        <Link to="/menu" className="inline-block bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl">
          Browse Menu
        </Link>
      </div>
    );
  }

  const addresses = user?.addresses || [];
  const activeAddress = addresses[selectedAddressIndex] || (addresses.length > 0 ? addresses[0] : null);

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.phone) {
      setError('Please provide street and contact phone');
      return;
    }
    try {
      const res = await addAddress(newAddr);
      if (res.success) {
        setShowNewAddressForm(false);
        setSelectedAddressIndex(user.addresses.length);
        setError(null);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Error saving address');
    }
  };

  const handlePlaceOrder = async () => {
    setError(null);

    if (!activeAddress && !showNewAddressForm) {
      setError('Please choose or enter a delivery address.');
      return;
    }

    try {
      setLoading(true);

      const chosenAddress = activeAddress || newAddr;

      const orderData = {
        restaurantId: restaurant?._id || cartItems[0]?.food?.restaurant?._id || cartItems[0]?.food?.restaurant,
        items: cartItems.map(item => ({
          foodId: item.food._id,
          name: item.food.name,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress: {
          street: chosenAddress.street,
          city: chosenAddress.city,
          state: chosenAddress.state,
          zipCode: chosenAddress.zipCode,
          phone: chosenAddress.phone,
          tag: chosenAddress.tag
        },
        paymentMethod,
        couponCode: coupon?.code || '',
        specialInstructions: deliveryInstructions
      };

      const res = await API.post('/orders', orderData);
      if (res.data.success) {
        const orderId = res.data.order._id;
        // Redirect to interactive payment processing
        navigate(`/payment/${orderId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethodsList = [
    { id: 'RAZORPAY', title: 'Razorpay Payment Gateway', desc: 'UPI, Credit/Debit Cards, Net Banking, Wallets (Test Mode)', icon: ShieldCheck, badge: 'Official Integration' },
    { id: 'UPI', title: 'UPI / QR Code', desc: 'Google Pay, PhonePe, Paytm, BHIM', icon: QrCode },
    { id: 'CARD', title: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay', icon: CreditCard },
    { id: 'NETBANKING', title: 'Net Banking', desc: 'HDFC, ICICI, SBI, Axis & all Indian banks', icon: Building },
    { id: 'WALLET', title: 'TastyBite Wallet', desc: 'Instant 1-click checkout with balance', icon: Wallet },
    { id: 'COD', title: 'Cash on Delivery', desc: 'Pay cash or UPI upon delivery', icon: Banknote }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
          Final Step
        </span>
        <h1 className="text-3xl font-black text-stone-900 font-display">
          Delivery & Payment Details
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 7 Columns: Delivery Address + Special Notes + Payment Method */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Delivery Address Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                Select Delivery Address
              </h3>
              <button
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {showNewAddressForm ? 'Cancel' : 'Add New Address'}
              </button>
            </div>

            {/* Existing addresses selector */}
            {!showNewAddressForm && addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr, idx) => (
                  <div
                    key={addr._id || idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      selectedAddressIndex === idx
                        ? 'border-orange-600 bg-orange-50/30 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                        {addr.tag || 'Home'}
                      </span>
                      {selectedAddressIndex === idx && (
                        <CheckCircle2 className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-stone-900 truncate">{addr.street}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{addr.city}, {addr.zipCode}</p>
                    <p className="text-[11px] text-stone-500 mt-1">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}

            {/* If no addresses or adding new */}
            {(showNewAddressForm || addresses.length === 0) && (
              <form onSubmit={handleSaveNewAddress} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Tag</label>
                    <select
                      value={newAddr.tag}
                      onChange={(e) => setNewAddr({ ...newAddr, tag: e.target.value })}
                      className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Hostel">Hostel</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      placeholder="+91 98450 67890"
                      className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    placeholder="Flat / House No., Apartment, Street name"
                    className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 text-xs font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">City</label>
                    <input
                      type="text"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">State</label>
                    <input
                      type="text"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">PIN / Zip Code</label>
                    <input
                      type="text"
                      value={newAddr.zipCode}
                      onChange={(e) => setNewAddr({ ...newAddr, zipCode: e.target.value })}
                      className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                    />
                  </div>
                </div>

                {addresses.length > 0 && (
                  <button
                    type="submit"
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                  >
                    Save Address
                  </button>
                )}
              </form>
            )}
          </div>

          {/* 2. Delivery & Cooking Instructions */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-600" />
              Special Delivery & Kitchen Instructions (Optional)
            </h3>
            <textarea
              rows={2}
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
              placeholder="e.g. Ring the doorbell twice, please send extra green chutney, leave at security desk..."
              className="w-full bg-stone-100 text-stone-800 text-xs p-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>

          {/* 3. Payment Method Choice */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2 border-b border-stone-100 pb-3">
              <CreditCard className="w-4 h-4 text-orange-600" />
              Choose Payment Method
            </h3>

            <div className="space-y-2.5">
              {paymentMethodsList.map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <div
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/20 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{pm.title}</h4>
                          {pm.badge && (
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                              {pm.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500">{pm.desc}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-orange-600' : 'border-stone-300'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-orange-600" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right 5 Columns: Order Items & Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
            <h3 className="font-extrabold text-stone-900 text-base font-display">
              Order Summary
            </h3>

            {/* Items list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1">
              {cartItems.map((item) => (
                <div key={item.food._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-600">{item.quantity}x</span>
                    <span className="font-medium text-stone-800 line-clamp-1">{item.food.name}</span>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-bold text-stone-800">{deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST (5%)</span>
                <span className="font-bold text-stone-800">{formatCurrency(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({coupon?.code})</span>
                  <span>- {formatCurrency(discount)}</span>
                </div>
              )}
            </div>

            {/* Total Due */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900 text-sm block">Total Payable</span>
                <span className="text-[10px] text-stone-400">Via {paymentMethod}</span>
              </div>
              <span className="text-2xl font-black text-orange-600 font-display">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            {/* Place Order & Proceed to Pay CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg shadow-orange-500/25 transition-all hover:scale-101 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Securing Order...' : 'Continue to Payment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Verified TastyBite Sandbox Payment</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Checkout;
