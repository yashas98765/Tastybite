import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('tastybite_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [restaurant, setRestaurant] = useState(() => {
    const saved = localStorage.getItem('tastybite_cart_restaurant');
    return saved ? JSON.parse(saved) : null;
  });

  const [coupon, setCoupon] = useState(() => {
    const saved = localStorage.getItem('tastybite_cart_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('tastybite_cart', JSON.stringify(cartItems));
    if (cartItems.length === 0) {
      setRestaurant(null);
      setCoupon(null);
      localStorage.removeItem('tastybite_cart_restaurant');
      localStorage.removeItem('tastybite_cart_coupon');
    }
  }, [cartItems]);

  useEffect(() => {
    if (restaurant) {
      localStorage.setItem('tastybite_cart_restaurant', JSON.stringify(restaurant));
    }
  }, [restaurant]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('tastybite_cart_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('tastybite_cart_coupon');
    }
  }, [coupon]);

  const addToCart = (food, quantity = 1, restInfo = null) => {
    // If cart has items from another restaurant, ask or reset
    if (cartItems.length > 0 && restaurant && restInfo && restaurant._id !== restInfo._id) {
      const confirmReset = window.confirm(`Your cart contains items from "${restaurant.name}". Starting a new order from "${restInfo.name}" will clear your existing cart. Proceed?`);
      if (!confirmReset) return false;
      setCartItems([]);
    }

    if (restInfo) {
      setRestaurant(restInfo);
    } else if (food.restaurant && typeof food.restaurant === 'object') {
      setRestaurant(food.restaurant);
    }

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.food._id === food._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const itemPrice = food.discountPercentage > 0
          ? Number((food.price * (1 - food.discountPercentage / 100)).toFixed(2))
          : food.price;
        return [...prev, { food, price: itemPrice, quantity }];
      }
    });
    return true;
  };

  const updateQuantity = (foodId, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.food._id === foodId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (foodId) => {
    setCartItems(prev => prev.filter(item => item.food._id !== foodId));
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurant(null);
    setCoupon(null);
    localStorage.removeItem('tastybite_cart');
    localStorage.removeItem('tastybite_cart_restaurant');
    localStorage.removeItem('tastybite_cart_coupon');
  };

  // Calculations
  const subtotal = Number(cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2));
  const tax = Number((subtotal * 0.05).toFixed(2));
  const deliveryFee = subtotal >= 500 || subtotal === 0 ? 0 : 35;

  let discount = 0;
  if (coupon) {
    const minAmount = Number(coupon.minOrderAmount) || 0;
    if (subtotal >= minAmount) {
      if (coupon.discountPercentage > 0) {
        const calculated = (subtotal * coupon.discountPercentage) / 100;
        const maxLimit = coupon.maxDiscount !== undefined && coupon.maxDiscount !== null ? coupon.maxDiscount : 500;
        discount = Math.min(calculated, maxLimit);
      } else if (coupon.flatDiscount > 0) {
        discount = Math.min(coupon.flatDiscount, subtotal);
      } else if (coupon.discountAmount > 0) {
        discount = Math.min(coupon.discountAmount, subtotal);
      }
    } else if (coupon.discountAmount > 0 && !coupon.minOrderAmount) {
      discount = Math.min(coupon.discountAmount, subtotal);
    }
  }
  discount = Number(discount.toFixed(2));

  const grandTotal = Number(Math.max(0, subtotal + tax + deliveryFee - discount).toFixed(2));
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const applyCouponCode = async (code) => {
    try {
      const res = await API.post('/coupons/validate', { code, subtotal });
      if (res.data.success) {
        setCoupon(res.data.coupon);
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Invalid coupon code' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const value = {
    cartItems,
    restaurant,
    setRestaurant,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    coupon,
    applyCouponCode,
    removeCoupon,
    subtotal,
    tax,
    deliveryFee,
    discount,
    grandTotal,
    totalCount,
    deliveryInstructions,
    setDeliveryInstructions
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
