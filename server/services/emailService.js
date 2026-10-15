const nodemailer = require('nodemailer');
const { generateOrderInvoicePDF, generatePaymentReceiptPDF } = require('./pdfService');

let transporter = null;

// Initialize transporter safely
const initTransporter = async () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s+/g, '') : '';

  if (user && pass) {
    if ((process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('gmail')) || user.includes('gmail')) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass
        }
      });
      console.log(`[TastyBite Email] Configured live Gmail transporter for: ${user}`);
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
        secure: process.env.EMAIL_PORT == 465,
        auth: {
          user,
          pass
        }
      });
      console.log(`[TastyBite Email] Configured custom mailer for: ${user}`);
    }
  } else {
    // Development fallback using Ethereal test account or safe logger
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[TastyBite Email] Configured test ethereal mailer for: ${testAccount.user}`);
    } catch (e) {
      console.log(`[TastyBite Email] Fallback mail simulator ready.`);
    }
  }
};

initTransporter();

/**
 * Base email layout helper
 */
const getHtmlTemplate = (title, preheader, bodyContent, actionButton = null) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #ea580c, #c2410c); padding: 30px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
      .header p { margin: 5px 0 0 0; font-size: 13px; opacity: 0.9; }
      .content { padding: 30px; }
      .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
      .btn { display: inline-block; padding: 12px 24px; background: #ea580c; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
      .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; background: #ffedd5; color: #c2410c; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>TastyBite</h1>
        <p>Good Food, Just a Bite Away.</p>
      </div>
      <div class="content">
        <h2 style="color: #0f172a; margin-top: 0;">${title}</h2>
        <p style="color: #64748b; font-size: 14px;">${preheader}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        ${bodyContent}
        ${actionButton ? `<div style="text-align: center; margin-top: 25px;"><a href="${actionButton.url}" class="btn">${actionButton.text}</a></div>` : ''}
      </div>
      <div class="footer">
        <p>TastyBite Food Delivery • Made with passion for food lovers</p>
        <p>Need support? Reply to this email or chat with us on the TastyBite app.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

/**
 * Send an email safely with BCC to store owner
 */
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    if (!transporter) {
      await initTransporter();
    }
    const adminEmail = process.env.EMAIL_USER;
    const bccList = [];
    if (adminEmail && adminEmail.toLowerCase() !== (to || '').toLowerCase()) {
      bccList.push(adminEmail);
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"TastyBite Orders" <yashas.s.h2601@gmail.com>',
      to,
      bcc: bccList.length > 0 ? bccList : undefined,
      subject,
      html,
      attachments
    });
    console.log(`[TastyBite Email] Successfully sent to: ${to} (BCC: ${bccList.join(', ') || 'none'}) - Subject: "${subject}" [ID: ${info?.messageId || 'simulated'}]`);
    return { success: true, messageId: info?.messageId };
  } catch (error) {
    console.warn(`[TastyBite Email Warning] Email send skipped or logged: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Order Confirmation Email with Invoice PDF & Payment Receipt attached
 */
const sendOrderConfirmationEmail = async (order, user, invoicePdfBuffer = null, receiptPdfBuffer = null) => {
  try {
    const itemsHtml = (order.items || []).map(i => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 0;"><strong>${i.name || i.food?.name}</strong> x ${i.quantity}</td>
        <td style="padding: 10px 0; text-align: right;">Rs. ${((i.price || 0) * (i.quantity || 1)).toFixed(2)}</td>
      </tr>
    `).join('');

    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const bodyContent = `
      <p>Hi <strong>${user?.name || order.deliveryAddress?.name || 'Customer'}</strong>,</p>
      <p>Thank you for choosing <strong>TastyBite</strong>! Your order <strong>#${order.orderNumber}</strong> has been received and confirmed.</p>
      
      <div style="background: #f8fafc; border-radius: 8px; padding: 18px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 10px 0; color: #0f172a;">Order Summary</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${itemsHtml}
          <tr>
            <td style="padding-top: 15px; font-weight: bold; border-top: 2px solid #e2e8f0;">Grand Total:</td>
            <td style="padding-top: 15px; text-align: right; font-weight: bold; color: #ea580c; font-size: 16px; border-top: 2px solid #e2e8f0;">Rs. ${(order.totalAmount || 0).toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px; margin: 15px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 13px; color: #1e3a8a;">
          <strong>Payment Mode:</strong> ${order.paymentMethod} • <strong>Status:</strong> ${order.paymentStatus || 'Pending'}
        </p>
      </div>

      <p><strong>Delivery Address:</strong><br/>${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.city || ''} (Phone: ${order.deliveryAddress?.phone || 'N/A'})</p>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 8px 0; color: #166534;">📄 Official Attached Documents</h4>
        <p style="margin: 0; font-size: 13px; color: #15803d;">
          Attached to this email are your official <strong>Tax Invoice PDF</strong> and <strong>Payment Receipt PDF</strong> for your records.
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <a href="https://wa.me/917619290168?text=${encodeURIComponent(`Hi TastyBite Support, I have a query about my Order #${order.orderNumber}`)}" 
           style="display: inline-block; padding: 10px 18px; background: #25D366; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; margin: 5px;">
           💬 Chat on WhatsApp
        </a>
      </div>
    `;

    const attachments = [];

    // 1. Generate or use invoice PDF buffer
    let invoiceBuf = invoicePdfBuffer;
    if (!invoiceBuf) {
      try {
        invoiceBuf = await generateOrderInvoicePDF(order, user || { name: order.deliveryAddress?.name, email: order.deliveryAddress?.email });
      } catch (err) {
        console.warn(`[Invoice PDF error in email]: ${err.message}`);
      }
    }
    if (invoiceBuf) {
      attachments.push({
        filename: `TastyBite_Tax_Invoice_${order.orderNumber}.pdf`,
        content: invoiceBuf
      });
    }

    // 2. Generate or use payment receipt PDF buffer if paid
    let receiptBuf = receiptPdfBuffer;
    if (!receiptBuf && (order.payment || order.paymentStatus === 'Paid' || order.paymentMethod !== 'COD')) {
      try {
        const paymentObj = order.payment && typeof order.payment === 'object' ? order.payment : {
          transactionId: `TB-TXN-${order.orderNumber}`,
          paymentMethod: order.paymentMethod,
          amount: order.totalAmount,
          status: 'SUCCESS',
          createdAt: order.createdAt || new Date()
        };
        receiptBuf = await generatePaymentReceiptPDF(paymentObj, order, user);
      } catch (err) {
        console.warn(`[Receipt PDF error in email]: ${err.message}`);
      }
    }
    if (receiptBuf) {
      attachments.push({
        filename: `TastyBite_Payment_Receipt_${order.orderNumber}.pdf`,
        content: receiptBuf
      });
    }

    const html = getHtmlTemplate(
      'Order Confirmed! 🎉',
      `Your TastyBite order #${order.orderNumber} is confirmed and in kitchen!`,
      bodyContent,
      { text: 'Track Your Live Order', url: `${clientUrl}/order/track/${order._id}` }
    );

    const recipient = user?.email || order.deliveryAddress?.email || process.env.EMAIL_USER;

    return sendEmail({
      to: recipient,
      subject: `Order Confirmed: #${order.orderNumber} (Invoice & Receipt Attached) - TastyBite`,
      html,
      attachments
    });
  } catch (error) {
    console.error('[sendOrderConfirmationEmail Error]:', error);
  }
};

/**
 * Order Status Notification Email with live tracking & invoice link
 */
const sendOrderStatusEmail = async (order, user, newStatus) => {
  try {
    const statusDescriptions = {
      CONFIRMED: 'Your restaurant has confirmed the order and is preparing to cook.',
      PREPARING: 'The master chefs at our kitchen are preparing your fresh, piping-hot food right now.',
      READY: 'Your meal is packed and ready for pickup by our delivery partner.',
      OUT_FOR_DELIVERY: 'Our delivery partner is on the way with your food to your doorstep!',
      DELIVERED: 'Your order has been delivered! We hope you enjoy every bite. Bon Appétit! 😋✨',
      CANCELLED: 'Your order was cancelled. Any processed payment will be refunded immediately.'
    };

    const statusTitles = {
      CONFIRMED: 'Order Confirmed by Kitchen 🍽️',
      PREPARING: 'Food is in the Kitchen! 👨‍🍳',
      READY: 'Food Ready for Pickup! 📦',
      OUT_FOR_DELIVERY: 'TastyBite is On the Way! 🛵💨',
      DELIVERED: 'Delivered! Enjoy Your Food! 😋✨',
      CANCELLED: 'Order Cancelled ❌'
    };

    const title = statusTitles[newStatus] || `Order Status: ${newStatus}`;
    const preheader = statusDescriptions[newStatus] || `Your order #${order.orderNumber} has been updated.`;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

    const bodyContent = `
      <p>Hi <strong>${user?.name || order.deliveryAddress?.name || 'Customer'}</strong>,</p>
      <p>Here is a real-time status update on your TastyBite order <strong>#${order.orderNumber}</strong>:</p>
      
      <div style="background: #fff7ed; border-left: 4px solid #ea580c; padding: 18px; margin: 20px 0; border-radius: 6px;">
        <h3 style="margin: 0 0 6px 0; color: #c2410c; font-size: 18px;">Status: ${newStatus.replace(/_/g, ' ')}</h3>
        <p style="margin: 0; color: #7c2d12; font-size: 14px;">${preheader}</p>
      </div>

      ${newStatus === 'OUT_FOR_DELIVERY' ? `
        <div style="background: #f1f5f9; padding: 14px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0; font-size: 14px; color: #334155;">
            <strong>Delivery Partner:</strong> ${order.riderDetails?.name || 'Ramesh Kumar'} (${order.riderDetails?.phone || '+91 98450 12345'})<br/>
            <strong>Vehicle:</strong> ${order.riderDetails?.vehicleNumber || 'KA 01 EB 4892'}
          </p>
        </div>
      ` : ''}

      <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 14px; margin: 20px 0; font-size: 13px;">
        <strong>Quick Links:</strong><br/>
        • <a href="${serverUrl}/api/orders/${order._id}/invoice" style="color: #ea580c; text-decoration: underline;">Download Tax Invoice PDF</a><br/>
        • <a href="https://wa.me/917619290168?text=${encodeURIComponent(`Hi, checking status for order #${order.orderNumber}`)}" style="color: #25D366; text-decoration: underline; font-weight: bold;">Get Updates on WhatsApp (+91 76192 90168)</a>
      </div>
    `;

    const html = getHtmlTemplate(
      title,
      preheader,
      bodyContent,
      { text: 'View Live Real-Time Tracking', url: `${clientUrl}/order/track/${order._id}` }
    );

    const recipient = user?.email || order.deliveryAddress?.email || process.env.EMAIL_USER;

    return sendEmail({
      to: recipient,
      subject: `Order Update: #${order.orderNumber} is now ${newStatus.replace(/_/g, ' ')} - TastyBite`,
      html
    });
  } catch (error) {
    console.error('[sendOrderStatusEmail Error]:', error);
  }
};

