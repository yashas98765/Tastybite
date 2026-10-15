import React, { useState } from 'react';
import { Star, Clock, Flame, Heart, Plus, Minus, Info, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { getFoodPlaceholder } from '../utils/placeholder';

const FoodCard = ({ food, onShowDetails }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const { isAuthenticated, toggleWishlist, isWishlisted } = useAuth();
  const [justAdded, setJustAdded] = useState(false);

  // Check if item is in cart
  const cartItem = cartItems.find(item => item.food._id === food._id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const wishlisted = isWishlisted(food._id);

  const discountedPrice = food.discountPercentage > 0
    ? Number((food.price * (1 - food.discountPercentage / 100)).toFixed(2))
    : food.price;

  const handleAdd = () => {
    addToCart(food, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const spiceColors = {
    None: 'bg-stone-100 text-stone-600',
    Mild: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Hot: 'bg-orange-50 text-orange-700 border-orange-200',
    'Extra Spicy': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-stone-200/70 hover:border-orange-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Top Media Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getFoodPlaceholder(food.name, food.category);
          }}
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Veg / Non-Veg Indicator */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span
              className={`w-5 h-5 rounded-md flex items-center justify-center border shadow-xs bg-white ${
                food.isVeg ? 'border-emerald-600' : 'border-rose-600'
              }`}
              title={food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
            </span>

            {food.isBestseller && (
              <span className="bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
                Bestseller
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={() => toggleWishlist(food._id)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all pointer-events-auto shadow-md ${
              wishlisted
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-white/90 backdrop-blur-md text-stone-600 hover:text-rose-500 hover:bg-white'
            }`}
            title={wishlisted ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Discount Tag */}
        {food.discountPercentage > 0 && (
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-600 to-rose-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-md shadow-md">
            {food.discountPercentage}% OFF
          </div>
        )}

        {/* Prep Time pill */}
        <div className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-md text-stone-200 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3 text-orange-400" />
          {food.prepTimeMinutes || 20}m
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Category & Rating */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md">
              {food.category}
            </span>
            <div className="flex items-center gap-1 font-bold text-stone-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{food.rating || 4.5}</span>
              <span className="text-[10px] text-stone-400">({food.ratingCount || 40})</span>
            </div>
          </div>

          {/* Food Title */}
          <h3 className="font-bold text-stone-900 text-base group-hover:text-orange-600 transition-colors line-clamp-1">
            {food.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {food.description}
          </p>

          {/* Spice & Dietary Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {food.spiceLevel && food.spiceLevel !== 'None' && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-0.5 ${spiceColors[food.spiceLevel] || ''}`}>
                <Flame className="w-2.5 h-2.5" />
                {food.spiceLevel}
              </span>
            )}

            {food.nutrition && (
              <button
                onClick={() => onShowDetails && onShowDetails(food)}
                className="text-[10px] font-semibold text-stone-500 hover:text-stone-800 bg-stone-100 px-2 py-0.5 rounded-md flex items-center gap-1 hover:bg-stone-200 transition-colors"
                title="View Nutrition"
              >
                <Info className="w-2.5 h-2.5" />
                {food.nutrition.calories} kcal
              </button>
            )}

            {food.dietaryTags?.slice(0, 1).map((tag, idx) => (
              <span key={idx} className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & Cart Action */}
        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-stone-900">
                {formatCurrency(discountedPrice)}
              </span>
              {food.discountPercentage > 0 && (
                <span className="text-xs text-stone-400 line-through">
                  {formatCurrency(food.price)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-stone-400 font-medium block">
              {food.portionSize || '1 Serving'}
            </span>
          </div>

          {/* Add / Stepper */}
          {quantityInCart === 0 ? (
            <button
              onClick={handleAdd}
              disabled={!food.isAvailable}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                food.isAvailable
                  ? justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 hover:bg-orange-600 text-white hover:scale-102 shadow-stone-900/10'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Added
                </>
              ) : food.isAvailable ? (
                <>
                  <Plus className="w-3.5 h-3.5" /> Add
                </>
              ) : (
                'Sold Out'
              )}
            </button>
          ) : (
            <div className="flex items-center bg-orange-600 text-white rounded-xl overflow-hidden shadow-xs">
              <button
                onClick={() => updateQuantity(food._id, -1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-orange-700 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-bold text-xs">
                {quantityInCart}
              </span>
              <button
                onClick={() => updateQuantity(food._id, 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
