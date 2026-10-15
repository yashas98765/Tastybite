import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, MapPin, Phone, ShieldCheck, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import API from '../services/api';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [categorizedMenu, setCategorizedMenu] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedFood, setSelectedFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cartItems, grandTotal, totalCount } = useCart();

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/restaurants/${id}`);
      if (res.data.success) {
        setRestaurant(res.data.restaurant);
        setMenu(res.data.menu || []);
        setCategorizedMenu(res.data.categorizedMenu || {});
        const categories = Object.keys(res.data.categorizedMenu || {});
        if (categories.length > 0) {
          setActiveCategory(categories[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching restaurant details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse space-y-4">
        <div className="h-64 bg-stone-200 rounded-3xl" />
        <div className="h-10 bg-stone-200 rounded-xl max-w-sm mx-auto" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="text-2xl font-bold text-stone-800">Restaurant Not Found</h2>
        <Link to="/restaurants" className="inline-block bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  const categoryNames = Object.keys(categorizedMenu);
  const displayedItems = activeCategory === 'All'
    ? menu
    : (categorizedMenu[activeCategory] || []);

  return (
    <div className="space-y-10 pb-28">
      
      {/* 1. RESTAURANT HERO BANNER */}
      <div className="relative bg-stone-900 text-white overflow-hidden">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 opacity-30">
          <img
            src={restaurant.bannerImage || restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-orange-500/20 text-orange-400 border border-orange-400/30 text-xs font-bold px-3 py-1 rounded-full">
                  {restaurant.cuisines?.join(' • ')}
                </span>
                {restaurant.pureVeg && (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full">
                    100% Pure Vegetarian
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
                {restaurant.name}
              </h1>

              <p className="text-sm text-stone-300 leading-relaxed">
                {restaurant.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-2">
                <div className="flex items-center gap-1.5 text-stone-200">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>{restaurant.location?.address}, {restaurant.location?.area}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-200">
                  <Phone className="w-4 h-4 text-orange-400" />
                  <span>{restaurant.phone || '+91 98765 43210'}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex md:flex-col gap-6 text-center shrink-0">
              <div>
                <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-xl">
                  <Star className="w-5 h-5 fill-current" />
                  <span>{restaurant.rating}</span>
                </div>
                <span className="text-[11px] text-stone-300 block">{restaurant.reviewCount} customer reviews</span>
              </div>
              <div className="border-t border-white/10 pt-3">
                <span className="text-lg font-black text-white block">{restaurant.deliveryTimeMinutes} mins</span>
                <span className="text-[11px] text-stone-300 block">Est. Delivery Time</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. MENU CONTENT SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Category Tabs */}
        <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-md py-3 border-b border-stone-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Items ({menu.length})
          </button>
          {categoryNames.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat} ({categorizedMenu[cat]?.length || 0})
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedItems.map((food) => (
            <FoodCard
              key={food._id}
              food={food}
              onShowDetails={(f) => setSelectedFood(f)}
            />
          ))}
        </div>

      </div>

      {/* 3. FLOATING CART FLOATER (if items in cart) */}
      {totalCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-md w-[92%] bg-stone-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-stone-700 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-bold text-sm">
              {totalCount}
            </div>
            <div>
              <span className="text-xs text-stone-400 block font-medium">Your TastyBite Cart</span>
              <span className="text-base font-extrabold text-white">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          <Link
            to="/cart"
            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <span>View Cart</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Nutrition Details Modal */}
      {selectedFood && (
        <FoodDetailsModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}

    </div>
  );
};

export default RestaurantDetails;
