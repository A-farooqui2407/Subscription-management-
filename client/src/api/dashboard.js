import api from './axios';
import { subscriptionsApi } from './subscriptions';
import { invoicesApi } from './invoices';
import { paymentsApi } from './payments';

export const dashboardApi = {
  getOverviewMetrics: async () => {
    try {
      // Intended backend GET /dashboard/metrics
      const response = await api.get('/dashboard/metrics');
      return response.data;
    } catch (e) {
      // Mock computation locally from dummy caches for dev stability
      try {
          const subs = await subscriptionsApi.getSubscriptions();
          const invs = await invoicesApi.getInvoices();
          
          const activeSubsCount = subs.filter(s => s.status === 'active').length;
          
          const overdues = invs.filter(i => {
              if (i.status === 'paid' || i.status === 'draft' || i.status === 'cancelled') return false;
              return new Date(i.dueDate) < new Date();
          });
          const overdueCount = overdues.length;
          
          // Pending payments metric could be total invoices confirmed but not paid fully
          let pendingTotal = 0;
          let revenueTotal = 0;
          invs.forEach(i => {
              revenueTotal += (i.amountPaid || 0); // Lifetime liquid collected
              if (i.status === 'confirmed') {
                  pendingTotal += ((i.total || 0) - (i.amountPaid || 0));
              }
          });

          return {
              activeSubscriptions: activeSubsCount,
              totalRevenue: revenueTotal,
              pendingPaymentsAmount: pendingTotal,
              overdueInvoicesCount: overdueCount
          };
      } catch (err) {
          return {
              activeSubscriptions: 0,
              totalRevenue: 0,
              pendingPaymentsAmount: 0,
              overdueInvoicesCount: 0
          };
      }
    }
  },

  getRecentActivity: async () => {
     try {
         const response = await api.get('/dashboard/activity');
         return response.data;
     } catch (e) {
         try {
             // Slices naturally emulate ordered desc structures heavily
             let subs = await subscriptionsApi.getSubscriptions();
             let pays = await paymentsApi.getPayments();
             let invs = await invoicesApi.getInvoices();
             
             const overdues = invs.filter(i => {
                 if (i.status === 'paid' || i.status === 'draft' || i.status === 'cancelled') return false;
                 return new Date(i.dueDate) < new Date();
             }).slice(0, 5); // 5 max
             
             return {
                 recentSubscriptions: subs.slice(0, 5),
                 recentPayments: pays.slice(0, 5),
                 overdueInvoices: overdues
             };
         } catch (err) {
             return { recentSubscriptions: [], recentPayments: [], overdueInvoices: [] };
         }
     }
  }
};
