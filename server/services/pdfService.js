const PDFDocument = require('pdfkit');

/**
 * Generates an Order Invoice PDF buffer
 */
const generateOrderInvoicePDF = (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header Brand
      doc.rect(40, 40, 515, 65).fill('#ea580c');
      doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('TastyBite', 60, 52);
      doc.fontSize(10).font('Helvetica').text('Good Food, Just a Bite Away.', 60, 80);
      doc.fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', 420, 58, { align: 'right' });
      doc.fontSize(9).font('Helvetica').text(`Invoice #: INV-${order.orderNumber}`, 420, 80, { align: 'right' });

      doc.moveDown(3);

      // Order & Customer Details (2 columns)
      const topDetailsY = 125;
      doc.fillColor('#1c1917');
      
      // Column 1: Billed To
      doc.fontSize(11).font('Helvetica-Bold').text('BILLED TO:', 45, topDetailsY);
      doc.fontSize(10).font('Helvetica');
      doc.text(user?.name || 'Valued Customer', 45, topDetailsY + 16);
      doc.text(user?.email || 'customer@tastybite.com', 45, topDetailsY + 30);
      doc.text(`Phone: ${order.deliveryAddress?.phone || 'N/A'}`, 45, topDetailsY + 44);
      doc.text(`Address: ${order.deliveryAddress?.street || ''}, ${order.deliveryAddress?.city || ''}`, 45, topDetailsY + 58);

      // Column 2: Order Info
      doc.fontSize(11).font('Helvetica-Bold').text('ORDER INFO:', 340, topDetailsY);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Order ID: ${order.orderNumber}`, 340, topDetailsY + 16);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 340, topDetailsY + 30);
      doc.text(`Restaurant: ${order.restaurant?.name || 'TastyBite Partner'}`, 340, topDetailsY + 44);
      doc.text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, 340, topDetailsY + 58);

      // Items Table Header
      const tableTopY = 220;
      doc.rect(40, tableTopY, 515, 24).fill('#f3f4f6');
      doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold');
      doc.text('ITEM DESCRIPTION', 55, tableTopY + 7);
      doc.text('TYPE', 260, tableTopY + 7);
      doc.text('QTY', 330, tableTopY + 7, { align: 'center', width: 40 });
      doc.text('PRICE', 390, tableTopY + 7, { align: 'right', width: 60 });
      doc.text('TOTAL', 475, tableTopY + 7, { align: 'right', width: 60 });

      // Table Rows
      let currentY = tableTopY + 28;
      doc.font('Helvetica').fontSize(9).fillColor('#1f2937');

      (order.items || []).forEach((item, index) => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        
        doc.text(item.name, 55, currentY, { width: 190 });
        doc.text(item.isVeg ? '[Veg]' : '[Non-Veg]', 260, currentY);
        doc.text(String(item.quantity), 330, currentY, { align: 'center', width: 40 });
        doc.text(`Rs. ${item.price.toFixed(2)}`, 390, currentY, { align: 'right', width: 60 });
        doc.text(`Rs. ${itemTotal}`, 475, currentY, { align: 'right', width: 60 });

        doc.moveTo(40, currentY + 18).lineTo(555, currentY + 18).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
        currentY += 24;
      });

      // Summary calculation box
      const summaryStartY = Math.max(currentY + 15, 360);
      const summaryLeft = 320;
      
      doc.rect(summaryLeft, summaryStartY, 235, 120).strokeColor('#e5e7eb').lineWidth(1).stroke();
      doc.fontSize(9).font('Helvetica');

      doc.text('Subtotal:', summaryLeft + 15, summaryStartY + 12);
      doc.text(`Rs. ${order.subtotal?.toFixed(2) || '0.00'}`, 470, summaryStartY + 12, { align: 'right', width: 70 });

      doc.text('Taxes & GST (5%):', summaryLeft + 15, summaryStartY + 30);
      doc.text(`Rs. ${order.tax?.toFixed(2) || '0.00'}`, 470, summaryStartY + 30, { align: 'right', width: 70 });

      doc.text('Delivery Fee:', summaryLeft + 15, summaryStartY + 48);
      doc.text(`Rs. ${order.deliveryFee?.toFixed(2) || '0.00'}`, 470, summaryStartY + 48, { align: 'right', width: 70 });

      if (order.discount && order.discount > 0) {
        doc.fillColor('#16a34a');
        doc.text(`Discount (${order.couponCode || 'Promo'}):`, summaryLeft + 15, summaryStartY + 66);
        doc.text(`- Rs. ${order.discount.toFixed(2)}`, 470, summaryStartY + 66, { align: 'right', width: 70 });
        doc.fillColor('#1f2937');
      }

      doc.rect(summaryLeft, summaryStartY + 86, 235, 34).fill('#ffedd5');
      doc.fillColor('#c2410c').fontSize(11).font('Helvetica-Bold');
      doc.text('Grand Total:', summaryLeft + 15, summaryStartY + 97);
      doc.text(`Rs. ${order.totalAmount?.toFixed(2) || '0.00'}`, 460, summaryStartY + 97, { align: 'right', width: 80 });

      // Footer
      doc.rect(40, 750, 515, 30).fill('#f8fafc');
      doc.fillColor('#64748b').fontSize(8).font('Helvetica');
      doc.text('TastyBite Technologies Pvt. Ltd. • Contact: support@tastybite.com • Website: www.tastybite.com', 40, 758, { align: 'center', width: 515 });
      doc.text('This is a computer-generated tax invoice and requires no physical signature.', 40, 768, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generates a Payment Receipt PDF buffer
 */
const generatePaymentReceiptPDF = (param1, param2, user) => {
  return new Promise((resolve, reject) => {
    try {
      let payment = param1;
      let order = param2;
      if (param1?.totalAmount && !param1?.transactionId) {
        order = param1;
        payment = param2;
      }
      if (!user && (order?.user || payment?.user)) {
        user = order?.user || payment?.user;
      }

      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header Brand
      doc.rect(40, 40, 515, 75).fill('#0f172a');
      doc.fillColor('#f97316').fontSize(26).font('Helvetica-Bold').text('TastyBite', 60, 52);
      doc.fillColor('#ffffff').fontSize(10).font('Helvetica').text('Good Food, Just a Bite Away.', 60, 82);
      doc.fillColor('#22c55e').fontSize(14).font('Helvetica-Bold').text('PAYMENT RECEIPT', 400, 58, { align: 'right' });
      doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text(`Receipt #: ${payment.paymentNumber || 'REC-' + payment.transactionId}`, 400, 80, { align: 'right' });

      // Status Banner
      const statusBannerY = 135;
      const isPaid = payment.status === 'Paid';
      doc.rect(40, statusBannerY, 515, 35).fill(isPaid ? '#ecfdf5' : '#fef2f2');
      doc.fillColor(isPaid ? '#065f46' : '#991b1b').fontSize(12).font('Helvetica-Bold');
      doc.text(`Payment Status: ${payment.status.toUpperCase()}`, 60, statusBannerY + 11);
      doc.fontSize(10).font('Helvetica').text(`Transaction ID: ${payment.transactionId}`, 340, statusBannerY + 12, { align: 'right' });

      // Transaction Table
      const infoBoxY = 195;
      doc.rect(40, infoBoxY, 515, 140).strokeColor('#e2e8f0').lineWidth(1).stroke();

      doc.fillColor('#475569').fontSize(9).font('Helvetica-Bold');
      doc.text('PAYMENT DETAILS', 60, infoBoxY + 15);

      const rows = [
        ['Customer Name:', user?.name || 'Customer'],
        ['Customer Email:', user?.email || 'N/A'],
        ['Associated Order #:', order?.orderNumber || 'N/A'],
        ['Payment Date & Time:', new Date(payment.createdAt || Date.now()).toLocaleString('en-IN')],
        ['Payment Method:', payment.paymentMethod || 'Online Gateway'],
        ['Currency:', 'INR (Indian Rupees - Rs.)'],
      ];

      let rowY = infoBoxY + 35;
      doc.font('Helvetica').fontSize(9);
      rows.forEach(([label, value]) => {
        doc.fillColor('#64748b').text(label, 60, rowY, { width: 150 });
        doc.fillColor('#0f172a').font('Helvetica-Bold').text(value, 220, rowY);
        doc.font('Helvetica');
        rowY += 16;
      });

      // Amount Breakdown Box
      const amountBoxY = 360;
      doc.rect(40, amountBoxY, 515, 110).fill('#f8fafc');
      doc.rect(40, amountBoxY, 515, 110).strokeColor('#e2e8f0').lineWidth(1).stroke();

      doc.fillColor('#334155').fontSize(10).font('Helvetica');
      doc.text('Order Subtotal:', 60, amountBoxY + 18);
      doc.text(`Rs. ${order?.subtotal?.toFixed(2) || payment.amount.toFixed(2)}`, 440, amountBoxY + 18, { align: 'right', width: 90 });

      doc.text('Taxes & Packaging Charges:', 60, amountBoxY + 36);
      doc.text(`Rs. ${order?.tax?.toFixed(2) || '0.00'}`, 440, amountBoxY + 36, { align: 'right', width: 90 });

      doc.text('Delivery Charges:', 60, amountBoxY + 54);
      doc.text(`Rs. ${order?.deliveryFee?.toFixed(2) || '0.00'}`, 440, amountBoxY + 54, { align: 'right', width: 90 });

      doc.moveTo(60, amountBoxY + 75).lineTo(530, amountBoxY + 75).strokeColor('#cbd5e1').lineWidth(0.5).stroke();

      doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold');
      doc.text('Total Amount Paid:', 60, amountBoxY + 84);
      doc.fillColor('#ea580c').text(`Rs. ${payment.amount.toFixed(2)}`, 430, amountBoxY + 84, { align: 'right', width: 100 });

      // Verification seal simulation
      doc.rect(60, 510, 200, 60).strokeColor('#22c55e').lineWidth(1.5).stroke();
      doc.fillColor('#15803d').fontSize(10).font('Helvetica-Bold').text('DIGITALLY VERIFIED', 80, 524);
      doc.fontSize(8).font('Helvetica').text('TastyBite Secure Payment Gateway', 80, 540);
      doc.text('Auth Code: TB-SEC-OK-2026', 80, 552);

      // Support footer
      doc.rect(40, 750, 515, 30).fill('#f1f5f9');
      doc.fillColor('#64748b').fontSize(8).font('Helvetica');
      doc.text('Questions about this payment? Contact TastyBite Support: support@tastybite.com', 40, 760, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateOrderInvoicePDF,
  generatePaymentReceiptPDF
};
