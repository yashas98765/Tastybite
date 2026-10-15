import API from '../services/api';

/**
 * Direct file download helper that triggers browser file download
 * without opening a blank tab or navigating away from the current page.
 */
export const downloadInvoice = async (orderId, orderNumber = 'Order') => {
  try {
    const res = await API.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TastyBite_Invoice_${orderNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Invoice download failed:', error);
    const token = localStorage.getItem('tastybite_token');
    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : '';
    window.location.href = `${backendUrl}/api/orders/${orderId}/invoice?token=${token}`;
    return false;
  }
};

export const downloadReceipt = async (paymentId, transactionId = 'Receipt') => {
  try {
    const res = await API.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TastyBite_Receipt_${transactionId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Payment receipt download failed:', error);
    const token = localStorage.getItem('tastybite_token');
    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : '';
    window.location.href = `${backendUrl}/api/payments/${paymentId}/receipt?token=${token}`;
    return false;
  }
};
