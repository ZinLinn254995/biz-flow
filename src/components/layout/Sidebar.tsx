import { NavLink } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { navigationGroups } from '@/config/navigationItems';

function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-gray-200 bg-white h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-gray-200">
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

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
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
  );
}

export default Sidebar;
