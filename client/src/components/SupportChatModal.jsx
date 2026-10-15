import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Shield, Clock, ChevronRight, MessageCircle, Phone, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import API from '../services/api';

const SupportChatModal = () => {
  const { user, isAuthenticated } = useAuth();
  const { socket, joinChatRoom } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState({ _id: 'TB-CARE-LIVE' });
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Default welcome message
  const getInitialWelcome = () => ({
    _id: 'welcome-0',
    senderName: 'TastyBite Assistant',
    senderRole: 'bot',
    createdAt: new Date().toISOString(),
    text: `👋 Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! Welcome to TastyBite 24/7 Live Care. How can I assist you with your orders, menu, or delivery today?`
  });

  const [messages, setMessages] = useState([getInitialWelcome()]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  // Load chat on open
  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated) {
        loadChat();
      } else {
        // If not logged in, ensure initial welcome message is present
        setMessages(prev => (prev.length > 0 ? prev : [getInitialWelcome()]));
      }
    }
  }, [isOpen, isAuthenticated]);

  // Real-time socket listener
  useEffect(() => {
    if (socket && chat && chat._id && chat._id !== 'TB-CARE-LIVE') {
      joinChatRoom(chat._id);

      const handleNewMessage = (msg) => {
        if (msg.chat === chat._id || msg.chat?._id === chat._id) {
          setMessages(prev => {
            if (prev.some(m => m._id === msg._id || (m.text === msg.text && m.senderRole === msg.senderRole))) return prev;
            return [...prev, msg];
          });
        }
      };

      socket.on('new_chat_message', handleNewMessage);

      return () => {
        socket.off('new_chat_message', handleNewMessage);
      };
    }
  }, [socket, chat]);

  const loadChat = async () => {
    try {
      setLoading(true);
      const res = await API.get('/chats/my-chat');
      if (res.data.success && res.data.chat) {
        setChat(res.data.chat);
        if (res.data.messages && res.data.messages.length > 0) {
          setMessages(res.data.messages);
        } else {
          setMessages([getInitialWelcome()]);
        }
      }
    } catch (e) {
      console.warn('Backend chat sync info:', e.message);
      // Keep local welcome message intact
      setMessages(prev => (prev.length > 0 ? prev : [getInitialWelcome()]));
    } finally {
      setLoading(false);
    }
  };

  const generateSmartBotReply = (text) => {
    const lower = text.toLowerCase();

    if (lower.includes('status') || lower.includes('where is my order') || lower.includes('track') || lower.includes('order')) {
      return "📦 To track your order: Check the 'Orders' tab in the navbar to view live updates with kitchen progress and delivery rider details. If you have an active order ID (e.g. TB-ORD-782190), our delivery time is usually 20-30 minutes!";
    }

    if (lower.includes('refund') || lower.includes('money back') || lower.includes('cancel')) {
      return "💳 100% Refund Policy: If an order is cancelled before restaurant preparation starts or if payment experiences a glitch, refunds are credited back automatically. UPI refunds take ~15 mins, and cards take 2-3 business days.";
    }

    if (lower.includes('split') || lower.includes('group') || lower.includes('friends') || lower.includes('party')) {
      return "👥 TastyBite Group Feast: Share your 6-letter room code with friends so everyone adds items into a single combined cart. Our checkout automatically calculates itemized totals and splits delivery/tax!";
    }

    if (lower.includes('agent') || lower.includes('human') || lower.includes('call') || lower.includes('whatsapp') || lower.includes('contact')) {
      return "📞 You can connect directly with our priority customer desk on WhatsApp at +91 76192 90168 or email yashas.s.h2601@gmail.com. We operate 7:00 AM to midnight daily.";
    }

    if (lower.includes('menu') || lower.includes('food') || lower.includes('categories') || lower.includes('biryani') || lower.includes('pizza') || lower.includes('seafood')) {
      return "🍔 TastyBite features 155+ authentic dishes organized into 14 distinct categories (including Biryani, Seafood, Indian Paneer, Chinese, Continental, Pastries & Bakery, and Mocktails) with individual dish photographs! Click 'Explore Menu' to browse.";
    }

    if (lower.includes('coupon') || lower.includes('discount') || lower.includes('offer')) {
      return "🎉 Use code TASTY50 for 50% OFF (up to ₹120) on orders above ₹299, or WELCOME20 for 20% OFF!";
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('help')) {
      return `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! Welcome to TastyBite 24/7 Customer Care. How may I assist you with your orders, menu, or delivery today?`;
    }

    return "Thank you for messaging TastyBite Care! I have recorded your note. Feel free to ask about our 14 menu categories, active orders, split billing, or chat with our live WhatsApp team at +91 76192 90168.";
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const trimmedText = textToSend.trim();
    setInputText('');

    // 1. Immediately append user's message
    const userMsg = {
      _id: 'user-' + Date.now(),
      senderName: user?.name ? user.name.split(' ')[0] : 'You',
      senderRole: 'customer',
      createdAt: new Date().toISOString(),
      text: trimmedText
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // 2. If authenticated, attempt backend sync in parallel
    if (isAuthenticated && chat && chat._id && chat._id !== 'TB-CARE-LIVE') {
      try {
        await API.post(`/chats/${chat._id}/messages`, {
          text: trimmedText
        });
      } catch (e) {
        console.warn('Backend message sync error:', e.message);
      }
    }

    // 3. Guaranteed instant intelligent response
    setTimeout(() => {
      const replyText = generateSmartBotReply(trimmedText);
      const botMsg = {
        _id: 'bot-' + Date.now(),
        senderName: 'TastyBite Assistant',
        senderRole: 'bot',
        createdAt: new Date().toISOString(),
        text: replyText
      };

      setMessages(prev => {
        // Prevent duplicate bot message if socket already added it
        if (prev.some(m => m.text === replyText && m.senderRole === 'bot')) return prev;
        return [...prev, botMsg];
      });
      setIsTyping(false);
    }, 500);
  };

  const quickQuestions = [
    'Where is my order?',
    'What is the refund policy?',
    'How do I split bill with friends?',
    'I want to speak with an agent'
  ];

  const whatsappNumber = '917619290168';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello TastyBite Support, I need help with my order.')}`;

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all duration-200 group border border-orange-400/40 cursor-pointer"
        title="24/7 TastyBite Care"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          {isOpen ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
        </div>
        <span className="text-xs font-bold tracking-wide pr-1">
          {isOpen ? 'Close' : 'Live Support'}
        </span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-orange-700 animate-pulse" />
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-92 sm:w-104 h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-stone-200 z-40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">TastyBite Assistant</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-orange-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • Avg reply: instant</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-600/30 transition-colors"
                title="WhatsApp Support"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-stone-50 space-y-3">
            {/* Ticket Tag */}
            <div className="text-center my-1">
              <span className="bg-stone-200/70 text-stone-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Support Ticket #{chat?._id ? chat._id.slice(-6).toUpperCase() : 'ACTIVE'}
              </span>
            </div>

            {/* Message bubbles */}
            {messages.map((m, idx) => {
              const isMe = m.senderRole === 'customer';
              return (
                <div
                  key={m._id || idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
                >
                  <div className="flex items-baseline gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-stone-500">
                      {m.senderName}
                    </span>
                    <span className="text-[9px] text-stone-400">
                      {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-orange-600 text-white rounded-tr-xs'
                        : m.senderRole === 'admin'
                        ? 'bg-purple-700 text-white rounded-tl-xs'
                        : 'bg-white text-stone-800 border border-stone-200 rounded-tl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 text-stone-400 text-xs py-1 px-2 animate-pulse">
                <Bot className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[11px] font-medium">TastyBite Assistant is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills */}
          <div className="p-2 bg-stone-100/80 border-t border-stone-200 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="shrink-0 bg-white hover:bg-orange-50 border border-stone-200 hover:border-orange-300 text-stone-700 hover:text-orange-700 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              >
                <span>{q}</span>
                <ChevronRight className="w-2.5 h-2.5 text-stone-400" />
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about orders, delivery, refunds, menu..."
              className="flex-1 bg-stone-100 text-stone-800 placeholder-stone-400 text-xs rounded-xl px-3.5 py-2.5 border border-stone-200 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 shadow-sm cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};

export default SupportChatModal;
