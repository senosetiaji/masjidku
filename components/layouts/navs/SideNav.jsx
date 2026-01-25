import { useRouter } from 'next/router'
import React from 'react'

function IconSettings() {
  return(
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  )
}

function IconMonetization() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
  )
}

function IconTakmeer() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  )
}

function IconDashboard() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function IconSubmenu() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}

function IconInventory() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  )
}

function IconMeeting() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  )
}

function IconAnalitik() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </svg>
  )
}

function MasterDataIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
    </svg>
  )
}



function SideNav({ isToggled }) {
  const [openAlias, setOpenAlias] = React.useState(null);
  const router = useRouter();
  const isActive = (link) => {
    if (!router?.pathname) return false;
    return router.pathname === link || router.pathname.startsWith(`${link}/`);
  };
  const toggleSubMenu = (alias) => {
    setOpenAlias((prev) => (prev === alias ? null : alias));
  };
  const menu = [
    { name: 'Dashboard', icon: <IconDashboard />, alias: 'dashboard', link: '/dashboard', show: true, subMenu: [] },
    { name: 'Master Data', icon: <MasterDataIcon />, alias: 'master_data', link: '/master-data', show: true, 
      subMenu: [
        { name: 'Pelnggan PAM', alias: 'pelanggan_pam', link: '/master-data/pelanggan-pam', show: true },
      ]
    },
    { name: 'Takmeer', icon: <IconTakmeer />, alias: 'takmeer', link: '/takmeer', show: true, subMenu: [] },
    { name: 'Keuangan', icon: <IconMonetization />, alias: 'keuangan', link: '/keuangan', show: true, 
      subMenu: [
        { name: 'Laporan Keuangan', alias: 'laporan_keuangan', link: '/keuangan/laporan-keuangan', show: true },
      ]
    },
    { name: 'Inventaris', icon: <IconInventory />, alias: 'inventaris', link: '/inventaris', show: true, 
      subMenu: [
        { name: 'Laporan Inventaris', alias: 'laporan_inventaris', link: '/inventaris/laporan-inventaris', show: true },
      ]
    },
    { name: 'Musyawarah', icon: <IconMeeting />, alias: 'musyawarah', link: '/musyawarah', show: true, subMenu: [] },
    { name: 'Analitik', icon: <IconAnalitik />, alias: 'analitik', link: '/analitik', show: true, subMenu: [] },
    { name: 'PAM', icon: <IconCalendar />, alias: 'pam', link: '/pam', show: true, 
      subMenu: [
        { name: 'Pemasangan', alias: 'laporan_pemasangan', link: '/pam/laporan-pemasangan', show: true },
        { name: 'Biaya Rutinan', alias: 'rutinan', link: '/pam/biaya-rutinan', show: true },
        { name: 'Kas PAM', alias: 'kas_pam', link: '/pam/kas-pam', show: true },
      ]
    },
    { name: 'Settings', icon: <IconSettings />, alias: 'settings', link: '/settings', show: true, 
      subMenu: [
        { name: 'Role Access', alias: 'role_access', link: '/settings/role-access', show: true },
        { name: 'Permissions', alias: 'permissions', link: '/settings/permissions', show: true },
        { name: 'User Management', alias: 'user_management', link: '/settings/user-management', show: true },
      ] 
    },
  ];
  return (
    <div className={`${isToggled ? '-left-full' : 'left-0'} w-56 fixed top-16 bottom-0 z-999 transition-all overflow-auto bg-white pt-4 transition-width duration-300`}>
      <div className="p-2 grid grid-cols-1 gap-4">
        {menu.filter(item => item.show).map((item, index) => {
          const hasSub = item.subMenu && item.subMenu.length > 0;
          const isOpen = openAlias === item.alias || isActive(item.link);

          if (hasSub) {
            return (
              <div key={index} className="">
                <button
                  type="button"
                  onClick={() => toggleSubMenu(item.alias)}
                  className={`w-full px-4 py-2 text-[#333333] flex items-center justify-between hover:bg-[#003844]/25 rounded-md cursor-pointer ${isActive(item.link) ? 'bg-[#003844]/90 text-white! font-semibold' : ''}`}
                >
                  <span className="flex items-center">
                    <span className={`mr-3 ${isActive(item.link) ? 'text-[#ffb100]' : ''}`}>{item.icon}</span>
                    <span className={`text-[#333333] ${isActive(item.link) ? 'text-white!' : ''} text-[13px]`}>{item.name}</span>
                  </span>
                  <span className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                    <IconSubmenu />
                  </span>
                </button>
                {isOpen && (
                  <div className="mt-4 border-t border-gray-200">
                    {item.subMenu.filter(sub => sub.show).map((subItem, subIndex) => {
                      const subActive = isActive(subItem.link);
                      return (
                        <div
                          key={subIndex}
                          className={`px-4 py-2 hover:bg-[#003844]/25 cursor-pointer text-[#333333] pl-6 text-[13px] ${subActive ? 'bg-[#003844]/75 text-white! font-semibold' : ''}`}
                          onClick={() => router.push(subItem.link)}
                        >
                          {subItem.name}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = isActive(item.link);
          return (
            <div
              key={index}
              className={`px-4 py-2 hover:bg-[#003844]/25 cursor-pointer flex items-center text-[#333333] rounded-md ${active ? 'bg-[#003844]/75 text-[#ffb100]! font-semibold' : ''}`}
              onClick={() => router.push(item.link)}
            >
              <div className="mr-3">{item.icon}</div>
              <div className={`text-[#333333] ${active ? 'text-white!' : ''} text-[13px]`}>{item.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default SideNav
