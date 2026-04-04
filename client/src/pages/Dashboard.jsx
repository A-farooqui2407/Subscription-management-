import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard';
import { contactsApi } from '../api/contacts';
import Spinner from '../components/Spinner';
import { Activity, CreditCard, Receipt, Repeat, WalletCards, ArrowRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MetricCard = ({ title, value, icon: Icon, color, isCurrency = false }) => (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-5">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-bold flex-shrink-0 ${color}`}>
           <Icon className="w-6 h-6" />
       </div>
       <div>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{title}</p>
           <h3 className={`text-2xl font-black mt-1 ${title.includes('Overdue') ? 'text-red-600' : 'text-slate-900'} tracking-tight`}>
               {isCurrency ? `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : value}
           </h3>
       </div>
    </div>
);

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [activity, setActivity] = useState(null);
  const [contactsDict, setContactsDict] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDash = async () => {
        try {
            const [mRes, aRes, cRes] = await Promise.all([
                dashboardApi.getOverviewMetrics(),
                dashboardApi.getRecentActivity(),
                contactsApi.getContacts()
            ]);
            
            setMetrics(mRes);
            setActivity(aRes);
            
            const cDict = {};
            (cRes.data || cRes).forEach(c => { cDict[c.id] = c.name });
            setContactsDict(cDict);
            
        } catch (e) {
            console.error("Dashboard metric resolution failure", e);
        } finally {
            setLoading(false);
        }
    };
    fetchDash();
  }, []);

  if (loading) return <div className="h-full flex justify-center items-center"><Spinner size="lg" color="indigo" /></div>;
  if (!metrics) return null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mission Control</h1>
          <p className="mt-1 text-slate-500">Global analytic parameters calculating arrays actively in real-time natively.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
             title="Active Subs." 
             value={metrics.activeSubscriptions} 
             icon={Repeat} 
             color="bg-indigo-50 text-indigo-600 border-indigo-100" 
          />
          <MetricCard 
             title="Overall Revenue" 
             value={metrics.totalRevenue} 
             icon={WalletCards} 
             color="bg-green-50 text-green-600 border-green-100" 
             isCurrency 
          />
          <MetricCard 
             title="Pending Accounts" 
             value={metrics.pendingPaymentsAmount} 
             icon={CreditCard} 
             color="bg-orange-50 text-orange-600 border-orange-100" 
             isCurrency 
          />
          <MetricCard 
             title="Overdue Invoice" 
             value={metrics.overdueInvoicesCount} 
             icon={AlertTriangle} 
             color="bg-red-50 text-red-600 border-red-200 shadow-inner" 
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Overdue Invoices Critical Panel */}
          <div className="lg:col-span-2 bg-white border border-red-200 rounded-3xl overflow-hidden shadow-sm shadow-red-100/50">
             <div className="bg-red-50 p-5 border-b border-red-100 flex justify-between items-center">
                 <h3 className="font-extrabold text-red-800 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-red-600" />
                    Critical Overdue Invoices
                 </h3>
                 <Link to="/invoices" className="text-sm font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 transition-all">
                     View All <ArrowRight className="w-4 h-4" />
                 </Link>
             </div>
             {activity.overdueInvoices?.length === 0 ? (
                 <div className="p-8 text-center text-sm font-bold text-red-400">Zero Overdue Records Assessed Globally</div>
             ) : (
                 <div className="overflow-x-auto">
                     <table className="w-full text-left">
                         <tbody className="divide-y divide-red-50/50">
                             {activity.overdueInvoices?.map(inv => (
                                 <tr key={inv.id} className="hover:bg-red-50/20 transition-colors">
                                     <td className="p-4 pl-6">
                                         <Link to={`/invoices/${inv.id}`} className="font-bold text-slate-800 hover:text-red-600">{inv.invoiceNumber}</Link>
                                     </td>
                                     <td className="p-4 text-sm font-medium text-slate-600">{contactsDict[inv.customerId] || 'Client Unknown'}</td>
                                     <td className="p-4 text-sm text-center font-bold text-red-500">Due: {inv.dueDate}</td>
                                     <td className="p-4 pr-6 text-right font-black font-mono text-slate-800">${(inv.total || 0).toFixed(2)}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             )}
          </div>


          {/* Recent Subscriptions */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
             <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    Recent Subscriptions
                 </h3>
                 <Link to="/subscriptions" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 transition-all">
                     See Array <ArrowRight className="w-4 h-4" />
                 </Link>
             </div>
             {activity.recentSubscriptions?.length === 0 ? (
                 <div className="p-8 text-center text-sm font-medium text-slate-400">No Subscriptions Found</div>
             ) : (
                 <div className="overflow-x-auto">
                     <table className="w-full text-left">
                         <tbody className="divide-y divide-slate-100">
                             {activity.recentSubscriptions?.map(sub => (
                                 <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                     <td className="p-4 pl-6">
                                         <Link to={`/subscriptions/${sub.id}`} className="font-bold text-slate-800 hover:text-indigo-600">{sub.subNumber}</Link>
                                     </td>
                                     <td className="p-4 text-sm font-medium text-slate-600">{contactsDict[sub.customerId] || 'Client Unknown'}</td>
                                     <td className="p-4 pr-6 text-right font-black font-mono text-indigo-600">${(sub.total || 0).toFixed(2)}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             )}
          </div>

          {/* Recent Payments */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
             <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                    <WalletCards className="w-5 h-5 text-green-500" />
                    Recent Payments Extracted
                 </h3>
                 <Link to="/payments" className="text-sm font-bold text-green-600 hover:text-green-700 hover:underline flex items-center gap-1 transition-all">
                     All Ledgers <ArrowRight className="w-4 h-4" />
                 </Link>
             </div>
             {activity.recentPayments?.length === 0 ? (
                 <div className="p-8 text-center text-sm font-medium text-slate-400">No Payment Volumes Configured</div>
             ) : (
                 <div className="overflow-x-auto">
                     <table className="w-full text-left">
                         <tbody className="divide-y divide-slate-100">
                             {activity.recentPayments?.map(p => (
                                 <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                     <td className="p-4 pl-6">
                                         <Link to={`/invoices/${p.invoiceId}`} className="font-bold text-slate-800 hover:text-emerald-600">{p.paymentNumber}</Link>
                                     </td>
                                     <td className="p-4 text-xs font-bold"><span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-600 uppercase tracking-widest">{p.method}</span></td>
                                     <td className="p-4 pr-6 text-right font-black font-mono text-emerald-600">${(p.amount || 0).toFixed(2)}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             )}
          </div>

      </div>
    </div>
  );
};

export default Dashboard;
