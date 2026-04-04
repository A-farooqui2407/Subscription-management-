import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [isPinned, setIsPinned] = useState(() => {
    const stored = localStorage.getItem('sidebarPinned');
    return stored === 'true' ? true : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarPinned', isPinned);
  }, [isPinned]);

  return (
      <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
        <Sidebar isPinned={isPinned} setIsPinned={setIsPinned} />
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-200 ease-in-out">
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
