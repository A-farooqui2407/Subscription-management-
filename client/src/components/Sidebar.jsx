import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Contact, Box, Tags, Repeat, Receipt, CreditCard, Percent, FileText, ClipboardList } from 'lucide-react';

const allNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'user', 'internalUser'] },
  { path: '/reports', label: 'Reports', icon: FileText, roles: ['admin', 'internalUser'] },
  { path: '/users', label: 'Users', icon: Users, roles: ['admin'] },
  { path: '/contacts', label: 'Contacts', icon: Contact, roles: ['admin', 'internalUser', 'user'] },
  { path: '/products', label: 'Products', icon: Box, roles: ['admin'] },
  { path: '/plans', label: 'Plans', icon: Tags, roles: ['admin'] },
  { path: '/quotation-templates', label: 'Templates', icon: ClipboardList, roles: ['admin'] },
  { path: '/subscriptions', label: 'Subscriptions', icon: Repeat, roles: ['admin', 'user', 'internalUser'] },
  { path: '/discounts', label: 'Discounts', icon: Percent, roles: ['admin'] },
  { path: '/taxes', label: 'Taxes', icon: FileText, roles: ['admin'] },
  { path: '/invoices', label: 'Invoices', icon: Receipt, roles: ['admin', 'user', 'internalUser'] },
  { path: '/payments', label: 'Payments', icon: CreditCard, roles: ['admin', 'user', 'internalUser'] },
];

const Sidebar = () => {
  const { role } = useAuth();
  const visibleItems = allNavItems.filter((item) => item.roles.includes(role || 'user'));

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0 flex-shrink-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-500 rounded-lg mr-3 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center font-bold">
          S
        </div>
        <h1 className="text-xl font-extrabold tracking-tight">SaaS<span className="text-blue-500">Box</span></h1>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1.5 custom-scrollbar overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
