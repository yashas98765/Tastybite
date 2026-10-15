import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  FileText,
  Receipt,
  MessageSquare,
  AlertCircle,
  Truck,
  ChefHat,
  Package,
  Store,
  Navigation,
  Star,
  Mail,
  Play,
  Pause,
  FastForward,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import API from '../services/api';
import { useSocket } from '../context/SocketContext';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import LiveGpsMap from '../components/LiveGpsMap';

const OrderTracking = () => {
  const { orderId } = useParams();
  const { socket, joinOrderRoom } = useSocket();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riderCalled, setRiderCalled] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [speed, setSpeed] = useState(6);
  const [advanceSeconds, setAdvanceSeconds] = useState(6);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Socket live update listener
  useEffect(() => {
    if (socket && orderId) {
      joinOrderRoom(orderId);

      const handleOrderUpdate = (updatedOrder) => {
        if (updatedOrder._id === orderId) {
          setOrder(updatedOrder);
          setAdvanceSeconds(speed);
        }
      };

      socket.on('order_status_updated', handleOrderUpdate);

      return () => {
        socket.off('order_status_updated', handleOrderUpdate);
      };
    }
  }, [socket, orderId, speed]);

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

  const handleAdvanceStage = async () => {
    if (advancing) return;
    try {
      setAdvancing(true);
      const res = await API.put(`/orders/${orderId}/advance-stage`);
      if (res.data?.success && res.data?.order) {
        setOrder(res.data.order);
        setAdvanceSeconds(speed);
        if (res.data.order.orderStatus === 'DELIVERED') {
          setAutoSimulate(false);
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      console.warn('Advance stage error:', err.message);
    } finally {
      setAdvancing(false);
    }
  };

  // Live automated timeline countdown
  useEffect(() => {
    if (!autoSimulate) return;
    if (order?.orderStatus === 'DELIVERED') {
      setAutoSimulate(false);
      return;
    }

    const interval = setInterval(() => {
      setAdvanceSeconds((prev) => {
        if (prev <= 1) {
          handleAdvanceStage();
          return speed;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoSimulate, order?.orderStatus, speed, orderId, advancing]);

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
      console.warn('WhatsApp share error in tracking:', e);
    }
    const text = encodeURIComponent(`🍔 TastyBite Order #${order?.orderNumber || orderId}\nStatus: ${order?.orderStatus}\nTotal: Rs. ${order?.totalAmount}\nLive Tracking: ${window.location.origin}/order/track/${orderId}`);
    window.open(`https://wa.me/917619290168?text=${text}`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-xs text-stone-500 animate-pulse">
        Connecting to live delivery GPS...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-stone-800">Order Not Found</h2>
        <Link to="/orders" className="inline-block bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl">
          View My Orders
        </Link>
      </div>
    );
  }

  // 6 Tracking Stages
  const stages = [
    { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Received by kitchen', icon: FileText },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Kitchen accepted order', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'Preparing', desc: 'Chefs cooking fresh', icon: ChefHat },
    { key: 'READY', label: 'Ready', desc: 'Packed & awaiting pickup', icon: Package },
    { key: 'OUT_FOR_DELIVERY', label: 'On The Way', desc: 'Rider is en route', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Delivered to your door', icon: MapPin }
  ];

  const currentStageIndex = stages.findIndex(s => s.key === order.orderStatus);
  const activeIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-yellow-200 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md mb-2">
            <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
            <span>Live WebSocket GPS Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
            {order.orderStatus === 'DELIVERED'
              ? 'Delivered Successfully! 🎉'
              : `Order in Progress: ${stages[activeIndex]?.label}`}
          </h1>
          <p className="text-xs text-orange-100 mt-1">
            Order Reference: <strong className="font-mono text-white">{order.orderNumber}</strong> • Restaurant: {order.restaurant?.name}
          </p>
        </div>

        {/* ETA Widget */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center shrink-0 w-full md:w-auto">
          <span className="text-[10px] text-orange-200 font-bold uppercase tracking-wider block">Estimated Delivery</span>
          <span className="text-2xl font-black text-white font-display block">
            {order.orderStatus === 'DELIVERED' ? 'Delivered' : `~${order.estimatedDeliveryMinutes || 25} Mins`}
          </span>
          <span className="text-[10px] text-orange-100">Contactless doorstep handoff</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Stage Progression & Simulated Live Map */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Live Horizontal / Vertical Stage Stepper */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                  </span>
                  <h3 className="font-extrabold text-stone-900 text-sm">Order Timeline Progress</h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                    ● Live
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 font-medium">Real-time status updates via WebSocket & automated live tracker</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200">
                  Step {activeIndex + 1} of 6
                </span>
              </div>
            </div>

            {/* Live Progress Progression Controls */}
            {order.orderStatus !== 'DELIVERED' ? (
              <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 rounded-2xl p-4 border border-orange-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
                    </span>
                    <span className="text-xs font-bold text-orange-950">
                      Live Progression Active:
                    </span>
                    <span className="text-[11px] font-semibold text-orange-800">
                      {autoSimulate ? (
                        <>Advancing to <strong>{stages[activeIndex + 1]?.label || 'Next Stage'}</strong> in <strong className="text-orange-600 font-black">{advanceSeconds}s</strong></>
                      ) : (
                        <span className="text-stone-500">Live Auto-Advance Paused</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Speed Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        const newSpeed = speed === 6 ? 3 : 6;
                        setSpeed(newSpeed);
                        setAdvanceSeconds(newSpeed);
                      }}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white/80 hover:bg-white text-stone-600 border border-orange-200 transition-colors cursor-pointer"
                      title="Toggle progression speed"
                    >
                      {speed === 6 ? 'Speed: 1x (6s)' : 'Speed: 2x (3s)'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAutoSimulate(!autoSimulate)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        autoSimulate
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {autoSimulate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{autoSimulate ? 'Pause' : 'Resume'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAdvanceStage}
                      disabled={advancing}
                      className="bg-stone-900 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>{advancing ? 'Advancing...' : 'Advance Now'}</span>
                    </button>
                  </div>
                </div>

                {/* Animated live countdown indicator */}
                {autoSimulate && (
                  <div className="w-full bg-orange-200/50 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${Math.min(100, Math.max(5, ((speed - advanceSeconds) / speed) * 100))}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-emerald-800">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold text-emerald-950">Order Completed & Delivered!</h4>
                    <p className="text-[11px] text-emerald-700">Thank you for dining with TastyBite. Bon appétit!</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2.5 py-1 rounded-xl">
                  Delivered
                </span>
              </div>
            )}

            {/* Stepper nodes */}
            <div className="space-y-4">
              {stages.map((stage, idx) => {
                const Icon = stage.icon;
                const isPassed = idx <= activeIndex;
                const isCurrent = idx === activeIndex;

                return (
                  <div key={stage.key} className="flex items-start gap-4 relative">
                    {/* Connecting line */}
                    {idx < stages.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 w-0.5 h-8 -ml-[1px] transition-colors ${
                          idx < activeIndex ? 'bg-orange-600' : 'bg-stone-200'
                        }`}
                      />
                    )}

                    {/* Step Icon circle */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-orange-600 text-white shadow-md shadow-orange-500/30 scale-105'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Step text */}
                    <div className="pt-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-extrabold ${isPassed ? 'text-stone-900' : 'text-stone-400'}`}>
                          {stage.label}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Interactive Real OpenStreetMap Live GPS Map */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4 overflow-hidden w-full max-w-full">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4 text-orange-600" />
                Live Rider GPS Route & Telemetry
              </h3>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Satellite GPS Active
              </span>
            </div>

            {/* Real Interactive Leaflet Map */}
            <div className="w-full max-w-full overflow-hidden rounded-2xl">
              <LiveGpsMap order={order} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-stone-500 px-1">
              <span>Rider following real-time traffic corridor to {order.deliveryAddress?.street || order.deliveryAddress?.city}.</span>
              <span className="font-bold text-stone-700">GPS Signal: Strong (4G LTE)</span>
            </div>
          </div>

        </div>

        {/* Right Column: Rider Info + Order Items + Invoices */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Delivery Partner Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-stone-900 text-sm">Delivery Partner</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-base shrink-0">
                  {(order.riderDetails?.name || 'Rider')
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-sm">
                    {order.riderDetails?.name || 'Delivery Partner'}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-stone-500">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{order.riderDetails?.rating || 4.8}</span>
                    <span>• {order.riderDetails?.vehicleNumber || 'KA 01 EB 4892'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setRiderCalled(true)}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                {riderCalled ? 'Calling...' : 'Call'}
              </button>
            </div>

            {riderCalled && (
              <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-xl text-center">
                Simulating call to {order.riderDetails?.phone || '+91 98450 12345'}.
              </p>
            )}
          </div>

          {/* Quick PDF Downloads & Help */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-stone-900 text-sm">Official Documents & Invoices</h3>
            
            <button
              onClick={() => handleShareWhatsApp('customer')}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold p-3 rounded-xl flex items-center justify-between transition-colors shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Share Status & Receipt to WhatsApp</span>
              </div>
              <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-md">Send</span>
            </button>

            <button
              onClick={handleDownloadInvoice}
              className="w-full bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold p-3 rounded-xl border border-stone-200 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <span>Tax Invoice PDF (INV-{order.orderNumber})</span>
              </div>
              <span className="text-orange-600 text-[11px]">Download</span>
            </button>

            {order.payment && (
              <button
                onClick={handleDownloadReceipt}
                className="w-full bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold p-3 rounded-xl border border-stone-200 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Payment Receipt PDF</span>
                </div>
                <span className="text-emerald-600 text-[11px]">Download</span>
              </button>
            )}

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex items-start gap-2">
              <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Status updates and PDF receipts are automatically emailed to your inbox and store desk.
              </span>
            </div>

            <Link
              to="/support"
              className="w-full bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold p-3 rounded-xl border border-orange-200 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-600" />
                <span>Need help? WhatsApp: +91 76192 90168</span>
              </div>
              <span className="text-orange-700 text-[11px]">Support</span>
            </Link>
          </div>

          {/* Ordered Food Items */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-stone-900 text-sm border-b border-stone-100 pb-2">
              Items Ordered ({order.items?.length})
            </h3>
            <div className="space-y-2 max-h-52 overflow-y-auto divide-y divide-stone-50 text-xs">
              {order.items?.map((item, i) => (
                <div key={i} className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900">{item.name}</span>
                    <span className="text-stone-400 ml-1.5">x {item.quantity}</span>
                  </div>
                  <span className="font-bold text-stone-900">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold">
              <span>Grand Total</span>
              <span className="text-sm font-black text-orange-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OrderTracking;
