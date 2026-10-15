import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link
      to={`/restaurant/${restaurant._id}`}
      className="group bg-white rounded-3xl overflow-hidden border border-stone-200/80 hover:border-orange-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      {/* Top Banner Image */}
      <div className="relative aspect-16/9 overflow-hidden bg-stone-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {restaurant.isFeatured && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
          {restaurant.pureVeg && (
            <span className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-md">
              Pure Veg
            </span>
          )}
        </div>

        {/* Rating & Delivery Time bottom overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-1 bg-stone-900/80 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{restaurant.rating}</span>
            <span className="text-[10px] text-stone-300 font-normal">({restaurant.reviewCount})</span>
          </div>

          <div className="flex items-center gap-1 bg-stone-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-semibold text-stone-200">
            <Clock className="w-3 h-3 text-orange-400" />
            <span>{restaurant.deliveryTimeMinutes} mins</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-stone-900 text-lg group-hover:text-orange-600 transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5 font-medium">
            {restaurant.tagline || restaurant.cuisines?.join(' • ')}
          </p>

          {/* Cuisines Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {restaurant.cuisines?.slice(0, 3).map((c, i) => (
              <span key={i} className="text-[10px] bg-stone-100 text-stone-600 font-semibold px-2 py-0.5 rounded-md">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Location & Cost Info */}
        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1 truncate max-w-[55%]">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{restaurant.location?.area || 'Bangalore'}</span>
          </div>
          <div>
            <span className="font-bold text-stone-800">{formatCurrency(restaurant.costForTwo)}</span>
            <span className="text-[10px] text-stone-400 ml-1">for two</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
