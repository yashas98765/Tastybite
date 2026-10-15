import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, UtensilsCrossed, X, RotateCcw } from 'lucide-react';
import API from '../services/api';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';

const FoodMenu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [isVeg, setIsVeg] = useState(searchParams.get('isVeg') || '');
  const [spiceLevel, setSpiceLevel] = useState('All');
  const [mealType, setMealType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(800);
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Sync URL params
    const initialSearch = searchParams.get('search');
    const initialCategory = searchParams.get('category');
    if (initialSearch !== null && initialSearch !== undefined) setSearch(initialSearch);
    if (initialCategory) setCategory(initialCategory);
  }, [searchParams]);

  useEffect(() => {
    fetchFoods();
  }, [category, isVeg, spiceLevel, mealType, maxPrice, sortBy]);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/foods/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (e) {}
  };

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (category !== 'All') params.append('category', category);
      if (isVeg !== '') params.append('isVeg', isVeg);
      if (spiceLevel !== 'All') params.append('spiceLevel', spiceLevel);
      if (mealType !== 'All') params.append('mealType', mealType);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sort', sortBy);

      const res = await API.get(`/foods?${params.toString()}`);
      if (res.data.success) {
        setFoods(res.data.foods);
      }
    } catch (err) {
      console.error('Error fetching foods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search, category });
    fetchFoods();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setIsVeg('');
    setSpiceLevel('All');
    setMealType('All');
    setMaxPrice(800);
    setSortBy('popular');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title & Search Header */}
      <div className="border-b border-stone-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
              Culinary Delights
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-display">
              {category !== 'All' ? `${category} Dishes` : 'Explore Full Menu'}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Discover authentic signature dishes cooked with farm-fresh ingredients
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dish or ingredients..."
              className="w-full bg-white text-sm text-stone-800 rounded-full pl-10 pr-4 py-2.5 border border-stone-200 focus:outline-none focus:border-orange-500 shadow-2xs"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </form>
        </div>
      </div>

      {/* Filter and Control Panel */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
        
        {/* Category Pills Bar (Wrapped so all 14 categories are completely visible) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategory('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              category === 'All'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Categories ({categories.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                category === cat.name
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filter Row: Veg, Spice, Meal Type, Price, Sort */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-stone-100 text-xs">
          
          {/* Veg / Non-Veg filter */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Diet
            </label>
            <select
              value={isVeg}
              onChange={(e) => setIsVeg(e.target.value)}
              className="w-full bg-stone-100 font-semibold text-stone-700 p-2 rounded-xl border border-stone-200 focus:outline-none"
            >
              <option value="">All Diet Types</option>
              <option value="true">Pure Veg Only 🌿</option>
              <option value="false">Non-Veg 🍗</option>
            </select>
          </div>

          {/* Spice Level */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Spice Affinity
            </label>
            <select
              value={spiceLevel}
              onChange={(e) => setSpiceLevel(e.target.value)}
              className="w-full bg-stone-100 font-semibold text-stone-700 p-2 rounded-xl border border-stone-200 focus:outline-none"
            >
              <option value="All">Any Spice</option>
              <option value="Mild">Mild 🟢</option>
              <option value="Medium">Medium 🟡</option>
              <option value="Hot">Hot & Spicy 🔥</option>
            </select>
          </div>

          {/* Meal Type */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Meal Time
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full bg-stone-100 font-semibold text-stone-700 p-2 rounded-xl border border-stone-200 focus:outline-none"
            >
              <option value="All">All Times</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snacks">Snacks</option>
              <option value="Beverages">Beverages</option>
              <option value="Desserts">Desserts</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-stone-100 font-semibold text-stone-700 p-2 rounded-xl border border-stone-200 focus:outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="prepTime">Fastest Prep</option>
            </select>
          </div>

          {/* Max Price Range */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Max Price
              </label>
              <span className="text-[10px] font-bold text-orange-600">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold p-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
          </div>

        </div>

      </div>

      {/* Foods Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-stone-200 rounded-3xl" />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 space-y-3">
          <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-extrabold text-stone-800 text-lg">No Dishes Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search keywords, budget, or filters to find tasty options.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-3 bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {foods.map((food) => (
            <FoodCard
              key={food._id}
              food={food}
              onShowDetails={(f) => setSelectedFood(f)}
            />
          ))}
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

export default FoodMenu;
