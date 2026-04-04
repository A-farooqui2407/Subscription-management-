import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { subscriptionsApi } from '../api/subscriptions';
import { contactsApi } from '../api/contacts';
import { plansApi } from '../api/plans';
import { productsApi } from '../api/products';
import { taxesApi } from '../api/taxes';
import { discountsApi } from '../api/discounts';
import OrderLinesTable from '../components/OrderLinesTable';
import Spinner from '../components/Spinner';
import { ArrowLeft, Repeat, CheckCircle, Send, Play, XSquare, FileText, Percent } from 'lucide-react';

const SubscriptionDetail = () => {
  const { id } = useParams();
  const toast = useToast();
  
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Lookups
  const [contactsDict, setContactsDict] = useState({});
  const [plansDict, setPlansDict] = useState({});
  const [discountMap, setDiscountMap] = useState({});
  
  // Dependency arrays for OrderLinesTable readOnly
  const [products, setProducts] = useState([]);
  const [taxes, setTaxes] = useState([]);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await subscriptionsApi.getSubscriptionById(id);
      setSub(data);
      
      const [cRes, pRes, prRes, tRes, dRes] = await Promise.all([
          contactsApi.getContacts(),
          plansApi.getPlans(),
          productsApi.getProducts(),
          taxesApi.getTaxes(),
          discountsApi.getDiscounts()
      ]);
      
      const cDict = {}; (cRes.data || cRes).forEach(c => cDict[c.id] = c.name); setContactsDict(cDict);
      const pDict = {}; pRes.forEach(p => pDict[p.id] = p.name); setPlansDict(pDict);
      const dDict = {}; dRes.forEach(d => dDict[d.id] = d); setDiscountMap(dDict);
      
      setProducts(prRes.data || prRes);
      setTaxes(tRes);

    } catch (e) {
        if(e.message === "Subscription not found"){
            toast.error("This subscription pointer is permanently detached.");
        }else{
            toast.error('Critical failure mapping detail payload dependencies.');
        }
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);


  const executeStatusAction = async (newStatus) => {
      try {
          await subscriptionsApi.updateStatus(id, newStatus);
          
          if (newStatus === 'active') {
              toast.success("Subscription activated. Invoice has been generated.");
          } else {
              toast.success(`State advanced heavily -> ${newStatus.toUpperCase()}`);
          }
          
          fetchDetail();
      } catch (e) {
          toast.error("Execution logic rejected natively.");
      }
  };


  if (loading) return <div className="flex-1 flex justify-center items-center p-24"><Spinner size="lg" color="indigo" /></div>;
  if (!sub) return <div className="p-8 text-center text-slate-500 font-medium">Subscription artifact voided.</div>;

  const StatusBadge = ({ status }) => {
     const statusMaps = {
         draft: 'bg-slate-100 text-slate-700 border-slate-200',
         quotation: 'bg-blue-100 text-blue-700 border-blue-200',
         confirmed: 'bg-orange-100 text-orange-700 border-orange-200',
         active: 'bg-green-100 text-green-700 border-green-200 shadow-[0_0_10px_theme(colors.green.200)]',
         closed: 'bg-red-100 text-red-700 border-red-200'
     };
     const css = statusMaps[status?.toLowerCase()] || statusMaps.draft;
     return (
         <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${css}`}>
             Current State: {status}
         </span>
     );
  };

  const StatusActionButton = () => {
      // draft → show "Send Quotation" button only
      // quotation → show "Confirm" button only
      // confirmed → show "Activate" button only
      // active → show "Close" button only
      // closed → no action buttons, everything read-only
      
      switch (sub.status) {
          case 'draft': return (
              <button onClick={() => executeStatusAction('quotation')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors text-sm">
                  <Send className="w-4 h-4" /> Send Quotation
              </button>
          );
          case 'quotation': return (
              <button onClick={() => executeStatusAction('confirmed')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors text-sm">
                  <CheckCircle className="w-4 h-4" /> Confirm Quote
              </button>
          );
          case 'confirmed': return (
              <button onClick={() => executeStatusAction('active')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors text-sm">
                  <Play className="w-4 h-4" /> Activate Logic Matrix
              </button>
          );
          case 'active': return (
              <button onClick={() => executeStatusAction('closed')} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-sm transition-colors text-sm">
                  <XSquare className="w-4 h-4" /> Close Subscription
              </button>
          );
          default: return null;
      }
  };
  
  const discountLogic = sub.discountId ? discountMap[sub.discountId] : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <Link to="/subscriptions" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Logics Array
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 flex-shrink-0 shadow-inner">
                  <Repeat className="w-8 h-8" />
              </div>
              <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                      {sub.subNumber} 
                  </h1>
                  <div className="flex items-center gap-3 mt-3 text-sm text-slate-500 font-medium">
                      <StatusBadge status={sub.status} />
                  </div>
              </div>
           </div>
           
           <div className="flex gap-4 items-center md:pr-4">
              <StatusActionButton />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             {/* Order Lines Injection Viewer */}
             <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                     <FileText className="w-5 h-5 text-slate-400" /> Embedded Operations Vectors
                  </h2>
                  <p className="text-sm text-slate-500 mb-6 font-medium">Order Arrays structurally frozen mapping historical line parameters.</p>
                  
                  <OrderLinesTable 
                     lines={sub.lines || []}
                     setLines={() => {}}
                     products={products}
                     taxes={taxes}
                     readOnly={true}
                  />
             </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                 <h3 className="text-x font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Client Parameters</h3>
                 <div className="space-y-4">
                     <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Target Account</p>
                         <p className="font-semibold text-slate-700">{contactsDict[sub.customerId] || 'Unlinked'}</p>
                     </div>
                     <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Sub Plan</p>
                         <p className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                             {plansDict[sub.planId] || 'Standalone Contract / Not Bound'}
                         </p>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Start Point</p>
                             <p className="font-semibold text-slate-700">{sub.startDate?.split('T')[0]}</p>
                         </div>
                         <div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Expiry Frame</p>
                             <p className="font-semibold text-slate-700">{sub.expirationDate ? sub.expirationDate.split('T')[0] : 'Indefinite Loop'}</p>
                         </div>
                     </div>
                 </div>
             </div>

             {discountLogic && (
                 <div className="bg-orange-50/50 border border-orange-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                     <Percent className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-orange-500/5 rotate-12" />
                     <h3 className="text-base font-bold text-orange-900 mb-4 flex items-center gap-2">
                        Active Discount Logic
                     </h3>
                     <div className="space-y-2 relative z-10">
                         <div className="flex justify-between text-sm font-medium">
                            <span className="text-orange-700">{discountLogic.name}</span>
                            <span className="font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded">
                               {discountLogic.type === 'Percentage' ? `${discountLogic.value}% OFF` : `-$${discountLogic.value.toFixed(2)}`}
                            </span>
                         </div>
                     </div>
                 </div>
             )}
          </div>
      </div>
    </div>
  );
};

export default SubscriptionDetail;
