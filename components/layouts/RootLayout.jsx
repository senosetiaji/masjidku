import React from 'react'
import Link from 'next/link'
import TopNav from './navs/TopNav'
import SideNav from './navs/SideNav'
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '@/store/actions/user.action';
import ModalError from '../modals/ModalError';
import ModalSuccess from '../modals/ModalSuccess';

function RootLayout({ breadcrumbs, children }) {
  const items = Array.isArray(breadcrumbs) ? breadcrumbs : [];
  
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  
  React.useEffect(() => {
    if (!currentUser) {
      dispatch(getCurrentUser({params: {}}));
    }
  }, [currentUser]);
  return (
    <div>
      <TopNav />
      <div className="mt-16 flex">
        <SideNav />
        <div className="ml-56 p-12 pl-6 flex-1 bg-[#f0f4f8] min-h-[calc(100vh-4rem)]">
          <nav aria-label="Breadcrumb" className="mb-4 ml-4 text-sm text-gray-600">
            <ol className="flex items-center gap-2">
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
          <div className="mt-2 bg-white p-6 rounded-lg shadow-sm">
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
