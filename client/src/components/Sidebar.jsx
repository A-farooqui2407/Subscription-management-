import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Contact, Box, Tags, Repeat, Receipt, CreditCard, Percent, FileText, ClipboardList, Pin, PinOff, LogOut, UserCircle } from 'lucide-react';

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

const Sidebar = ({ isPinned, setIsPinned }) => {
  const { role } = useAuth();
  const visibleItems = allNavItems.filter((item) => item.roles.includes(role || 'user'));
  
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isPinned || isHovered;

  const handleLogout = () => {
     localStorage.removeItem('token');
     localStorage.removeItem('user');
     window.location.href = '/login';
  };

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-slate-900 text-white flex flex-col h-screen flex-shrink-0 transition-all duration-200 ease-in-out ${
        isExpanded ? 'w-56 shadow-xl z-20' : 'w-16 z-20'
      }`}
    >
      <div className="h-16 flex items-center px-4 border-b border-slate-800/50 justify-between flex-shrink-0">
        <div className="flex items-center w-full">
            <div className={`flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.5)] flex items-center justify-center font-bold transition-all duration-200 ${!isExpanded ? 'mx-auto' : ''}`}>
              S
            </div>
            <h1 className={`text-xl font-black tracking-tight ml-3 transition-opacity duration-200 whitespace-nowrap overflow-hidden ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                SaaS<span className="text-indigo-500">Box</span>
            </h1>
        </div>
        
        {isExpanded && (
            <button 
               onClick={() => setIsPinned(!isPinned)}
               className="text-slate-400 hover:text-white transition-colors p-1"
               title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
            >
               {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
            </button>
        )}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 custom-scrollbar overflow-y-auto overflow-x-hidden">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.path} className="relative group">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center rounded-xl font-medium transition-all duration-200 ${
                    isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  } ${isExpanded ? 'px-3 py-2.5 gap-3' : 'justify-center p-2.5 w-10 h-10 mx-auto'}`
                }
              >
                <Icon size={20} className="flex-shrink-0" />
                
                <span className={`transition-opacity duration-200 whitespace-nowrap overflow-hidden text-sm ${
                    isExpanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'
                }`}>
                    {item.label}
                </span>
              </NavLink>
              
              {!isExpanded && !isHovered && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-slate-800 text-xs font-bold text-white rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg">
                      {item.label}
                  </div>
              )}
            </div>
          );
        })}
      </nav>
      
      <div className="p-3 border-t border-slate-800/50">
         <div className={`flex items-center rounded-xl font-medium text-slate-400 transition-all duration-200 ${isExpanded ? 'px-3 py-3 gap-3 bg-slate-800/50' : 'justify-center p-2.5 w-10 h-10 mx-auto group relative'}`}>
             <UserCircle size={20} className={`flex-shrink-0 ${isExpanded ? 'text-indigo-400' : 'text-slate-400'}`} />
             
             <div className={`flex items-center justify-between flex-1 transition-opacity duration-200 whitespace-nowrap overflow-hidden ${isExpanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'}`}>
                 <span className="text-xs font-bold text-slate-300 tracking-wider">{(role || 'User').toUpperCase()}</span>
                 <button onClick={handleLogout} title="Logout" className="text-slate-500 hover:text-red-400 transition-colors p-1 bg-slate-800 rounded-md hover:bg-slate-700">
                     <LogOut size={14} />
                 </button>
             </div>
             
             {/* Fallback button when collapsed just logs out */}
             {!isExpanded && !isHovered && (
                 <button 
                    onClick={handleLogout}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Logout"
                 />
             )}
             
             {!isExpanded && !isHovered && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-slate-800 text-xs font-bold text-white rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg">
                      Log Out Account
                  </div>
              )}
         </div>
      </div>
    </aside>
  );
};

export default Sidebar;
