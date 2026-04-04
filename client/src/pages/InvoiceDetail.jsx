import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { invoicesApi } from '../api/invoices';
import { paymentsApi } from '../api/payments';
import Spinner from '../components/Spinner';
import PaymentModal from '../components/PaymentModal';
import { ArrowLeft, Receipt, CheckCircle, XCircle, Send, Printer, CreditCard, Clock } from 'lucide-react';

const InvoiceDetail = () => {
  const { id } = useParams();
  const { canWrite } = useAuth();
  const toast = useToast();
  
  const [inv, setInv] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Lookups
  const [contact, setContact] = useState(null);

  // States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await invoicesApi.getInvoiceById(id);
      setInv(data);
      setPayments(Array.isArray(data.payments) ? data.payments : []);
      setContact(data.subscription?.customer || null);
    } catch (e) {
      toast.error('Critical failure mapping invoice layout components.');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);


  const executeStatusAction = async (newStatus) => {
      try {
          await invoicesApi.updateStatus(id, newStatus);
          toast.success(`Invoice logic updated natively -> ${newStatus.toUpperCase()}`);
          fetchDetail();
      } catch (e) {
          toast.error("Execution logic rejected natively.");
      }
  };

  const handleRecordPayment = async (pData) => {
      try {
          await paymentsApi.createPayment(pData);
          toast.success("Payment officially tracked globally. Ledger synced.");
          setIsPaymentModalOpen(false);
          fetchDetail();
      } catch (e) {
          toast.error("Failed locking transaction into persistent logic maps.");
      }
  };

  if (loading) return <div className="flex-1 flex justify-center items-center p-24"><Spinner size="lg" color="red" /></div>;
  if (!inv) return <div className="p-8 text-center text-slate-500 font-medium">Invoice reference detached permanently.</div>;

  const clearedTotal = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  const StatusBadge = ({ status }) => {
     const statusMaps = {
         draft: 'bg-slate-100 text-slate-700 border-slate-200',
         confirmed: 'bg-orange-100 text-orange-700 border-orange-200',
         paid: 'bg-green-100 text-green-700 border-green-200 shadow-[0_0_10px_theme(colors.green.200)]',
         cancelled: 'bg-red-100 text-red-700 border-red-200'
     };
     const css = statusMaps[status?.toLowerCase()] || statusMaps.draft;
     return (
         <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${css}`}>
             {status}
         </span>
     );
  };

  // Action Buttons logic dynamically
  const ActionButtons = () => {
    switch (inv.status) {
       case 'draft': return (
         <>
            <button onClick={() => executeStatusAction('cancelled')} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-sm font-bold flex items-center gap-2 transition-all">
                <XCircle className="w-4 h-4" /> Cancel Vector
            </button>
            <button onClick={() => executeStatusAction('confirmed')} className="px-6 py-2.5 rounded-xl border border-transparent bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all">
                <CheckCircle className="w-4 h-4" /> Confirm & Map
            </button>
         </>
       );
       case 'confirmed': return (
         <>
            <div className="flex gap-2">
                <button onClick={() => toast.info('Mock Send logic executed natively.')} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold flex items-center gap-2 transition-all">
                    <Send className="w-4 h-4 text-blue-500" /> Send Email
                </button>
                <button onClick={() => window.print()} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold flex items-center gap-2 transition-all">
                    <Printer className="w-4 h-4 text-slate-400" /> Print PDF
                </button>
            </div>
            <button onClick={() => setIsPaymentModalOpen(true)} className="px-6 py-2.5 rounded-xl border border-transparent bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all">
                <CreditCard className="w-4 h-4" /> Record Ledger Payment
            </button>
         </>
       );
       default: return null; // read-only Paid/Cancelled states
    }
  };


  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <Link to="/invoices" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-red-500 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Invoices Dashboard
        </Link>
        <StatusBadge status={inv.status} />
      </div>

      {/* Main Container Document style */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm space-y-12 relative overflow-hidden">
        
        {/* Dynamic Watermark natively inserted */}
        {inv.status === 'paid' && (
            <div className="absolute top-24 right-[-40px] border-4 border-green-500 text-green-500 opacity-10 text-6xl font-black uppercase tracking-[0.5em] rotate-12 pointer-events-none select-none">PAID - SETTLED - CLEARED</div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 border border-red-100 shadow-inner mb-4">
                  <Receipt className="w-8 h-8" />
                </div>
                <div>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tight">{inv.invoiceNumber}</h1>
                   <p className="text-sm font-medium text-slate-500 mt-2 flex gap-4">
                      <span>Issued: {inv.issueDate || (inv.createdAt && String(inv.createdAt).slice(0, 10))}</span>
                      <span className={`${isOverdue(inv) ? 'text-red-600 font-bold' : ''}`}>Due Target: {inv.dueDate}</span>
                   </p>
                </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 min-w-[280px]">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Bill To Logic Entity</h3>
                {contact ? (
                    <div>
                        <p className="text-lg font-bold text-slate-800">{contact.name}</p>
                        <p className="text-sm text-slate-500 mt-1">{contact.email}</p>
                        <p className="text-sm text-slate-500">{contact.phone}</p>
                        <span className="mt-3 inline-block px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">{contact.type}</span>
                    </div>
                ) : (
                    <span className="text-slate-400 italic">Unlinked Client Configuration</span>
                )}
            </div>
        </div>
        
        <div className="border border-slate-200 rounded-2xl overflow-hidden block">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
                     <th className="p-4 pl-6">Line Component Description</th>
                     <th className="p-4 text-center">Unit Price</th>
                     <th className="p-4 text-center">Qty / Cycles</th>
                     <th className="p-4 text-center">Tax Yield</th>
                     <th className="p-4 pr-6 text-right">Ext. Amount Structure</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {(inv.lines || inv.subscription?.orderLines || []).map((line) => {
                    const productLabel =
                      typeof line.product === 'string'
                        ? line.product
                        : line.product?.name || 'Line item';
                    const taxPct = line.taxPercentage ?? line.tax?.percentage ?? 0;
                    return (
                     <tr key={line.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6">
                           <span className="font-bold text-slate-800 text-sm">{productLabel}</span>
                        </td>
                        <td className="p-4 text-center text-sm font-mono text-slate-600">${Number(line.unitPrice || 0).toFixed(2)}</td>
                        <td className="p-4 text-center text-sm font-medium text-slate-700">{line.qty}</td>
                        <td className="p-4 text-center text-sm font-medium text-slate-500">{taxPct}%</td>
                        <td className="p-4 pr-6 text-right font-mono text-sm font-black text-slate-800">${Number(line.amount || 0).toFixed(2)}</td>
                     </tr>
                    );
                  })}
               </tbody>
            </table>
        </div>

        <div className="flex justify-end gap-16 border-t border-slate-100 pt-8 pb-4">
             <div className="flex flex-col gap-3 w-72">
                 <div className="flex justify-between items-center text-slate-600">
                     <span className="text-sm font-bold tracking-wide">Gross Subtotal</span>
                     <span className="font-mono text-sm">${(inv.subtotal || 0).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-slate-600">
                     <span className="text-sm font-bold tracking-wide">Tax Arrays Computed</span>
                     <span className="font-mono text-sm">${(Number(inv.tax ?? inv.taxTotal) || 0).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 mb-2">
                     <span className="text-sm font-black uppercase tracking-widest text-slate-800">Final Total Map</span>
                     <span className="font-mono text-xl font-black text-rose-600 tracking-tighter">${(inv.total || 0).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-slate-600 px-2 border-b border-slate-200 pb-3">
                     <span className="text-xs font-bold tracking-widest uppercase">Cleared Amount</span>
                     <span className="font-mono text-sm text-green-600 font-bold">-${clearedTotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center text-slate-900 px-2">
                     <span className="text-base font-black">Remaining Balance</span>
                     <span className="font-mono text-base font-black">${((Number(inv.total) || 0) - clearedTotal).toFixed(2)}</span>
                 </div>
             </div>
        </div>

        {/* Dynamic Ledger Trace Array (Payment History) */}
        {payments.length > 0 && (
            <div className="pt-8 border-t border-dashed border-slate-200">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-6 uppercase tracking-widest">
                   <Clock className="w-4 h-4 text-emerald-500" /> Transaction Execution Histories
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {payments.map((p) => (
                       <div key={p.id} className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
                           <div>
                               <p className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded inline-block mb-2 uppercase tracking-tight">{p.paymentMethod}</p>
                               <p className="text-[10px] text-slate-500 font-medium">Logged on {p.paymentDate}</p>
                               <p className="text-xs text-slate-400 font-mono mt-0.5">{String(p.id).slice(0, 8)}</p>
                           </div>
                           <span className="text-lg font-black font-mono text-emerald-600 tracking-tighter">${Number(p.amount).toFixed(2)}</span>
                       </div>
                   ))}
                </div>
            </div>
        )}

      </div>

      <div className="flex justify-end gap-4 mt-6 print:hidden">
          {canWrite ? (
            <ActionButtons />
          ) : inv.status === 'confirmed' ? (
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4 text-slate-400" /> Print PDF
            </button>
          ) : null}
      </div>

      {canWrite && (
      <PaymentModal 
         isOpen={isPaymentModalOpen} 
         onClose={() => setIsPaymentModalOpen(false)} 
         onSave={handleRecordPayment} 
         invoice={inv} 
      />
      )}

    </div>
  );
};

export default InvoiceDetail;
