import React from 'react'
import Link from 'next/link'
import TopNav from './navs/TopNav'
import SideNav from './navs/SideNav'
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '@/store/actions/user.action';
import { toggleSidebar } from '@/store/slices/ui.slice';
import ModalError from '../modals/ModalError';
import ModalSuccess from '../modals/ModalSuccess';

function RootLayout({ breadcrumbs, children }) {
  const items = Array.isArray(breadcrumbs) ? breadcrumbs : [];
  
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { sidebarToggled } = useSelector((state) => state.ui);
  
  function toggleHandler() {
    dispatch(toggleSidebar());
  }

  React.useEffect(() => {
    if (!currentUser) {
      dispatch(getCurrentUser({params: {}}));
    }
  }, [currentUser]);
  return (
    <div>
      <TopNav toggleHandler={toggleHandler} isToggled={sidebarToggled} />
      <div className="mt-16 flex">
        <SideNav isToggled={sidebarToggled} />
        <div className={`${sidebarToggled ? 'md:ml-14' : 'md:ml-56'} ml-0 p-4 sm:p-6 md:p-8 lg:p-10 flex-1 bg-[#f0f4f8] min-h-[calc(100vh-4rem)]`}>
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-600 overflow-x-auto">
            <ol className="flex items-center gap-2 whitespace-nowrap">
              <li>
                <Link href="/dashboard" className="font-medium text-gray-700 hover:text-gray-900">
                  Home <span>/</span>
                </Link>
              </li>
              {items.map((item, idx) => {
                const isLast = idx === items.length - 1;
                const key = item.alias || item.link || item.label || idx;
                const isLink = item.link && !item.isDisabled && !isLast;
                return (
                  <li key={key} className="flex items-center gap-2">
                    {isLink ? (
                      <Link href={item.link} className="font-medium text-gray-700 hover:text-gray-900">
                        {item.label}
                      </Link>
                    ) : (
                      <span className={`font-medium ${isLast ? 'text-gray-900' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                    )}
                    {!isLast && <span className="text-gray-400">/</span>}
                  </li>
                );
              })}
            </ol>
          </nav>
          <div className="mt-2 bg-white p-4 md:p-6 rounded-lg shadow-sm">
            {children}
          </div>
        </div>
      </div>
      <ModalError />
      <ModalSuccess />
    </div>
  )
}

export default RootLayout
