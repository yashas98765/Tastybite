import React, { useState } from 'react';
import {
  MessageSquare,
  MessageCircle,
  Phone,
  Mail,
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Clock,
  Send,
  Bot,
  MapPin,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SupportChatModal from '../components/SupportChatModal';

const CustomerSupport = () => {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(0);

  // Contact Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: 'Order Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          subject: 'Order Inquiry',
          message: ''
        });
      }, 5000);
    }, 800);
  };

  const whatsappNumber = '917619290168';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello TastyBite Support, I need help with my order.')}`;

  const faqs = [
    {
      q: 'How does live real-time order tracking work on TastyBite?',
      a: 'TastyBite communicates directly with our kitchen partners and delivery partners using WebSockets (Socket.IO). As soon as the chef begins cooking or the rider departs, status transitions occur instantly without requiring a page refresh.'
    },
    {
      q: 'How does TastyBite Group Order and Split Billing work?',
      a: 'Any customer can start a "TastyBite Feast" group, select a restaurant, and share the unique room code with friends. Everyone adds their desired dishes to the shared cart. Our system automatically computes itemized shares and proportional delivery/tax splits.'
    },
    {
      q: 'What is the TastyBite refund policy for cancelled orders?',
      a: 'If an order is cancelled before kitchen preparation commences or if a simulated payment error occurs, 100% of the funds are credited back to your original payment method within 15 minutes for UPI or 2-3 business days for cards.'
    },
    {
      q: 'Where can I download my Tax Invoice and Payment Receipts?',
      a: 'Both documents are available in formal PDF format. You can download them directly from your Order Confirmation screen, Order Details page, or Payment History tab.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block">
          Contact Us & 24/7 Customer Care
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-display">
          Get in Touch with TastyBite
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Have questions about your order, restaurant partnerships, payment status, or feedback? Reach out to our dedicated care team anytime.
        </p>
      </div>

      {/* Support Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Channel 1: WhatsApp Support */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-colors">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-base">WhatsApp Support</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Connect with our live support team directly on WhatsApp for quick resolution and instant updates.
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp (+91 76192 90168)</span>
          </a>
        </div>

        {/* Channel 2: In-App Live Care */}
        <div className="bg-white rounded-3xl p-6 border border-orange-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-orange-400 transition-colors">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-base">In-App Live Chat</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Real-time WebSocket chat with the TastyBite assistant bot and live customer executive.
            </p>
          </div>
          <button
            onClick={() => {
              const chatBtn = document.querySelector('button[title="24/7 TastyBite Care"]');
              if (chatBtn) chatBtn.click();
            }}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Launch Live Chat</span>
          </button>
        </div>

        {/* Channel 3: Telephone & Email */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-base">Direct Phone & Email</h3>
            <div className="text-xs text-stone-500 space-y-1.5 pt-1">
              <p>Phone: <strong className="text-stone-800">+91 76192 90168</strong></p>
              <p>Email: <strong className="text-stone-800">yashas.s.h2601@gmail.com</strong></p>
              <p>Hours: <strong className="text-stone-800">7:00 AM - 12:00 AM Daily</strong></p>
            </div>
          </div>
          <a
            href="mailto:yashas.s.h2601@gmail.com"
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs py-3 rounded-xl text-center transition-all flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Email Our Team</span>
          </a>
        </div>

      </div>

      {/* Contact Form Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Office & Info */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">
                Drop Us a Note
              </span>
              <h2 className="text-2xl font-black text-stone-900 font-display">
                Send a Message
              </h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Whether you have general questions, billing inquiries, or feedback on a meal, fill out this quick form and we will reply within 30 minutes.
              </p>
            </div>

            <div className="space-y-3.5 pt-2 text-xs text-stone-600">
              <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100">
                <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-stone-800">TastyBite Headquarters</h4>
                  <p className="text-[11px] text-stone-500">MG Road & 100ft Road Indiranagar, Bengaluru, Karnataka 560038</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100">
                <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-stone-800">Customer Support Hours</h4>
                  <p className="text-[11px] text-stone-500">Monday - Sunday: 7:00 AM - Midnight (12:00 AM IST)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-stone-800">Resolution Guarantee</h4>
                  <p className="text-[11px] text-stone-500">Every message receives personal attention with tracking ID.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-stone-50/70 p-6 rounded-2xl border border-stone-200/80">
            {submitted ? (
              <div className="py-10 text-center space-y-3 animate-in fade-in zoom-in-95">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-stone-900">Message Received!</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Thank you for reaching out. A TastyBite care specialist will review your inquiry and email you back at <strong>{formData.email}</strong> shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-white text-xs text-stone-800 p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. customer@example.com"
                      className="w-full bg-white text-xs text-stone-800 p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98450 12345"
                      className="w-full bg-white text-xs text-stone-800 p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Subject
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full bg-white text-xs font-semibold text-stone-800 p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500"
                    >
                      <option value="Order Inquiry">Order Inquiry & Tracking</option>
                      <option value="Payment Issue">Payment & Refund Help</option>
                      <option value="Dietary Questions">Dietary & Menu Inquiry</option>
                      <option value="Restaurant Partner">Restaurant Partnership</option>
                      <option value="General Feedback">Feedback & Suggestions</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Your Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe how we can assist you..."
                    className="w-full bg-white text-xs text-stone-800 p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
          <HelpCircle className="w-5 h-5 text-orange-600" />
          <h3 className="font-extrabold text-stone-900 text-lg font-display">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-stone-200 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-stone-800 hover:text-orange-600 flex items-center justify-between gap-4 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180 text-orange-600' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-stone-500 leading-relaxed border-t border-stone-100 bg-stone-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CustomerSupport;
