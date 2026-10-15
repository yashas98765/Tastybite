import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Receipt, Download, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDateTime, getPaymentStatusBadge } from '../utils/formatters';
import { downloadReceipt } from '../utils/downloadHelper';

const PaymentHistory = () => {
  const { isAuthenticated } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await API.get('/payments/my-payments');
      if (res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (paymentId, transactionId) => {
    downloadReceipt(paymentId, transactionId || 'Receipt');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <CreditCard className="w-12 h-12 text-orange-600 mx-auto" />
        <h2 className="text-2xl font-bold text-stone-900">Sign in to View Payments</h2>
        <Link to="/login?redirect=/payment-history" className="inline-block bg-orange-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-stone-200 pb-5">
        <span className="text-xs font-extrabold text-orange-600 uppercase tracking-widest block mb-1">
          Financial Records
        </span>
        <h1 className="text-3xl font-black text-stone-900 font-display">
          Payment Transactions ({payments.length})
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Review verified transaction references and download official payment receipts
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-stone-200 rounded-3xl" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-stone-200 space-y-3">
          <CreditCard className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-extrabold text-stone-800 text-lg">No Payments on Record</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Once you complete an order, your transaction receipts and IDs will be archived here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs divide-y divide-stone-100 overflow-hidden">
          {payments.map((p) => (
            <div key={p._id} className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 font-mono text-xs sm:text-sm">
                    {p.transactionId}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getPaymentStatusBadge(p.status)}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span>Method: <strong className="text-stone-800">{p.paymentMethod}</strong></span>
                  <span>•</span>
                  <span>{formatDateTime(p.createdAt)}</span>
                  {p.order?.orderNumber && (
                    <>
                      <span>•</span>
                      <Link to={`/order/track/${p.order._id}`} className="text-orange-600 font-semibold hover:underline">
                        Order #{p.order.orderNumber}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <span className="text-lg font-black text-stone-900 font-display">
                  {formatCurrency(p.amount)}
                </span>
                <button
                  onClick={() => handleDownloadReceipt(p._id, p.transactionId)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Receipt PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
