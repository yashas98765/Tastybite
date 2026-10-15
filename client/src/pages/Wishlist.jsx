import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../services/api';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';

const Wishlist = () => {
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const [wishlistFoods, setWishlistFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.wishlist]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/profile');
      if (res.data.success && res.data.user?.wishlist) {
        setWishlistFoods(res.data.user.wishlist);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Heart className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-stone-900">Your Favorites</h2>
        <p className="text-xs text-stone-500">
          Please log in to view and save your favorite dishes.
        </p>
        <Link
          to="/login"
          className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-stone-200 pb-5">
        <span className="text-xs font-extrabold text-rose-600 uppercase tracking-widest block mb-1">
          Saved Collections
        </span>
        <h1 className="text-3xl font-black text-stone-900 font-display">
          Your Favorite Dishes ({wishlistFoods.length})
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Dishes you have loved and saved for fast 1-click reordering
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 bg-stone-200 rounded-3xl" />
          ))}
        </div>
      ) : wishlistFoods.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 space-y-3">
          <Heart className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-extrabold text-stone-800 text-lg">No Favorites Yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Click the heart icon on any mouth-watering dish while browsing to save it here for later!
          </p>
          <Link
            to="/menu"
            className="mt-3 inline-block bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
          >
            Explore Menu Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistFoods.map((food) => (
            <FoodCard
              key={food._id}
              food={food}
              onShowDetails={(f) => setSelectedFood(f)}
            />
          ))}
        </div>
      )}

      {selectedFood && (
        <FoodDetailsModal
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
        />
      )}
    </div>
  );
};

export default Wishlist;
