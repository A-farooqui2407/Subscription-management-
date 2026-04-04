import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Page403 = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex justify-center items-center w-20 h-20 bg-red-100 rounded-full mb-6 text-red-600">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Access Denied</h1>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <Link 
          to="/dashboard" 
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Page403;
