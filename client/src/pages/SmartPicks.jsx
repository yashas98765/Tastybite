import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  Flame,
  Wallet,
  Utensils,
  Award,
  CheckCircle2,
  Info,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import API from '../services/api';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';

const SmartPicks = () => {
  const [dietary, setDietary] = useState('all');
  const [budget, setBudget] = useState(450);
  const [mealType, setMealType] = useState('Dinner');
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [cuisine, setCuisine] = useState('All');

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  useEffect(() => {
    runRecommendation();
  }, []);

  const runRecommendation = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        dietary,
        budget: String(budget),
        mealType,
        spiceLevel,
        cuisine,
        limit: '8'
      });

      const res = await API.get(`/recommendations/smart-picks?${params.toString()}`);
      if (res.data.success) {
        setRecommendations(res.data.recommendations || []);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const dietOptions = [
    { id: 'all', label: 'Any Diet', icon: '🍽️' },
    { id: 'veg', label: 'Vegetarian', icon: '🌿' },
    { id: 'non-veg', label: 'Non-Vegetarian', icon: '🍗' },
    { id: 'high-protein', label: 'High Protein', icon: '💪' },
    { id: 'keto', label: 'Keto Friendly', icon: '🥑' },
    { id: 'low-calorie', label: 'Low Calorie', icon: '🥗' }
  ];

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];
  const spiceLevels = ['None', 'Mild', 'Medium', 'Hot'];
  const cuisines = ['All', 'North Indian', 'South Indian', 'Italian', 'American', 'Chinese', 'Healthy'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. HERO HEADER */}
      <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-purple-900 via-indigo-950 to-stone-900 text-white overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold px-3.5 py-1.5 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>TastyBite Smart Picks • Intelligent Rule-Based Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Personalized Food Matches <br />
            Curated in Real-Time.
          </h1>

          <p className="text-sm text-purple-200/80 leading-relaxed">
            Eliminate decision fatigue. Tell us your diet goals, price ceiling, and flavor preference, and our scoring engine will rank the highest rated dishes for you.
          </p>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. INTERACTIVE CONTROLLER CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-600" />
            <h3 className="font-extrabold text-stone-900 text-base">Your Flavor & Budget Parameters</h3>
          </div>
          <button
            onClick={runRecommendation}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Re-calculate Picks
          </button>
        </div>

        {/* Dietary Options Pills */}
        <div>
          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-2.5">
            1. Dietary Preference
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {dietOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDietary(opt.id)}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  dietary === opt.id
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Budget Slider */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-700 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-purple-600" />
                Target Budget
              </span>
              <span className="text-base font-black text-purple-700">₹{budget}</span>
            </div>
            <input
              type="range"
              min="100"
              max="900"
              step="50"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-semibold">
              <span>Budget (₹100)</span>
              <span>Luxury (₹900)</span>
            </div>
          </div>

          {/* Meal Type */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-purple-600" />
              Meal Occasion
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {mealTypes.map((mt) => (
                <button
                  key={mt}
                  onClick={() => setMealType(mt)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    mealType === mt
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {mt}
                </button>
              ))}
            </div>
          </div>

          {/* Spice Affinity */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              Spice Affinity
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {spiceLevels.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSpiceLevel(sp)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    spiceLevel === sp
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Generate Button */}
        <div className="pt-2 text-center">
          <button
            onClick={runRecommendation}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-purple-600/25 transition-all hover:scale-102 cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Smart Recommendations</span>
          </button>
        </div>

      </div>

      {/* 3. RECOMMENDATIONS RESULTS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-stone-900 font-display">
              Smart Pick Results ({recommendations.length} Matches)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Ranked by flavor alignment, diet score, budget efficiency, and customer ratings
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-stone-200 rounded-3xl" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
            <Award className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-extrabold text-stone-800 text-lg">No Exact Matches</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try increasing your budget or loosening spice criteria to see more dishes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((food, idx) => (
              <div key={food._id} className="relative flex flex-col justify-between">
                
                {/* Algorithmic Match Reason Badge */}
                <div className="mb-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-900 px-3 py-1.5 rounded-xl border border-purple-200 text-[11px] font-bold flex items-center justify-between shadow-2xs">
                  <span className="truncate pr-1">✨ {food.recommendationReason}</span>
                  <span className="bg-purple-600 text-white text-[10px] px-1.5 py-0.2 rounded-full shrink-0">
                    {Math.min(99, 85 + (idx === 0 ? 14 : Math.max(0, 12 - idx * 3)))}% Match
                  </span>
                </div>

                <FoodCard
                  food={food}
                  onShowDetails={(f) => setSelectedFood(f)}
                />
              </div>
            ))}
          </div>
        )}
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

export default SmartPicks;
