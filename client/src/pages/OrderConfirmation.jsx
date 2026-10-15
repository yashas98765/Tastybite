import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Download,
  Receipt,
  FileText,
  MapPin,
  ArrowRight,
  Store,
  Truck,
  MessageSquare,
  Mail,
  Send
} from 'lucide-react';
import API from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/formatters';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/orders/${orderId}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    const token = localStorage.getItem('tastybite_token');
    window.open(`/api/orders/${orderId}/invoice?token=${token}`, '_blank');
  };

  const handleDownloadReceipt = () => {
    if (order?.payment?._id || order?.payment) {
      const paymentId = order.payment._id || order.payment;
      const token = localStorage.getItem('tastybite_token');
      window.open(`/api/payments/${paymentId}/receipt?token=${token}`, '_blank');
    }
  };

  const handleShareWhatsApp = async (target = 'customer') => {
    try {
      const res = await API.get(`/orders/${orderId}/whatsapp-share`);
      if (res.data?.success && res.data?.data) {
        const { customerWhatsAppUrl, supportWhatsAppUrl } = res.data.data;
        const targetUrl = target === 'support' ? supportWhatsAppUrl : (customerWhatsAppUrl || supportWhatsAppUrl);
        window.open(targetUrl, '_blank');
        return;
      }
    } catch (e) {
      console.warn('WhatsApp share fetch failed, falling back to direct link:', e);
    }
    const text = encodeURIComponent(`🍔 TastyBite Order #${order?.orderNumber || orderId}\nStatus: ${order?.orderStatus}\nTotal: Rs. ${order?.totalAmount}\nTracking: ${window.location.origin}/order/track/${orderId}`);
    window.open(`https://wa.me/917619290168?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-xs text-stone-500 animate-pulse">
        Loading confirmation...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-stone-800">Order Not Found</h2>
        <Link to="/" className="inline-block bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Top Celebration Card */}
      <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center space-y-4 relative overflow-hidden">
        
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
            Order Confirmed & Received
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-display">
            Thank You for Your Order!
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Order Reference: <strong className="text-stone-900 font-mono text-sm">{order.orderNumber}</strong>
          </p>
        </div>

        {/* Estimated Delivery Pill */}
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold px-4 py-2 rounded-full shadow-2xs">
          <Clock className="w-4 h-4 text-orange-600" />
          <span>Estimated Delivery in ~{order.estimatedDeliveryMinutes || 35} Minutes</span>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={`/order/track/${order._id}`}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Track Live Delivery</span>
          </Link>

          <button
            onClick={() => handleShareWhatsApp('customer')}
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Receipt to WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadInvoice}
            className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-orange-600" />
            <span>Download Invoice PDF</span>
          </button>

          {order.payment && (
            <button
              onClick={handleDownloadReceipt}
              className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Payment Receipt PDF</span>
            </button>
          )}
        </div>

        {/* Dual Delivery Channel Notification (Email + WhatsApp) */}
        <div className="mt-6 pt-6 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-blue-900">Email Confirmation Sent</h4>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Tax Invoice PDF and Payment Receipt PDF have been dispatched to your email & TastyBite admin.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xs text-emerald-900">WhatsApp Updates Active</h4>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Support & live updates available 24/7 on WhatsApp (+91 76192 90168).
              </p>
              <button
                onClick={() => handleShareWhatsApp('support')}
                className="text-[11px] font-bold text-emerald-800 hover:underline mt-1 inline-block cursor-pointer"
              >
                Chat with TastyBite on WhatsApp →
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Order Details Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <h3 className="font-extrabold text-stone-900 text-base font-display border-b border-stone-100 pb-3">
          Order Summary & Delivery Location
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
          <div>
            <span className="font-bold text-stone-400 uppercase block mb-1">Restaurant</span>
            <span className="font-extrabold text-stone-900 text-sm block">{order.restaurant?.name || 'TastyBite Kitchen'}</span>
            <span className="text-stone-500">{order.restaurant?.location?.area || 'Bangalore'}</span>
          </div>

          <div>
            <span className="font-bold text-stone-400 uppercase block mb-1">Delivery Address</span>
            <span className="font-bold text-stone-900 block">{order.deliveryAddress?.street}</span>
            <span className="text-stone-500">{order.deliveryAddress?.city}, {order.deliveryAddress?.zipCode}</span>
            <span className="text-stone-500 block mt-0.5">Phone: {order.deliveryAddress?.phone}</span>
          </div>
        </div>

        {/* Items List */}
        <div className="divide-y divide-stone-100 border-t border-b border-stone-100 py-2">
          {order.items?.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-orange-600">{item.quantity}x</span>
                <span className="font-semibold text-stone-800">{item.name}</span>
                {item.addedBy && item.addedBy !== 'Self' && (
                  <span className="bg-teal-50 text-teal-700 px-1.5 py-0.2 rounded text-[10px]">
                    Added by {item.addedBy}
                  </span>
                )}
              </div>
              <span className="font-bold text-stone-900">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Bill calculation */}
        <div className="space-y-1.5 text-xs text-stone-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-stone-800">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-bold text-stone-800">{order.deliveryFee === 0 ? 'FREE' : formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes & GST (5%)</span>
            <span className="font-bold text-stone-800">{formatCurrency(order.tax)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Coupon Discount ({order.couponCode})</span>
              <span>- {formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
            <span>Total Paid</span>
            <span className="text-orange-600 font-display">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs font-bold text-orange-600 hover:text-orange-700">
            ← Return to Home Page
          </Link>
        </div>

      </div>

    </div>
  );
};

export default OrderConfirmation;
