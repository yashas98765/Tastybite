/**
 * WhatsApp Notification & Share Helper Service for TastyBite
 */

const formatOrderWhatsAppMessage = (order, payment = null, status = null) => {
  const currentStatus = status || order.orderStatus || 'ORDER_PLACED';
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const statusIcons = {
    ORDER_PLACED: '📝 Order Placed',
    CONFIRMED: '✅ Confirmed & In Kitchen',
    PREPARING: '👨‍🍳 Kitchen Cooking Fresh Meal',
    READY: '📦 Packed & Awaiting Pickup',
    OUT_FOR_DELIVERY: '🛵 On The Way to Doorstep',
    DELIVERED: '🎉 Delivered! Bon Appétit',
    CANCELLED: '❌ Order Cancelled'
  };

  const statusTitle = statusIcons[currentStatus] || currentStatus;

  // Format ordered items
  const itemsText = (order.items || [])
    .map(i => `• ${i.quantity}x ${i.name || i.food?.name} (₹${((i.price || 0) * (i.quantity || 1)).toFixed(2)})`)
    .join('\n');

  let paymentLine = `*Payment:* ${order.paymentMethod} (${order.paymentStatus})`;
  if (payment) {
    paymentLine = `*Payment:* ${payment.paymentMethod} (Txn: ${payment.transactionId}) - PAID ✅`;
  }

  const message = `🍔 *TASTYBITE ORDER UPDATE* 🍔
_"Good Food, Just a Bite Away."_
━━━━━━━━━━━━━━━━━━━━━━
*Order Number:* #${order.orderNumber}
*Current Status:* ${statusTitle}
*Restaurant:* ${order.restaurant?.name || 'Partner Kitchen'}
*Total Amount:* ₹${(order.totalAmount || 0).toFixed(2)}
${paymentLine}

📋 *Items Ordered:*
${itemsText}

📍 *Delivery Location:*
${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.city || ''}
Phone: ${order.deliveryAddress?.phone || 'N/A'}

🛵 *Live Real-Time GPS Tracking:*
${clientUrl}/order/track/${order._id}

📄 *Download Documents (PDF):*
• Tax Invoice: ${serverUrl}/api/orders/${order._id}/invoice
${payment || order.payment ? `• Payment Receipt: ${serverUrl}/api/payments/${payment?._id || order.payment?._id || order.payment}/receipt\n` : ''}━━━━━━━━━━━━━━━━━━━━━━
📞 *TastyBite Care Helpline:* +91 76192 90168
💬 *WhatsApp Support:* https://wa.me/917619290168
`;

  return message;
};

/**
 * Generate a wa.me URL
 */
const getWhatsAppUrl = (phoneNumber, message) => {
  // Sanitize phone number (remove +, spaces, dashes)
  let cleanPhone = (phoneNumber || '').toString().replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone; // Default to India country code
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

module.exports = {
  formatOrderWhatsAppMessage,
  getWhatsAppUrl
};
