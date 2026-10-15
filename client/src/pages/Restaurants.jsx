import React, { useState, useEffect } from 'react';
import { Search, Filter, Store, Sparkles, SlidersHorizontal, Check, MapPin } from 'lucide-react';
import API from '../services/api';
import RestaurantCard from '../components/RestaurantCard';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [pureVegOnly, setPureVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);

  const cuisinesList = [
    'All',
    'Biryani',
    'South Indian',
    'Andhra',
    'North Indian',
    'Pizzas',
    'Burgers',
    'Chinese',
    'Healthy Bowls',
    'Desserts',
    'Bakery'
  ];

  const bangaloreAreas = [
    'All Areas',
    'Koramangala',
    'Indiranagar',
    'Jayanagar',
    'Basavanagudi',
    'Malleshwaram',
    'Church Street',
    'Whitefield',
    'HSR Layout'
  ];

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCuisine, selectedArea, pureVegOnly, sortBy]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      const combinedSearch = [search.trim(), selectedArea !== 'All Areas' ? selectedArea : ''].filter(Boolean).join(' ');
      if (combinedSearch) params.append('search', combinedSearch);
      if (selectedCuisine !== 'All') params.append('cuisine', selectedCuisine);
      if (pureVegOnly) params.append('pureVeg', 'true');
      if (sortBy) params.append('sort', sortBy);

      const res = await API.get(`/restaurants?${params.toString()}`);
      if (res.data.success) {
        setRestaurants(res.data.restaurants);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-stone-200 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
              TastyBite Partner Hub
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-display">
              Explore Best Restaurants
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Top kitchen partners delivering fresh, chef-curated culinary creations across Bengaluru
            </p>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurant, cuisine, or area..."
              className="w-full bg-white text-sm text-stone-800 rounded-full pl-10 pr-4 py-2.5 border border-stone-200 focus:outline-none focus:border-orange-500 shadow-2xs"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </form>
        </div>
      </div>

      {/* Bangalore Localities Quick Filter Row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        <div className="flex items-center gap-1.5 text-xs font-black text-stone-700 shrink-0 pr-1">
          <MapPin className="w-3.5 h-3.5 text-orange-600" />
          <span>Bengaluru Hubs:</span>
        </div>
        {bangaloreAreas.map((area) => (
          <button
            key={area}
            onClick={() => setSelectedArea(area)}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedArea === area
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Filter & Sort Bar */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
        
        {/* Cuisine Filter Pills - Fully Wrapped for Complete Visibility */}
        <div className="flex flex-wrap items-center gap-2">
          {cuisinesList.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCuisine === cuisine
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>

        {/* Veg Toggle & Sorting Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100">
          <div className="text-xs font-bold text-stone-500">
            Showing <span className="text-orange-600 font-extrabold">{restaurants.length}</span> restaurant partners in Bengaluru
          </div>

          <div className="flex items-center gap-4">
            {/* Pure Veg Toggle */}
            <button
              onClick={() => setPureVegOnly(!pureVegOnly)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                pureVegOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-300 hover:border-emerald-500'
              }`}
            >
              <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${pureVegOnly ? 'border-white bg-white' : 'border-emerald-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pureVegOnly ? 'bg-emerald-600' : 'bg-emerald-600'}`} />
              </span>
              <span>Pure Veg Only</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-400 font-semibold hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-stone-100 font-bold text-stone-700 text-xs px-3 py-1.5 rounded-xl border border-stone-200 focus:outline-none"
              >
                <option value="rating">Top Rated</option>
                <option value="deliveryTime">Fastest Delivery</option>
                <option value="costLow">Cost: Low to High</option>
                <option value="costHigh">Cost: High to Low</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Restaurant Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 bg-stone-200 rounded-3xl" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <Store className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-extrabold text-stone-800 text-lg">No Restaurants Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            We couldn't find any restaurants matching your current search or filter criteria. Try clearing some filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCuisine('All');
              setPureVegOnly(false);
              setSortBy('rating');
            }}
            className="mt-3 bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurants.map((rest) => (
            <RestaurantCard key={rest._id} restaurant={rest} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Restaurants;
