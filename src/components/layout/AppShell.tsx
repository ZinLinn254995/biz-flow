import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Briefcase, Menu } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import MobileNavigation from '@/components/layout/MobileNavigation';

function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNavigation
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="flex">
        <Sidebar />

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-14">
              <button
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
              >
                <Menu className="w-5 h-5" strokeWidth={2} />
              </button>

              <div className="lg:hidden flex items-center gap-2.5 ml-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900">
                  <Briefcase className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-base font-bold text-gray-900 tracking-tight">
                  BizFlow
                </span>
              </div>

              <div className="hidden lg:block" />
            </div>
          </header>

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
