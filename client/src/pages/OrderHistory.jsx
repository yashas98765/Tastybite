import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, Store, Download, RefreshCw, ChevronRight, AlertCircle, FileText } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency, formatDateTime, getOrderStatusBadge } from '../utils/formatters';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        addToCart({
          _id: item.food?._id || item.food,
          name: item.name,
          price: item.price,
          image: item.image,
          isVeg: item.isVeg,
          restaurant: order.restaurant
        }, item.quantity, order.restaurant);
      });
      navigate('/cart');
    }
  };

  const handleDownloadInvoice = (orderId) => {
    const token = localStorage.getItem('tastybite_token');
    window.open(`/api/orders/${orderId}/invoice?token=${token}`, '_blank');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Package className="w-12 h-12 text-orange-600 mx-auto" />
        <h2 className="text-2xl font-bold text-stone-900">Sign in to View Orders</h2>
        <Link to="/login?redirect=/orders" className="inline-block bg-orange-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-stone-200 pb-5">
        <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
          Your Account
        </span>
        <h1 className="text-3xl font-black text-stone-900 font-display">
          My Order History ({orders.length})
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          View past orders, track active deliveries, and download tax invoices
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 bg-stone-200 rounded-3xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 space-y-3">
          <Package className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-extrabold text-stone-800 text-lg">No Orders Placed Yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Hungry? Browse our partner restaurants to place your first piping hot order today.
          </p>
          <Link to="/menu" className="mt-3 inline-block bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl">
            Explore Menu Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs hover:border-orange-300 transition-all space-y-4"
            >
              {/* Order Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-stone-900 text-sm font-mono">
                      #{order.orderNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getOrderStatusBadge(order.orderStatus)}`}>
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400">
                    Placed on {formatDateTime(order.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">Grand Total:</span>
                  <span className="text-base font-black text-stone-900 font-display">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Restaurant & Item summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-stone-800">
                    <Store className="w-4 h-4 text-orange-500" />
                    <span>{order.restaurant?.name || 'TastyBite Partner'}</span>
                  </div>
                  <p className="text-stone-500 line-clamp-1">
                    {order.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
                  <Link
                    to={`/order/track/${order._id}`}
                    className="flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2 rounded-xl text-center shadow-xs transition-colors"
                  >
                    Track Order
                  </Link>

                  <button
                    onClick={() => handleReorder(order)}
                    className="flex-1 sm:flex-none bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Reorder
                  </button>

                  <button
                    onClick={() => handleDownloadInvoice(order._id)}
                    className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Download Tax Invoice PDF"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
