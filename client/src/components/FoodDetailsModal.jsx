import React from 'react';
import { X, Flame, Star, Clock, Plus, Minus, Check, Heart, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { getFoodPlaceholder } from '../utils/placeholder';

const FoodDetailsModal = ({ food, onClose }) => {
  if (!food) return null;

  const { cartItems, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isWishlisted } = useAuth();

  const cartItem = cartItems.find(item => item.food._id === food._id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const wishlisted = isWishlisted(food._id);

  const discountedPrice = food.discountPercentage > 0
    ? Number((food.price * (1 - food.discountPercentage / 100)).toFixed(2))
    : food.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Top Image Banner */}
        <div className="relative aspect-16/9 bg-stone-100 shrink-0">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getFoodPlaceholder(food.name, food.category);
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-md ${food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              {food.isVeg ? 'Pure Veg' : 'Non-Veg'}
            </span>
            <span className="bg-stone-900/80 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {food.rating} ({food.ratingCount} reviews)
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                {food.category} • {food.cuisine}
              </span>
              <button
                onClick={() => toggleWishlist(food._id)}
                className={`p-1.5 rounded-full transition-colors ${wishlisted ? 'text-rose-500' : 'text-stone-400 hover:text-rose-500'}`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
            <h2 className="text-xl font-extrabold text-stone-900 mt-1 font-display">
              {food.name}
            </h2>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              {food.description}
            </p>
          </div>

          {/* Nutrition Facts Grid */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Nutritional Profile (Per Serving)
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-stone-100 shadow-2xs">
                <span className="text-base font-extrabold text-stone-900 block">
                  {food.nutrition?.calories || 350}
                </span>
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Calories</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-100 shadow-2xs">
                <span className="text-base font-extrabold text-stone-900 block">
                  {food.nutrition?.protein || 12}g
                </span>
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Protein</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-100 shadow-2xs">
                <span className="text-base font-extrabold text-stone-900 block">
                  {food.nutrition?.carbs || 45}g
                </span>
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Carbs</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-100 shadow-2xs">
                <span className="text-base font-extrabold text-stone-900 block">
                  {food.nutrition?.fat || 14}g
                </span>
                <span className="text-[10px] text-stone-500 uppercase font-semibold">Fat</span>
              </div>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <span className="text-stone-400 block font-medium">Spice Level</span>
              <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                {food.spiceLevel || 'Medium'}
              </span>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <span className="text-stone-400 block font-medium">Prep Time</span>
              <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                ~{food.prepTimeMinutes || 20} Minutes
              </span>
            </div>
          </div>

          {/* Dietary tags */}
          {food.dietaryTags?.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-stone-400 block mb-1.5">Dietary Highlights:</span>
              <div className="flex flex-wrap gap-1.5">
                {food.dietaryTags.map((tag, idx) => (
                  <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Add to Cart */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-stone-900">
                {formatCurrency(discountedPrice)}
              </span>
              {food.discountPercentage > 0 && (
                <span className="text-xs text-stone-400 line-through">
                  {formatCurrency(food.price)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-stone-400 font-medium">Taxes calculated at checkout</span>
          </div>

          {quantity === 0 ? (
            <button
              onClick={() => addToCart(food, 1)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add to Cart
            </button>
          ) : (
            <div className="flex items-center bg-orange-600 text-white rounded-xl overflow-hidden shadow-xs">
              <button
                onClick={() => updateQuantity(food._id, -1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-orange-700 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-bold text-sm">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(food._id, 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FoodDetailsModal;