/**
 * Payment Receipt Email with attached Receipt PDF and Invoice PDF
 */
const sendPaymentReceiptEmail = async (arg1, arg2, user, receiptPdfBuffer = null, invoicePdfBuffer = null) => {
  try {
    // Handle polymorphic parameter order: (payment, order) or (order, payment)
    let payment = arg1;
    let order = arg2;

    if (arg1 && arg1.orderNumber && !arg1.transactionId) {
      order = arg1;
      payment = arg2;
    }

    // Fallbacks if payment object is incomplete
    const txnId = payment?.transactionId || payment?.razorpay_payment_id || `TB-TXN-${order?.orderNumber || Date.now()}`;
    const amount = Number(payment?.amount || order?.totalAmount || 0);
    const method = payment?.paymentMethod || order?.paymentMethod || 'Online Payment';
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const bodyContent = `
      <p>Hi <strong>${user?.name || order?.deliveryAddress?.name || 'Customer'}</strong>,</p>
      <p>We have successfully received and verified your payment of <strong>Rs. ${amount.toFixed(2)}</strong> for order <strong>#${order?.orderNumber || 'TastyBite'}</strong>.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 14px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px;">Transaction ID:</td>
          <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #0f172a;">${txnId}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px;">Payment Method:</td>
          <td style="padding: 10px; font-weight: bold;">${method}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px;">Amount Paid:</td>
          <td style="padding: 10px; font-weight: bold; color: #16a34a; font-size: 16px;">Rs. ${amount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 10px;">Verification Status:</td>
          <td style="padding: 10px; color: #16a34a; font-weight: bold;">PAID & VERIFIED ✅</td>
        </tr>
      </table>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h4 style="margin: 0 0 8px 0; color: #166534;">📄 Official Attached PDF Receipts</h4>
        <p style="margin: 0; font-size: 13px; color: #15803d;">
          Attached to this email are your official <strong>Payment Receipt PDF</strong> and <strong>Order Tax Invoice PDF</strong>.
        </p>
      </div>

      <div style="text-align: center; margin-top: 15px;">
        <a href="https://wa.me/917619290168?text=${encodeURIComponent(`Hi TastyBite, payment received for Order #${order?.orderNumber} (Txn: ${txnId})`)}" 
           style="display: inline-block; padding: 10px 18px; background: #25D366; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px;">
           💬 WhatsApp Support (+91 76192 90168)
        </a>
      </div>
    `;

    const attachments = [];

    // 1. Generate or attach Payment Receipt PDF
    let rBuf = receiptPdfBuffer;
    if (!rBuf) {
      try {
        rBuf = await generatePaymentReceiptPDF(payment, order, user);
      } catch (err) {
        console.warn(`[Payment Receipt PDF error in email]: ${err.message}`);
      }
    }
    if (rBuf) {
      attachments.push({
        filename: `TastyBite_Payment_Receipt_${txnId}.pdf`,
        content: rBuf
      });
    }

    // 2. Also generate and attach Order Tax Invoice PDF if order exists
    let iBuf = invoicePdfBuffer;
    if (!iBuf && order) {
      try {
        iBuf = await generateOrderInvoicePDF(order, user);
      } catch (err) {
        console.warn(`[Order Invoice PDF error in payment email]: ${err.message}`);
      }
    }
    if (iBuf) {
      attachments.push({
        filename: `TastyBite_Tax_Invoice_${order?.orderNumber || 'Order'}.pdf`,
        content: iBuf
      });
    }

    const html = getHtmlTemplate(
      'Payment Receipt & Verification 💳',
      `Payment confirmed for Order #${order?.orderNumber || ''} (Txn: ${txnId})`,
      bodyContent,
      { text: 'View Payment History', url: `${clientUrl}/payment-history` }
    );

    const recipient = user?.email || order?.deliveryAddress?.email || process.env.EMAIL_USER;

    return sendEmail({
      to: recipient,
      subject: `Payment Receipt: Rs. ${amount.toFixed(2)} [Txn: ${txnId}] - TastyBite`,
      html,
      attachments
    });
  } catch (error) {
    console.error('[sendPaymentReceiptEmail Error]:', error);
  }
};

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendPaymentReceiptEmail
};
