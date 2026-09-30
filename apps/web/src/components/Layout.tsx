import { useEffect, useState } from 'react';

import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { projectsApi } from '../lib/api';

import { useAuth } from '../lib/auth';

import { roleLabels } from '../lib/format';

import type { Project } from '../lib/types';

import {

  IconBuilding,

  IconCalendar,

  IconDashboard,

  IconDocument,

  IconDollar,

  IconLogout,

  IconProjects,

} from './icons';



type NavItem = { to: string; label: string; icon: typeof IconDashboard; badge?: boolean };



function getNav(role?: string): NavItem[] {

  const items: NavItem[] = [

    { to: '/', label: 'Dashboard', icon: IconDashboard },

    { to: '/projects', label: role === 'PM' ? 'My Tasks' : 'Projects', icon: IconProjects, badge: role === 'PM' },

    { to: '/properties', label: 'Portfolio', icon: IconBuilding },

    { to: '/reports', label: 'Reports', icon: IconDocument },

  ];



  if (role === 'QA' || role === 'PM' || role === 'ADMIN' || role === 'CEO') {

    items.push({ to: '/gantt', label: 'Gantt', icon: IconCalendar });

  }



  if (role === 'FINANCE' || role === 'CEO' || role === 'ADMIN') {

    items.push({ to: '/budgets', label: 'Budgets', icon: IconDollar });

  }



  if (role === 'FINANCE' || role === 'CEO' || role === 'ADMIN') {

    items.push({ to: '/approvals', label: 'Approvals', icon: IconDocument });

  }



  if (role === 'PM' || role === 'QA' || role === 'FINANCE' || role === 'CEO' || role === 'ADMIN') {

    items.push({ to: '/documents', label: 'Documents', icon: IconDocument });

  }



  return items;

}



export function Layout() {

  const { user, logout } = useAuth();

  const location = useLocation();

  const nav = getNav(user?.role);

  const [projects, setProjects] = useState<Project[]>([]);

  const [myCount, setMyCount] = useState(0);



  useEffect(() => {

    projectsApi.list().then(setProjects).catch(() => {});

    if (user?.role === 'PM') {

      projectsApi.list({ mine: true }).then((p) => setMyCount(p.length)).catch(() => {});

    }

  }, [user]);



  const favorites = projects.filter((p) => p.status === 'ACTIVE').slice(0, 3);



  return (

    <div className="min-h-screen flex bg-[#f5f6f8]">

      <aside className="w-[220px] bg-white border-r border-[#eceef2] flex flex-col shrink-0">

        <div className="p-4 flex items-center gap-2.5 border-b border-[#eceef2]">

          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-xs">A</div>

          <div>

            <p className="text-[13px] font-bold text-gray-900 leading-none">EstatePM</p>

            <p className="text-[10px] text-gray-400 mt-0.5">Alamait</p>

          </div>

        </div>



        <div className="p-3 flex items-center gap-2.5 border-b border-[#eceef2]">

          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[11px] font-bold text-gray-600">

            {user?.name?.charAt(0) ?? '?'}

          </div>

          <div className="min-w-0 flex-1">

            <p className="text-[12px] font-semibold text-gray-900 truncate">{user?.name}</p>

            <p className="text-[10px] text-gray-400 truncate">{user ? roleLabels[user.role] : ''}</p>

          </div>

        </div>



        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">

          {nav.map((item) => (

            <NavLink

              key={item.to}

              to={item.to}

              end={item.to === '/'}

              className={({ isActive }) =>

                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${

                  isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'

                }`

              }

            >

              <item.icon className="w-[17px] h-[17px]" />

              {item.label}

              {item.badge && myCount > 0 && (

                <span className="ml-auto text-[9px] font-bold bg-gray-900 text-white min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">

                  {myCount}

                </span>

              )}

            </NavLink>

          ))}



          {(user?.role === 'CEO' || user?.role === 'ADMIN') && (

            <NavLink

              to="/audit"

              className={({ isActive }) =>

                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${

                  isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'

                }`

              }

            >

              <IconDocument className="w-[17px] h-[17px]" />

              Audit

            </NavLink>

          )}



          <NavLink

            to="/team"

            className={({ isActive }) =>

              `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${

                isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'

              }`

            }

          >

            <IconProjects className="w-[17px] h-[17px]" />

            Team

          </NavLink>



          {favorites.length > 0 && (

            <>

              <p className="px-3 pt-5 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active</p>

              {favorites.map((f) => (

                <NavLink

                  key={f.id}

                  to={`/projects/${f.id}`}

                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"

                >

                  <span className="w-1 h-1 rounded-full bg-teal-400 shrink-0" />

                  <span className="truncate">{f.name}</span>

                </NavLink>

              ))}

            </>

          )}

        </nav>



        <div className="p-3 border-t border-[#eceef2]">

          <button

            type="button"

            onClick={logout}

            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"

          >

            <IconLogout className="w-[17px] h-[17px]" />

            Sign out

          </button>

        </div>

      </aside>



      <main className="flex-1 overflow-auto min-w-0">

        <Outlet key={location.pathname} />

      </main>

    </div>

  );

}

