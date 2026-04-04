import { Link } from 'react-router-dom';

const Page404 = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-blue-600 drop-shadow-sm mb-4">404</h1>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Page not found</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Link 
          to="/dashboard" 
          className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default Page404;
