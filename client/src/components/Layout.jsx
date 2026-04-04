import Sidebar from './Sidebar';
import Navbar from './Navbar';
const Layout = ({ children }) => {
  return (
      <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-8 pb-24 relative">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
  );
};

export default Layout;
