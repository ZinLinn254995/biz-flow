import { NavLink } from 'react-router-dom';
import { Briefcase, X } from 'lucide-react';
import { navigationGroups } from '@/config/navigationItems';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw] bg-white border-r border-gray-200 lg:hidden transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900">
              <Briefcase className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-gray-900 tracking-tight">
                BizFlow
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                Business &amp; Finance
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label="Mobile navigation"
        >
          {navigationGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          [
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2',
                            isActive
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                          ].join(' ')
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default MobileNavigation;
