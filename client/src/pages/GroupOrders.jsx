import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Copy,
  Check,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Store,
  Share2,
  DollarSign,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Utensils
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatCurrency } from '../utils/formatters';

const GroupOrders = () => {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket, joinGroupRoom } = useSocket();

  // Mode: 'browse' (create/join selection) or 'active' (inside a room)
  const [groupOrder, setGroupOrder] = useState(null);
  const [inputCode, setInputCode] = useState(urlCode || '');
  const [guestName, setGuestName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestId, setSelectedRestId] = useState('');
  const [groupTitle, setGroupTitle] = useState('Weekend Feast with Friends');
  const [splitType, setSplitType] = useState('ITEMIZED');
  const [spendingLimit, setSpendingLimit] = useState(0);

  // Available foods from current group's restaurant
  const [restaurantMenu, setRestaurantMenu] = useState([]);

  useEffect(() => {
    fetchRestaurants();
    if (urlCode) {
      loadGroupByCode(urlCode);
    }
  }, [urlCode]);

  // Socket real-time synchronization
  useEffect(() => {
    if (socket && groupOrder) {
      joinGroupRoom(groupOrder.groupCode);

      const handleGroupUpdate = (updatedGroup) => {
        if (updatedGroup.groupCode === groupOrder.groupCode) {
          setGroupOrder(updatedGroup);
        }
      };

      socket.on('group_order_updated', handleGroupUpdate);

      return () => {
        socket.off('group_order_updated', handleGroupUpdate);
      };
    }
  }, [socket, groupOrder]);

  const fetchRestaurants = async () => {
    try {
      const res = await API.get('/restaurants');
      if (res.data.success && res.data.restaurants.length > 0) {
        setRestaurants(res.data.restaurants);
        setSelectedRestId(res.data.restaurants[0]._id);
      }
    } catch (e) {}
  };

  const loadGroupByCode = async (codeToLoad) => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get(`/group-orders/${codeToLoad.toUpperCase()}`);
      if (res.data.success) {
        setGroupOrder(res.data.groupOrder);
        // Load menu for selected restaurant
        const menuRes = await API.get(`/restaurants/${res.data.groupOrder.restaurant._id}`);
        if (menuRes.data.success) {
          setRestaurantMenu(menuRes.data.menu || []);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Group order not found or code invalid.');
      setGroupOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/group-orders');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await API.post('/group-orders', {
        restaurantId: selectedRestId,
        title: groupTitle,
        splitType,
        spendingLimitPerPerson: spendingLimit
      });
      if (res.data.success) {
        setShowCreateModal(false);
        setGroupOrder(res.data.groupOrder);
        navigate(`/group-order/${res.data.groupOrder.groupCode}`);
        loadGroupByCode(res.data.groupOrder.groupCode);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group order.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!inputCode.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await API.post(`/group-orders/${inputCode.trim().toUpperCase()}/join`, {
        guestName: guestName.trim() || 'Foodie Friend'
      });
      if (res.data.success) {
        setGroupOrder(res.data.groupOrder);
        navigate(`/group-order/${inputCode.trim().toUpperCase()}`);
        loadGroupByCode(inputCode.trim().toUpperCase());
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not join group.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (food) => {
    if (!groupOrder) return;
    try {
      const activeMemberName = user ? user.name : (guestName || 'Friend');
      const res = await API.post(`/group-orders/${groupOrder.groupCode}/items`, {
        foodId: food._id,
        memberName: activeMemberName,
        quantity: 1
      });
      if (res.data.success) {
        setGroupOrder(res.data.groupOrder);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item to group feast.');
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!groupOrder) return;
    try {
      const res = await API.delete(`/group-orders/${groupOrder.groupCode}/items/${itemId}`);
      if (res.data.success) {
        setGroupOrder(res.data.groupOrder);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item.');
    }
  };

  const handleToggleLock = async () => {
    if (!groupOrder) return;
    try {
      const res = await API.put(`/group-orders/${groupOrder.groupCode}/lock`);
      if (res.data.success) {
        setGroupOrder(res.data.groupOrder);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Only host can toggle lock.');
    }
  };

  const handleFinalizeCheckout = async () => {
    if (!groupOrder) return;
    try {
      setLoading(true);
      const res = await API.post(`/group-orders/${groupOrder.groupCode}/checkout`, {
        paymentMethod: 'UPI'
      });
      if (res.data.success) {
        navigate(`/payment/${res.data.order._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error finalizing group order.');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/group-order/${groupOrder.groupCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = user && groupOrder && groupOrder.host === user._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* 1. Header Banner */}
      <div className="rounded-3xl p-8 bg-gradient-to-r from-teal-900 via-emerald-950 to-stone-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold px-3 py-1 rounded-full">
            <Users className="w-3.5 h-3.5" />
            <span>TastyBite Group Feast • Shared Cart & Instant Bill Split</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white leading-tight">
            Order Together.<br />No More "Who Owes What".
          </h1>
          <p className="text-xs sm:text-sm text-teal-200/80 leading-relaxed">
            Create a shared group room, invite friends with a single 4-digit code, let everyone add their favorite dishes, and see individual bill splits automatically.
          </p>
        </div>

        {!groupOrder && (
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-teal-950 hover:bg-teal-50 font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Group</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. JOIN SECTION (If not in a group) */}
      {!groupOrder && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-stone-200 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 font-display">
              Have a Group Code?
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Enter the unique TastyBite group code shared by your host to join the room
            </p>
          </div>

          <div className="space-y-3 text-left">
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Your Name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Yashas"
                className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Group Code</label>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. TB-8921"
                className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 text-sm font-mono font-bold uppercase text-center tracking-widest"
              />
            </div>
          </div>

          <button
            onClick={handleJoinGroup}
            disabled={loading || !inputCode.trim()}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-extrabold text-sm py-3 rounded-2xl shadow-md transition-all cursor-pointer"
          >
            {loading ? 'Joining Room...' : 'Join Group Feast'}
          </button>
        </div>
      )}

      {/* 3. ACTIVE GROUP ORDER ROOM */}
      {groupOrder && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Room Control Bar */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-black text-stone-900 font-display">
                  {groupOrder.title}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                  groupOrder.status === 'OPEN'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {groupOrder.status}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Restaurant: <strong className="text-stone-800">{groupOrder.restaurant?.name}</strong> • Host: <strong className="text-stone-800">{groupOrder.hostName}</strong>
              </p>
            </div>

            {/* Code & Share Link */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-stone-100 px-3.5 py-2 rounded-xl border border-stone-200 flex items-center gap-2">
                <span className="text-[10px] text-stone-400 font-bold uppercase">Code:</span>
                <span className="text-sm font-black font-mono text-teal-800">{groupOrder.groupCode}</span>
              </div>

              <button
                onClick={copyShareLink}
                className="bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-teal-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
              </button>

              {isHost && (
                <button
                  onClick={handleToggleLock}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {groupOrder.status === 'OPEN' ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{groupOrder.status === 'OPEN' ? 'Lock Orders' : 'Unlock Orders'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Shared Cart & Split Billing Table */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Member items cards */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
                <h3 className="font-extrabold text-stone-900 text-base font-display flex items-center justify-between border-b border-stone-100 pb-3">
                  <span>Shared Feast Cart ({groupOrder.members.length} Members)</span>
                  <span className="text-xs text-stone-400 font-normal">Split Mode: <strong>{groupOrder.splitType}</strong></span>
                </h3>

                <div className="space-y-4">
                  {groupOrder.members.map((member, mIdx) => (
                    <div
                      key={mIdx}
                      className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3"
                    >
                      {/* Member title row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-teal-700 text-white text-xs font-bold flex items-center justify-center">
                            {member.guestName.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <span className="font-bold text-xs text-stone-900">{member.guestName}</span>
                            {member.isHost && (
                              <span className="ml-1.5 text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded-md">
                                Host
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-black text-stone-800">
                          Subtotal: {formatCurrency(member.individualSubtotal)}
                        </span>
                      </div>

                      {/* Member Items */}
                      {member.items?.length === 0 ? (
                        <p className="text-[11px] text-stone-400 italic">No food added yet</p>
                      ) : (
                        <div className="space-y-1.5 divide-y divide-stone-100">
                          {member.items.map((item) => (
                            <div key={item._id} className="pt-1.5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-orange-600">{item.quantity}x</span>
                                <span className="text-stone-800">{item.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-stone-900">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                                {groupOrder.status === 'OPEN' && (
                                  <button
                                    onClick={() => handleRemoveItem(item._id)}
                                    className="text-stone-300 hover:text-rose-600 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Exact Split Billing Breakdown Table */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-extrabold text-stone-900 text-base font-display flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-teal-600" />
                  Split Billing Calculator ({groupOrder.splitType === 'EQUAL' ? 'Equal Split' : 'Itemized Split'})
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="pb-2">Member</th>
                        <th className="pb-2">Dishes Value</th>
                        <th className="pb-2">Shared Taxes/Fee</th>
                        <th className="pb-2 text-right">Individual Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {groupOrder.members.map((m, idx) => {
                        const sharedOverheads = (groupOrder.tax + groupOrder.deliveryFee - (groupOrder.discount || 0)) / Math.max(1, groupOrder.members.length);
                        return (
                          <tr key={idx} className="hover:bg-stone-50">
                            <td className="py-2.5 font-bold text-stone-900">
                              {m.guestName} {m.isHost ? '(Host)' : ''}
                            </td>
                            <td className="py-2.5 text-stone-600">
                              {formatCurrency(m.individualSubtotal)}
                            </td>
                            <td className="py-2.5 text-stone-500">
                              {formatCurrency(sharedOverheads)}
                            </td>
                            <td className="py-2.5 text-right font-black text-teal-700">
                              {formatCurrency(m.splitShare)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: Menu Quick-Add & Finalize Order */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Group Total Card */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-extrabold text-stone-900 text-base font-display">
                  Total Feast Bill
                </h3>

                <div className="space-y-2 text-xs text-stone-600 border-b border-stone-100 pb-3">
                  <div className="flex justify-between">
                    <span>Group Subtotal</span>
                    <span className="font-bold text-stone-800">{formatCurrency(groupOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-stone-800">{groupOrder.deliveryFee === 0 ? 'FREE' : formatCurrency(groupOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & GST (5%)</span>
                    <span className="font-bold text-stone-800">{formatCurrency(groupOrder.tax)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-black text-stone-900 text-lg">Grand Total</span>
                  <span className="text-2xl font-black text-teal-700 font-display">
                    {formatCurrency(groupOrder.grandTotal)}
                  </span>
                </div>

                {/* Host Finalize Order Button */}
                {isHost && (
                  <button
                    onClick={handleFinalizeCheckout}
                    disabled={loading || groupOrder.subtotal === 0}
                    className="w-full bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 disabled:opacity-50 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg shadow-teal-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Finalize Feast & Proceed to Pay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {!isHost && (
                  <p className="text-[11px] text-stone-400 text-center italic">
                    The group host ({groupOrder.hostName}) will finalize and checkout once everyone has added their food.
                  </p>
                )}
              </div>

              {/* Add Dishes from Restaurant Menu */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                <h3 className="font-extrabold text-stone-900 text-sm flex items-center justify-between border-b border-stone-100 pb-2">
                  <span>Add Dishes from {groupOrder.restaurant?.name}</span>
                  <span className="text-xs text-orange-600 font-bold">{restaurantMenu.length} available</span>
                </h3>

                <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1 divide-y divide-stone-50">
                  {restaurantMenu.map((food) => (
                    <div key={food._id} className="pt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-stone-900 text-xs truncate block">{food.name}</span>
                          <span className="text-[11px] text-stone-500 font-semibold">{formatCurrency(food.price)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddItem(food)}
                        disabled={groupOrder.status !== 'OPEN'}
                        className="bg-stone-900 hover:bg-orange-600 disabled:opacity-40 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 4. CREATE GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-stone-900 text-base">Create TastyBite Feast</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Group Name / Event</label>
                <input
                  type="text"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Select Partner Restaurant</label>
                <select
                  value={selectedRestId}
                  onChange={(e) => setSelectedRestId(e.target.value)}
                  className="w-full bg-stone-100 p-2.5 rounded-xl border border-stone-200 font-semibold text-stone-800"
                >
                  {restaurants.map((r) => (
                    <option key={r._id} value={r._id}>{r.name} ({r.location?.area})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Split Billing Model</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSplitType('ITEMIZED')}
                    className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer ${
                      splitType === 'ITEMIZED' ? 'bg-teal-700 text-white border-teal-700' : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    Itemized (You eat, you pay)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitType('EQUAL')}
                    className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer ${
                      splitType === 'EQUAL' ? 'bg-teal-700 text-white border-teal-700' : 'bg-stone-50 border-stone-200 text-stone-700'
                    }`}
                  >
                    Equal Split (Divide equally)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm py-3 rounded-xl shadow-md transition-all cursor-pointer"
              >
                {loading ? 'Creating Group...' : 'Launch Group Feast'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GroupOrders;
