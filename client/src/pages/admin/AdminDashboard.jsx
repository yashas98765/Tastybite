import React, { useState, useEffect } from 'react';
import {
  Users,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  MessageSquare,
  Shield,
  Send,
  Lock,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { formatCurrency, formatDateTime, getOrderStatusBadge, getPaymentStatusBadge } from '../../utils/formatters';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { socket, joinAdminRoom } = useSocket();

  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, foods, restaurants, payments, chats
  const [stats, setStats] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState([]);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab Data States
  const [ordersList, setOrdersList] = useState([]);
  const [foodsList, setFoodsList] = useState([]);
  const [restaurantsList, setRestaurantsList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [chatsList, setChatsList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Modals
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showAddRestModal, setShowAddRestModal] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    price: 299,
    category: 'Biryani',
    restaurant: '',
    isVeg: true,
    spiceLevel: 'Medium',
    mealType: 'Dinner',
    cuisine: 'North Indian',
    portionSize: '1 Serving'
  });

  const [newRest, setNewRest] = useState({
    name: '',
    description: '',
    tagline: '',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    cuisines: 'North Indian, Mughlai',
    deliveryTimeMinutes: 25,
    deliveryFee: 30,
    costForTwo: 500,
    area: 'Indiranagar',
    address: '100ft Road, Indiranagar, Bangalore'
  });

  // Real-time admin channel join
  useEffect(() => {
    if (socket) {
      joinAdminRoom();

      socket.on('admin_order_updated', () => {
        fetchDashboardStats();
        if (activeTab === 'orders') fetchOrders();
      });

      socket.on('admin_chat_notification', (msg) => {
        if (activeTab === 'chats') {
          fetchChats();
          if (activeChat && (msg.chat === activeChat._id || msg.chat?._id === activeChat._id)) {
            setChatMessages(prev => [...prev, msg]);
          }
        }
      });
    }
  }, [socket, activeChat, activeTab]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'foods') fetchFoods();
    if (activeTab === 'restaurants') fetchRestaurants();
    if (activeTab === 'payments') fetchPayments();
    if (activeTab === 'chats') fetchChats();
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setRevenueAnalytics(res.data.revenueAnalytics || []);
        setOrderStatusDistribution(res.data.orderStatusDistribution || []);
        setRecentOrders(res.data.recentOrders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get('/admin/orders');
      if (res.data.success) setOrdersList(res.data.orders);
    } catch (e) {}
  };

  const fetchFoods = async () => {
    try {
      const res = await API.get('/foods?sort=popular');
      if (res.data.success) setFoodsList(res.data.foods);
    } catch (e) {}
  };

  const fetchRestaurants = async () => {
    try {
      const res = await API.get('/restaurants');
      if (res.data.success) {
        setRestaurantsList(res.data.restaurants);
        if (res.data.restaurants.length > 0 && !newFood.restaurant) {
          setNewFood(prev => ({ ...prev, restaurant: res.data.restaurants[0]._id }));
        }
      }
    } catch (e) {}
  };

  const fetchPayments = async () => {
    try {
      const res = await API.get('/admin/payments');
      if (res.data.success) setPaymentsList(res.data.payments);
    } catch (e) {}
  };

  const fetchChats = async () => {
    try {
      const res = await API.get('/chats');
      if (res.data.success) {
        setChatsList(res.data.chats);
        if (res.data.chats.length > 0 && !activeChat) {
          selectChat(res.data.chats[0]);
        }
      }
    } catch (e) {}
  };

  const selectChat = async (chat) => {
    setActiveChat(chat);
    try {
      const res = await API.get(`/chats/${chat._id}`);
      if (res.data.success) {
        setChatMessages(res.data.messages);
      }
    } catch (e) {}
  };

  const handleAdminReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !activeChat) return;

    try {
      const res = await API.post(`/chats/${activeChat._id}/messages`, {
        text: adminReplyText.trim()
      });
      if (res.data.success) {
        setChatMessages(prev => [...prev, res.data.message]);
        setAdminReplyText('');
      }
    } catch (e) {}
  };

  // Status changer for live order
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setOrdersList(prev => prev.map(o => o._id === orderId ? res.data.order : o));
        fetchDashboardStats();
      }
    } catch (e) {
      alert('Failed to update status: ' + e.message);
    }
  };

  // Toggle food availability
  const handleToggleFood = async (foodId) => {
    try {
      const res = await API.patch(`/foods/${foodId}/toggle-availability`);
      if (res.data.success) {
        setFoodsList(prev => prev.map(f => f._id === foodId ? { ...f, isAvailable: res.data.isAvailable } : f));
      }
    } catch (e) {}
  };

  // Delete food item
  const handleDeleteFood = async (foodId) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      await API.delete(`/foods/${foodId}`);
      setFoodsList(prev => prev.filter(f => f._id !== foodId));
    } catch (e) {}
  };

  // Issue refund
  const handleIssueRefund = async (paymentId) => {
    const reason = window.prompt('Enter reason for issuing refund:', 'Customer requested refund');
    if (!reason) return;
    try {
      const res = await API.put(`/payments/${paymentId}/refund`, { reason });
      if (res.data.success) {
        alert('Refund processed successfully!');
        fetchPayments();
        fetchDashboardStats();
      }
    } catch (e) {
      alert('Refund failed: ' + e.message);
    }
  };

  const handleCreateFood = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/foods', newFood);
      if (res.data.success) {
        setShowAddFoodModal(false);
        fetchFoods();
        fetchDashboardStats();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newRest,
        cuisines: newRest.cuisines.split(',').map(s => s.trim()),
        location: {
          address: newRest.address,
          area: newRest.area,
          city: 'Bangalore'
        }
      };
      const res = await API.post('/restaurants', payload);
      if (res.data.success) {
        setShowAddRestModal(false);
        fetchRestaurants();
        fetchDashboardStats();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Shield className="w-12 h-12 text-rose-600 mx-auto" />
        <h2 className="text-2xl font-bold text-stone-900">Restricted Admin Area</h2>
        <p className="text-xs text-stone-500">
          You must be logged in as an administrator to access the TastyBite Operations Console.
        </p>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="bg-orange-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
        >
          Sign in as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
              Operations Control
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Server
            </span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 font-display">
            TastyBite Admin Portal
          </h1>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-stone-100 p-1.5 rounded-2xl">
          {[
            { id: 'overview', label: 'Analytics', icon: TrendingUp },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'foods', label: 'Menu & Foods', icon: UtensilsCrossed },
            { id: 'restaurants', label: 'Restaurants', icon: Store },
            { id: 'payments', label: 'Payments', icon: DollarSign },
            { id: 'chats', label: 'Live Support', icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Key Metric Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-stone-900 font-display block">
                {formatCurrency(stats?.totalRevenue || 0)}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">+18.4% from last week</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Orders</span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-stone-900 font-display block">
                {stats?.totalOrders || 0}
              </span>
              <span className="text-[10px] text-stone-500 font-medium block">
                {stats?.completedOrders || 0} Delivered • {stats?.pendingOrders || 0} In Progress
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Active Users</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-stone-900 font-display block">
                {stats?.totalUsers || 0}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block">100% verified emails</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Menu Catalog</span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-stone-900 font-display block">
                {stats?.totalFoods || 0} Dishes
              </span>
              <span className="text-[10px] text-stone-500 font-medium block">
                Across {stats?.totalRestaurants || 0} partner kitchens
              </span>
            </div>

          </div>

          {/* Recharts Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Revenue Analytics Area Chart (7 Cols) */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base font-display">Revenue Velocity (Last 7 Days)</h3>
                  <p className="text-xs text-stone-400">Total volume of paid transactions</p>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  Weekly Trend
                </span>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueAnalytics}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      formatter={(v) => [`₹${v}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#revenueGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status Distribution Pie Chart (4 Cols) */}
            <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-stone-900 text-base font-display">Order Fulfillments</h3>
                <p className="text-xs text-stone-400">Status health breakdown</p>
              </div>

              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {orderStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '11px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-stone-900 text-base font-display">Recent Customer Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
              >
                View All Orders →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Restaurant</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-stone-50">
                      <td className="py-3 font-bold font-mono text-stone-900">#{o.orderNumber}</td>
                      <td className="py-3 font-semibold text-stone-800">{o.user?.name || 'Customer'}</td>
                      <td className="py-3 text-stone-600">{o.restaurant?.name || 'Partner'}</td>
                      <td className="py-3 font-black text-stone-900">{formatCurrency(o.totalAmount)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getOrderStatusBadge(o.orderStatus)}`}>
                          {o.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-stone-400">{formatDateTime(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 font-display">Manage Customer Orders</h2>
              <p className="text-xs text-stone-500">Update order status live to trigger real-time customer push and tracking emails</p>
            </div>
            <button
              onClick={fetchOrders}
              className="p-2 text-stone-500 hover:text-stone-800 rounded-xl hover:bg-stone-100 transition-colors"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer Info</th>
                  <th className="pb-3">Items Ordered</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Live Status Progression</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {ordersList.map((order) => (
                  <tr key={order._id} className="hover:bg-stone-50">
                    <td className="py-4 font-mono font-bold text-stone-900">
                      #{order.orderNumber}
                      <span className="block text-[10px] text-stone-400 font-sans mt-0.5">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="font-bold text-stone-900 block">{order.user?.name}</span>
                      <span className="text-[11px] text-stone-400 block">{order.deliveryAddress?.phone}</span>
                    </td>
                    <td className="py-4 max-w-xs">
                      <span className="text-stone-700 line-clamp-2">
                        {order.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                      </span>
                    </td>
                    <td className="py-4 font-black text-stone-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getPaymentStatusBadge(order.paymentStatus)}`}>
                        {order.paymentMethod}: {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4">
                      {/* Interactive Status Changer */}
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className={`font-bold text-xs p-2 rounded-xl border focus:outline-none cursor-pointer ${
                          order.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-orange-50 text-orange-800 border-orange-300'
                        }`}
                      >
                        <option value="ORDER_PLACED">1. ORDER PLACED</option>
                        <option value="CONFIRMED">2. CONFIRMED</option>
                        <option value="PREPARING">3. PREPARING</option>
                        <option value="READY">4. READY FOR PICKUP</option>
                        <option value="OUT_FOR_DELIVERY">5. OUT FOR DELIVERY</option>
                        <option value="DELIVERED">6. DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FOODS & MENU MANAGEMENT */}
      {activeTab === 'foods' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 font-display">Manage Menu & Food Items</h2>
              <p className="text-xs text-stone-500">Add dishes, update prices, or toggle in-stock / out-of-stock availability</p>
            </div>
            <button
              onClick={() => {
                fetchRestaurants();
                setShowAddFoodModal(true);
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Dish
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="pb-3">Dish</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Diet</th>
                  <th className="pb-3">Spice</th>
                  <th className="pb-3">Stock Availability</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {foodsList.map((food) => (
                  <tr key={food._id} className="hover:bg-stone-50">
                    <td className="py-3 flex items-center gap-3">
                      <img src={food.image} alt={food.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-stone-900 block">{food.name}</span>
                        <span className="text-[10px] text-stone-400">{food.restaurant?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-stone-600">{food.category}</td>
                    <td className="py-3 font-black text-stone-900">{formatCurrency(food.price)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${food.isVeg ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {food.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="py-3 text-stone-600">{food.spiceLevel}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleToggleFood(food._id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-colors cursor-pointer ${
                          food.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {food.isAvailable ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteFood(food._id)}
                        className="text-stone-300 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                        title="Delete Food"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RESTAURANTS MANAGEMENT */}
      {activeTab === 'restaurants' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 font-display">Manage Partner Kitchens</h2>
              <p className="text-xs text-stone-500">Onboard verified kitchen partners and track performance ratings</p>
            </div>
            <button
              onClick={() => setShowAddRestModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Restaurant
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurantsList.map((r) => (
              <div key={r._id} className="p-4 rounded-2xl border border-stone-200 space-y-3 bg-stone-50/50">
                <img src={r.image} alt={r.name} className="w-full h-36 rounded-xl object-cover" />
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">{r.name}</h3>
                  <p className="text-xs text-stone-500">{r.location?.area}, {r.location?.city}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-600 border-t border-stone-200 pt-2">
                  <span>Rating: <strong>★ {r.rating}</strong></span>
                  <span>Est: <strong>{r.deliveryTimeMinutes} mins</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENTS & REFUNDS */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 font-display">Payment Transactions & Refunds</h2>
              <p className="text-xs text-stone-500">Monitor live gateway settlements and process customer refunds</p>
            </div>
            <button onClick={fetchPayments} className="p-2 text-stone-400 hover:text-stone-800">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="pb-3">Txn Reference</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Amount Paid</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Refund Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paymentsList.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-50">
                    <td className="py-3 font-mono font-bold text-stone-900">{p.transactionId}</td>
                    <td className="py-3 font-semibold text-stone-800">{p.user?.name}</td>
                    <td className="py-3 font-mono text-stone-600">#{p.order?.orderNumber || 'N/A'}</td>
                    <td className="py-3 font-black text-stone-900">{formatCurrency(p.amount)}</td>
                    <td className="py-3 font-bold text-stone-700">{p.paymentMethod}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getPaymentStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {p.status === 'Paid' ? (
                        <button
                          onClick={() => handleIssueRefund(p._id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                        >
                          Issue Refund
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400 italic">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SUPPORT CHAT CONSOLE */}
      {activeTab === 'chats' && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px] animate-in fade-in duration-200">
          
          {/* Thread List */}
          <div className="md:col-span-4 border-r border-stone-200 p-4 space-y-2 bg-stone-50">
            <h3 className="font-extrabold text-stone-900 text-sm px-2 pb-2 border-b border-stone-200">
              Active Customer Threads ({chatsList.length})
            </h3>
            <div className="space-y-1 overflow-y-auto max-h-[440px]">
              {chatsList.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => selectChat(chat)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all ${
                    activeChat?._id === chat._id
                      ? 'bg-white shadow-xs border border-orange-200'
                      : 'hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-stone-900 truncate">{chat.userName}</span>
                    <span className="text-[9px] text-stone-400">
                      {new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate">{chat.lastMessage || 'Started conversation'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Chat Conversation Area */}
          <div className="md:col-span-8 flex flex-col justify-between p-6">
            {activeChat ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{activeChat.userName}</h4>
                    <span className="text-xs text-stone-400">{activeChat.userEmail}</span>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    Ticket Active
                  </span>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[350px]">
                  {chatMessages.map((m, idx) => {
                    const isAdminMsg = m.senderRole === 'admin';
                    return (
                      <div key={idx} className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}>
                        <span className="text-[9px] text-stone-400 px-1 mb-0.5">{m.senderName}</span>
                        <div className={`p-3 rounded-2xl text-xs max-w-sm ${
                          isAdminMsg ? 'bg-purple-700 text-white' : 'bg-stone-100 text-stone-800'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleAdminReply} className="flex gap-2 pt-3 border-t border-stone-100">
                  <input
                    type="text"
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    placeholder="Type official admin reply..."
                    className="flex-1 bg-stone-100 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-600 border border-stone-200"
                  />
                  <button
                    type="submit"
                    className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Reply
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-24 text-xs text-stone-400">
                Select a customer thread on the left to view messages and respond.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ADD FOOD MODAL */}
      {showAddFoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-stone-900 text-base">Add New Menu Dish</h3>
              <button onClick={() => setShowAddFoodModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleCreateFood} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Dish Name</label>
                <input
                  type="text"
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  placeholder="e.g. Saffron Dum Biryani"
                  className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newFood.description}
                  onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                  className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newFood.price}
                    onChange={(e) => setNewFood({ ...newFood, price: Number(e.target.value) })}
                    className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Category</label>
                  <select
                    value={newFood.category}
                    onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                    className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                  >
                    <option value="Biryani">Biryani</option>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Burgers">Burgers</option>
                    <option value="North Indian">North Indian</option>
                    <option value="South Indian">South Indian</option>
                    <option value="Healthy Bowls">Healthy Bowls</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Kitchen Partner</label>
                  <select
                    value={newFood.restaurant}
                    onChange={(e) => setNewFood({ ...newFood, restaurant: e.target.value })}
                    className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                    required
                  >
                    {restaurantsList.map(r => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Diet Type</label>
                  <select
                    value={newFood.isVeg}
                    onChange={(e) => setNewFood({ ...newFood, isVeg: e.target.value === 'true' })}
                    className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                  >
                    <option value="true">Pure Vegetarian</option>
                    <option value="false">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Image URL</label>
                <input
                  type="text"
                  value={newFood.image}
                  onChange={(e) => setNewFood({ ...newFood, image: e.target.value })}
                  className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Create Dish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD RESTAURANT MODAL */}
      {showAddRestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-stone-900 text-base">Add New Partner Restaurant</h3>
              <button onClick={() => setShowAddRestModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={newRest.name}
                  onChange={(e) => setNewRest({ ...newRest, name: e.target.value })}
                  placeholder="e.g. Spice Route Kitchen"
                  className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Description</label>
                <input
                  type="text"
                  value={newRest.description}
                  onChange={(e) => setNewRest({ ...newRest, description: e.target.value })}
                  className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Area</label>
                  <input
                    type="text"
                    value={newRest.area}
                    onChange={(e) => setNewRest({ ...newRest, area: e.target.value })}
                    className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Delivery Time (Mins)</label>
                  <input
                    type="number"
                    value={newRest.deliveryTimeMinutes}
                    onChange={(e) => setNewRest({ ...newRest, deliveryTimeMinutes: Number(e.target.value) })}
                    className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Cuisines (Comma separated)</label>
                <input
                  type="text"
                  value={newRest.cuisines}
                  onChange={(e) => setNewRest({ ...newRest, cuisines: e.target.value })}
                  className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Register Partner
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
