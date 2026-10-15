import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageSquare, Heart, ShieldCheck, Clock, Award } from 'lucide-react';

const Footer = () => {
  const whatsappNumber = '917619290168';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello TastyBite Support, I need help with my order.')}`;

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Props Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-stone-800">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">30-Min Delivery</h4>
              <p className="text-xs text-stone-400">Piping hot food straight from kitchen</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Hygienic</h4>
              <p className="text-xs text-stone-400">Strict safety & quality audits</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Smart Recommendations</h4>
              <p className="text-xs text-stone-400">Algorithmic flavor matching</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-800/40 border border-stone-800">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">24/7 Live Support</h4>
              <p className="text-xs text-stone-400">In-app chat & WhatsApp care</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-12 border-b border-stone-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-white text-xl font-black">TB</span>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white font-display">
                Tasty<span className="text-orange-500">Bite</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              "Good Food, Just a Bite Away." TastyBite is a full-stack next-generation online food ordering platform delivering authentic cuisine with smart picks and collaborative group ordering.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all shadow-md shadow-emerald-900/30"
              >
                <MessageSquare className="w-4 h-4" />
                Chat on WhatsApp
              </a>
              <Link
                to="/support"
                className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold px-4 py-2.5 rounded-full transition-all"
              >
                In-App Helpdesk
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 font-display">
              Explore TastyBite
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/restaurants" className="hover:text-orange-400 transition-colors">
                  Top Restaurants
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-orange-400 transition-colors">
                  Dishes & Menus
                </Link>
              </li>
              <li>
                <Link to="/smart-picks" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                  Smart Picks <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1 rounded">AI</span>
                </Link>
              </li>
              <li>
                <Link to="/group-orders" className="hover:text-teal-400 transition-colors">
                  TastyBite Group Feast
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-orange-400 transition-colors">
                  Your Cart & Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Policies */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 font-display">
              My Account
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/orders" className="hover:text-orange-400 transition-colors">
                  Order History & Tracking
                </Link>
              </li>
              <li>
                <Link to="/payment-history" className="hover:text-orange-400 transition-colors">
                  Payment History & Receipts
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-rose-400 transition-colors">
                  Favorite Dishes
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-orange-400 transition-colors">
                  Saved Addresses
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="text-stone-400 hover:text-amber-400 transition-colors">
                  Partner Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4 font-display">
              Get in Touch
            </h4>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>MG Road & Indiranagar, Bengaluru, Karnataka, 560038</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>+91 76192 90168</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>yashas.s.h2601@gmail.com</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-stone-400">
              Operating Hours: <strong className="text-stone-200">7:00 AM - 12:00 AM</strong> Daily
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© 2026 TastyBite Technologies. Designed & Engineered with passion for great food.</p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-stone-400 mr-2">100% SECURE PAYMENTS</span>
            <span className="bg-stone-800 px-2 py-1 rounded text-stone-300 font-mono text-[10px]">UPI</span>
            <span className="bg-stone-800 px-2 py-1 rounded text-stone-300 font-mono text-[10px]">VISA</span>
            <span className="bg-stone-800 px-2 py-1 rounded text-stone-300 font-mono text-[10px]">MASTERCARD</span>
            <span className="bg-stone-800 px-2 py-1 rounded text-stone-300 font-mono text-[10px]">NETBANKING</span>
            <span className="bg-stone-800 px-2 py-1 rounded text-stone-300 font-mono text-[10px]">COD</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
