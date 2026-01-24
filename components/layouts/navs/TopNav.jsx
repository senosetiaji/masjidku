import React from 'react'
import IconButton from '@mui/material/IconButton'
import SettingsIcon from '@mui/icons-material/Settings';
import { Button } from '@mui/material';
import { logout } from '@/store/actions/auth.action';
import { useDispatch } from 'react-redux';
import Image from 'next/image';

function TopNav() {
  const [openMenu, setOpenMenu] = React.useState(false);
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout({}));
  }
  return (
    <div className="w-full h-16 bg-[#003844] shadow-md flex items-center px-6 justify-between fixed top-0 z-9999">
      <div className="logo text-[#ffb100] font-bold text-[18px]">
        <Image src="/assets/logo-main.png" alt="Logo" width={140} height={70} className="inline-block mr-2 align-middle" />
      </div>
      <div className="nav-items relative">
        {/* Navigation items can be added here */}
        <IconButton aria-label="settings" onClick={() => setOpenMenu(!openMenu)}>
          <SettingsIcon className="text-white" />
        </IconButton>
        {/* toggle button can be added here */}
        <div className={`absolute top-12 right-0 bg-white shadow-lg rounded-md overflow-hidden w-48 ${openMenu ? '' : 'hidden'}`}>
          <ul>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-center">
              <Button variant="text" color="primary" size="small" onClick={() => handleLogout()}>Logout</Button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default TopNav
