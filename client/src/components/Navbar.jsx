import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, role, logout } = useAuth();

  return (
    <nav className="h-16 px-8 flex justify-between items-center bg-white border-b border-slate-200 sticky top-0 z-10 w-full shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile menu could go here */}
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 py-1.5 px-3 rounded-full">
          <div className="w-8 h-8 rounded-full bg-blue-600 bg-gradient-to-tr from-blue-700 to-blue-400 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col pr-2">
            <span className="text-sm font-bold text-slate-800 leading-tight">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {role === 'user' ? 'Portal' : role || 'User'}
            </span>
          </div>
        </div>

        <button 
          onClick={logout} 
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors bg-white hover:bg-red-50 p-2 rounded-lg"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
