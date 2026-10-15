import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Building,
  Wallet,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Smartphone,
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('RAZORPAY');
  const [error, setError] = useState(null);

  // Form states for sandbox fallback
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState('Rahul Sharma');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/orders/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.order);
        if (res.data.order.paymentMethod) {
          setActiveTab(res.data.order.paymentMethod);
        }
      }
    } catch (err) {
      setError('Unable to load order details for payment.');
    } finally {
      setLoading(false);
    }
  };

  // Official Razorpay Checkout Integration
  const handleRazorpayPayment = async () => {
    try {
      setProcessing(true);
      setError(null);

      // Step 1: Create Order on Backend
      const res = await API.post('/payments/razorpay/create-order', { orderId });
      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to initialize Razorpay payment');
      }

      const { razorpayOrderId, amount, currency, keyId } = res.data;

      // Check if Razorpay script is loaded in window
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection and refresh.');
      }

      // Step 2: Initialize Razorpay Checkout Modal
      const options = {
        key: keyId || 'rzp_test_TNgbXItY3fibBE',
        amount: amount,
        currency: currency || 'INR',
        name: 'TastyBite',
        description: `Order #${order.orderNumber || orderId.slice(-6)} • Good Food, Just a Bite Away`,
        image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            setProcessing(true);
            // Step 3: Verify cryptographic HMAC signature on backend
            const verifyRes = await API.post('/payments/razorpay/verify', {
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              clearCart();
              navigate(`/order-confirmation/${orderId}`);
            } else {
              setError(verifyRes.data.message || 'Razorpay payment signature verification failed.');
              setProcessing(false);
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Payment signature verification error. Contact support.');
            setProcessing(false);
          }
        },
        prefill: {
          name: user?.name || 'TastyBite Customer',
          email: user?.email || 'customer@tastybite.com',
          contact: order.deliveryAddress?.phone || '9845012345'
        },
        notes: {
          orderId,
          orderNumber: order.orderNumber
        },
        theme: {
          color: '#ea580c'
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setError(response.error?.description || 'Razorpay payment was declined or cancelled.');
        setProcessing(false);
      });
      razorpayInstance.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start Razorpay payment gateway.');
      setProcessing(false);
    }
  };

  // Sandbox fallback payment handler
  const handleProcessPayment = async (simulateFailure = false) => {
    if (activeTab === 'RAZORPAY') {
      return handleRazorpayPayment();
    }

    try {
      setProcessing(true);
      setError(null);

      const paymentPayload = {
        orderId,
        paymentMethod: activeTab,
        simulateFailure,
        cardDetails: activeTab === 'CARD' ? { cardNumber, cardHolder } : undefined,
        upiDetails: activeTab === 'UPI' ? { upiId } : undefined,
        bankDetails: activeTab === 'NETBANKING' ? { bankName: selectedBank } : undefined,
        walletDetails: activeTab === 'WALLET' ? { walletName: 'TastyBite Wallet' } : undefined
      };

      const res = await API.post('/payments/process', paymentPayload);
      if (res.data.success) {
        clearCart();
        navigate(`/order-confirmation/${orderId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment simulation failed. Try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-xs text-stone-500 animate-pulse">
        Connecting to TastyBite Secure Payment Gateway...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-stone-800">Order Not Found</h2>
        <p className="text-xs text-stone-500">Please start a new order from your cart.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-md mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Razorpay Test Gateway Configured</span>
        </div>
        <h1 className="text-3xl font-black text-stone-900 font-display">
          Complete Your Payment
        </h1>
        <p className="text-xs text-stone-500">
          Order ID: <strong className="text-stone-800 font-mono">{order.orderNumber}</strong> • Total Due: <strong className="text-orange-600 font-bold">{formatCurrency(order.totalAmount)}</strong>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Payment Container */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Navigation: Payment Options */}
        <div className="md:col-span-5 bg-stone-50 border-r border-stone-200 p-4 space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase text-stone-400 px-3 tracking-wider block mb-2">
            Payment Options
          </span>

          {/* RAZORPAY Option */}
          <button
            onClick={() => setActiveTab('RAZORPAY')}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'RAZORPAY'
                ? 'bg-blue-50/80 text-blue-900 shadow-sm border-2 border-blue-600'
                : 'text-stone-700 hover:bg-stone-100 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                R
              </div>
              <div>
                <span className="flex items-center gap-1.5">
                  Razorpay Gateway
                  <span className="text-[9px] font-black uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                    Live Test
                  </span>
                </span>
                <p className="text-[10px] text-stone-400 font-normal">UPI, Cards, NetBanking</p>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </button>

          <button
            onClick={() => setActiveTab('UPI')}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'UPI'
                ? 'bg-white text-orange-600 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <QrCode className="w-4 h-4 text-orange-500" />
            <div>
              <span>UPI / Instant QR</span>
              <p className="text-[10px] text-stone-400 font-normal">GPay, PhonePe, Paytm</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('CARD')}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'CARD'
                ? 'bg-white text-orange-600 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <CreditCard className="w-4 h-4 text-blue-500" />
            <div>
              <span>Credit / Debit Card</span>
              <p className="text-[10px] text-stone-400 font-normal">Visa, Mastercard, RuPay</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('NETBANKING')}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'NETBANKING'
                ? 'bg-white text-orange-600 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Building className="w-4 h-4 text-purple-500" />
            <div>
              <span>Net Banking</span>
              <p className="text-[10px] text-stone-400 font-normal">All major banks supported</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('WALLET')}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'WALLET'
                ? 'bg-white text-orange-600 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-500" />
            <div>
              <span>TastyBite Wallet</span>
              <p className="text-[10px] text-stone-400 font-normal">Available Balance: ₹1,500</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('COD')}
            className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'COD'
                ? 'bg-white text-orange-600 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Banknote className="w-4 h-4 text-stone-500" />
            <div>
              <span>Cash on Delivery</span>
              <p className="text-[10px] text-stone-400 font-normal">Pay cash or QR at door</p>
            </div>
          </button>
        </div>

        {/* Right Active Form Area */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          
          {/* 0. RAZORPAY Tab Content */}
          {activeTab === 'RAZORPAY' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                    <span>Razorpay Payment Gateway</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded-md border border-blue-200">
                      rzp_test_TNgbXItY3fibBE
                    </span>
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Production-grade payment processing with cryptographic HMAC verification.
                  </p>
                </div>
              </div>

              {/* Razorpay Banner Info */}
              <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
                  <ShieldCheck className="w-40 h-40" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-blue-200">
                      Razorpay Standard Checkout
                    </span>
                    <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                      ● Test Mode Active
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl font-black font-display tracking-tight block">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <p className="text-xs text-blue-200 mt-1">
                      Includes food subtotal, delivery fee, and applicable GST.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2 text-[10px] text-blue-100">
                    <span className="bg-white/10 px-2 py-0.5 rounded-md">✓ UPI (GPay, PhonePe)</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-md">✓ Credit / Debit Cards</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-md">✓ Net Banking</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-md">✓ Wallets</span>
                  </div>
                </div>
              </div>

              {/* Instructions Box */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2 text-xs">
                <span className="font-bold text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  How to test with your Razorpay Test Credentials:
                </span>
                <ul className="text-stone-600 space-y-1 text-[11px] list-disc list-inside">
                  <li>Click <strong>"Launch Razorpay Checkout"</strong> below.</li>
                  <li>In the popup modal, choose <strong>UPI</strong> (enter <em>success@razorpay</em>) or <strong>Card</strong> (any 16-digit test card number).</li>
                  <li>Simulate success, and Razorpay automatically redirects back, generates a digital PDF invoice, and updates tracking!</li>
                </ul>
              </div>
            </div>
          )}

          {/* 1. UPI Tab Content */}
          {activeTab === 'UPI' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-stone-900 text-sm">Pay with UPI ID or Scan QR</h3>
              
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-24 h-24 bg-white border border-stone-300 rounded-xl p-2 flex items-center justify-center shrink-0 shadow-2xs">
                  <div className="w-full h-full border-2 border-stone-800 border-dashed rounded-lg flex items-center justify-center text-stone-400 text-[10px] font-mono text-center">
                    [TastyBite QR]
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-stone-800">Scan & Pay on Mobile</span>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Open Google Pay, PhonePe, or BHIM and scan this instant QR to approve payment.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Or Enter Virtual UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank"
                  className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* 2. CARD Tab Content */}
          {activeTab === 'CARD' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-stone-900 text-sm">Credit or Debit Card Details</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-mono font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Expires (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. NETBANKING Tab Content */}
          {activeTab === 'NETBANKING' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-stone-900 text-sm">Select Your Preferred Bank</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBank(b)}
                    className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      selectedBank === b
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. WALLET Tab Content */}
          {activeTab === 'WALLET' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-stone-900 text-sm">TastyBite Digital Cash Wallet</h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 space-y-1">
                <span className="text-xs font-bold block">Available Balance: ₹1,500.00</span>
                <p className="text-[11px] text-emerald-700">
                  Instant deduction with no OTP required. Seamless 1-tap checkout.
                </p>
              </div>
            </div>
          )}

          {/* 5. COD Tab Content */}
          {activeTab === 'COD' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-stone-900 text-sm">Cash on Delivery</h3>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-stone-700 text-xs leading-relaxed">
                You can pay using cash or any UPI app directly to our delivery executive when your hot food arrives at your door.
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-6 border-t border-stone-100 space-y-3">
            
            {/* Pay Button */}
            <button
              onClick={() => handleProcessPayment(false)}
              disabled={processing}
              className={`w-full text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                activeTab === 'RAZORPAY'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-orange-500/25'
              }`}
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing with Razorpay...</span>
                </>
              ) : activeTab === 'RAZORPAY' ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Launch Razorpay Checkout ({formatCurrency(order.totalAmount)})</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay {formatCurrency(order.totalAmount)} Securely</span>
                </>
              )}
            </button>

            {/* Test Simulation Failure Button for College Project Grading */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => handleProcessPayment(true)}
                disabled={processing}
                className="text-[11px] font-bold text-stone-400 hover:text-rose-600 underline transition-colors cursor-pointer"
              >
                (Demo Test: Simulate Failed Payment to test error handling)
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Payment;
