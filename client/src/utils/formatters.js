export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  return `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getOrderStatusBadge = (status) => {
  const styles = {
    ORDER_PLACED: 'bg-amber-100 text-amber-800 border-amber-300',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
    PREPARING: 'bg-purple-100 text-purple-800 border-purple-300',
    READY: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800 border-orange-300',
    DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-800 border-rose-300'
  };
  return styles[status] || 'bg-stone-100 text-stone-800 border-stone-300';
};

export const getPaymentStatusBadge = (status) => {
  const styles = {
    Paid: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Pending: 'bg-amber-100 text-amber-800 border-amber-300',
    Processing: 'bg-blue-100 text-blue-800 border-blue-300',
    Failed: 'bg-rose-100 text-rose-800 border-rose-300',
    Cancelled: 'bg-stone-100 text-stone-800 border-stone-300',
    Refunded: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  };
  return styles[status] || 'bg-stone-100 text-stone-800 border-stone-300';
};
