import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Users,
  Clock,
  ShieldCheck,
  ChevronRight,
  Flame,
  ArrowRight,
  Star,
  MapPin,
  UtensilsCrossed,
  Truck,
  CreditCard,
  Smile
} from 'lucide-react';
import API from '../services/api';
import FoodCard from '../components/FoodCard';
import RestaurantCard from '../components/RestaurantCard';
import FoodDetailsModal from '../components/FoodDetailsModal';
import { getFoodPlaceholder } from '../utils/placeholder';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [catRes, restRes, foodRes] = await Promise.all([
        API.get('/foods/categories'),
        API.get('/restaurants'),
        API.get('/foods?sort=popular')
      ]);

      if (catRes.data.success) setCategories(catRes.data.categories);
      if (restRes.data.success) {
        setFeaturedRestaurants(restRes.data.restaurants.slice(0, 4));
      }
      if (foodRes.data.success) {
        setPopularFoods(foodRes.data.foods.slice(0, 8));
      }
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* Logged In Welcome Portal Banner */}
      {isAuthenticated && (
        <div className="bg-stone-900 border-b border-stone-800 text-white px-4 py-2.5 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
              <span>
                Welcome back, <strong className="text-white">{user?.name}</strong>! Access your multi-portal control center.
              </span>
            </div>
            <Link
              to="/portal"
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold px-3.5 py-1 rounded-full shadow-xs transition-all flex items-center gap-1 shrink-0"
            >
              <span>Open TastyBite Portal Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-orange-100/60">
        
        {/* Subtle Decorative Blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-orange-300/20 to-amber-200/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-orange-200 shadow-2xs">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                <span>Good Food, Just a Bite Away.</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.1] font-display">
                Feast on Craveable <br className="hidden sm:inline" />
                Dishes in <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 bg-clip-text text-transparent">Minutes.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Explore handpicked local kitchens, artisan bakes, and steaming biryanis with intelligent flavor recommendations and seamless shared group ordering.
              </p>

              {/* Search Bar Input */}
              <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto lg:mx-0 relative shadow-lg shadow-orange-500/10 rounded-2xl bg-white p-2 border border-stone-200 flex items-center gap-2">
                <Search className="w-5 h-5 text-stone-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you craving today? (e.g. Biryani, Burger, Pizza)..."
                  className="w-full text-sm text-stone-800 placeholder-stone-400 focus:outline-none px-2"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Quick Category Tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2 text-xs font-semibold text-stone-500">
                <span className="text-stone-400">Popular:</span>
                {['Biryani', 'Seafood', 'Indian Paneer', 'Chinese', 'Continental', 'Desserts', 'Hot Beverages'].map((item) => (
                  <Link
                    key={item}
                    to={`/menu?category=${encodeURIComponent(item)}`}
                    className="bg-white hover:bg-orange-50 text-stone-700 hover:text-orange-600 px-3 py-1 rounded-full border border-stone-200 transition-colors shadow-2xs"
                  >
                    {item}
                  </Link>
                ))}
              </div>

              {/* Highlight Stats Strip */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200/80 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-stone-900 font-display block">8+</span>
                  <span className="text-xs text-stone-500 font-medium">Curated Kitchens</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-stone-900 font-display block">30+</span>
                  <span className="text-xs text-stone-500 font-medium">Signature Dishes</span>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-stone-900 font-display block">25m</span>
                  <span className="text-xs text-stone-500 font-medium">Average Delivery</span>
                </div>
              </div>

            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Hero Food Card */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white group">
                  <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                    <img
                      src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
                      alt="TastyBite Biryani"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      4.9 (420+ Orders Today)
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-stone-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-base">Royal Hyderabadi Dum Biryani</h4>
                        <p className="text-xs text-stone-500">Slow-cooked saffron basmati & spices</p>
                      </div>
                      <Link
                        to="/menu?search=biryani"
                        className="w-10 h-10 rounded-xl bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-colors shrink-0"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating Micro Card 1: Fast Delivery */}
                <div className="absolute -top-5 -left-5 bg-white p-3.5 rounded-2xl shadow-xl border border-stone-100 hidden sm:flex items-center gap-3 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Live GPS</span>
                    <span className="text-xs font-extrabold text-stone-800">Rider 5 Mins Away</span>
                  </div>
                </div>

                {/* Floating Micro Card 2: Group Order */}
                <div className="absolute -bottom-6 -right-4 bg-white p-3.5 rounded-2xl shadow-xl border border-stone-100 hidden sm:flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">TastyBite Feast</span>
                    <span className="text-xs font-extrabold text-stone-800">Split Bill Easily</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* 2. FOOD CATEGORIES CAROUSEL / GRID */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
                Delicious Diversity
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
                Explore What You Love
              </h2>
            </div>
            <Link
              to="/menu"
              className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
            >
              <span>View All Menu</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3.5">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/menu?category=${encodeURIComponent(cat.name)}`}
                className="group flex flex-col items-center p-3 rounded-2xl bg-white hover:bg-orange-50/60 border border-stone-200/80 hover:border-orange-300 shadow-2xs hover:shadow-md transition-all text-center"
              >
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-stone-100 mb-2.5 shadow-2xs">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getFoodPlaceholder(cat.name, cat.name);
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-stone-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. PROMOTIONAL FEATURE BANNERS (Smart Picks & Group Order) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Smart Picks Banner */}
          <div className="relative rounded-3xl p-8 bg-gradient-to-br from-purple-900 via-indigo-900 to-stone-900 text-white overflow-hidden shadow-xl flex flex-col justify-between group">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                TastyBite Smart Picks
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display leading-tight">
                Not Sure What to Eat?<br />Let Our Engine Decide.
              </h3>
              <p className="text-sm text-purple-200/80 max-w-sm leading-relaxed">
                Select your budget, spice preference, and dietary goals to discover perfectly matched meals.
              </p>
              <Link
                to="/smart-picks"
                className="inline-flex items-center gap-2 bg-white text-purple-950 hover:bg-purple-100 font-extrabold text-sm px-5 py-3 rounded-xl shadow-md transition-all group-hover:scale-102"
              >
                <span>Launch Smart Recommendation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Group Ordering Banner */}
          <div className="relative rounded-3xl p-8 bg-gradient-to-br from-teal-900 via-emerald-950 to-stone-900 text-white overflow-hidden shadow-xl flex flex-col justify-between group">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold px-3 py-1 rounded-full">
                <Users className="w-3.5 h-3.5" />
                TastyBite Group Feast
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display leading-tight">
                Order Together with Friends.<br />Split Bill Painlessly.
              </h3>
              <p className="text-sm text-teal-200/80 max-w-sm leading-relaxed">
                Create a shared link, everyone picks their favorite dish, and let TastyBite calculate individual itemized bills.
              </p>
              <Link
                to="/group-orders"
                className="inline-flex items-center gap-2 bg-white text-teal-950 hover:bg-teal-50 font-extrabold text-sm px-5 py-3 rounded-xl shadow-md transition-all group-hover:scale-102"
              >
                <span>Start Group Order</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          </div>

        </section>

        {/* 4. POPULAR DISHES */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
                Top Rated Picks
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
                Trending on TastyBite
              </h2>
            </div>
            <Link
              to="/menu"
              className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
            >
              <span>See Full Menu</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularFoods.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                onShowDetails={(f) => setSelectedFood(f)}
              />
            ))}
          </div>
        </section>

        {/* 5. FEATURED RESTAURANTS */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
                Partner Kitchens
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
                Top Rated Restaurants
              </h2>
            </div>
            <Link
              to="/restaurants"
              className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
            >
              <span>View All 8+ Kitchens</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        </section>

        {/* 6. HOW TASTYBITE WORKS (4-STEP WORKFLOW) */}
        <section className="bg-stone-100/70 rounded-3xl p-8 sm:p-12 border border-stone-200">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
              Seamless Experience
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
              How TastyBite Works
            </h2>
            <p className="text-sm text-stone-500 mt-2">
              From our partner kitchen to your dining table in four easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-xl font-black">
                1
              </div>
              <h3 className="font-extrabold text-stone-900 text-base">Select Your Food</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Browse our curated partner restaurants or use Smart Picks for instant customized meal choices.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-xl font-black">
                2
              </div>
              <h3 className="font-extrabold text-stone-900 text-base">Order Solo or Group</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Invite friends via a single code or order individually with test UPI/cards & promo discounts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto text-xl font-black">
                3
              </div>
              <h3 className="font-extrabold text-stone-900 text-base">Live Kitchen Tracking</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Watch real-time status updates via WebSockets as master chefs cook and pack your piping hot dish.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-black">
                4
              </div>
              <h3 className="font-extrabold text-stone-900 text-base">Instant PDF Receipts</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Enjoy your delicious meal and immediately download your formal Tax Invoice and Payment Receipt PDFs.
              </p>
            </div>

          </div>
        </section>

        {/* 7. CUSTOMER REVIEWS */}
        <section>
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
              Foodie Love
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
              Loved by Hungry Students & Foodies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed italic">
                  "The TastyBite Group Order feature made hostel dinner ordering so much easier. Everyone picked their own pizza and the split bill calculated each friend's share down to the rupee!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
                  alt="Customer"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">Arjun Nair</h4>
                  <span className="text-[10px] text-stone-400">Bangalore University Student</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed italic">
                  "Smart Picks is genuinely impressive. I set my diet to High-Protein and budget to ₹400 and it recommended the Grilled Chicken Quinoa Bowl. Delivered hot in 20 minutes!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                  alt="Customer"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">Sneha Rao</h4>
                  <span className="text-[10px] text-stone-400">Software Developer, Indiranagar</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed italic">
                  "Real-time tracking works smoothly and downloading the tax invoice PDF right from the order confirmation page gave it that official, reliable feel. 10/10 project execution!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80"
                  alt="Customer"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">Karthik Menon</h4>
                  <span className="text-[10px] text-stone-400">Product Designer, Koramangala</span>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>

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

export default Home;
