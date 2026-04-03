import React from 'react'
import IconButton from '@mui/material/IconButton'
import SettingsIcon from '@mui/icons-material/Settings';
import { Button } from '@mui/material';
import { changePassword, logout } from '@/store/actions/auth.action';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import ModalChangePassword from '@/components/modals/ModalChangePassword';
import { modalError } from '@/store/actions/modal.action';

function IconUnToggled() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
    </svg>
  )
}

function IconToggled() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
  )
}

function TopNav({ toggleHandler, isToggled }) {
  const [openMenu, setOpenMenu] = React.useState(false);
  const [openChangePassword, setOpenChangePassword] = React.useState(false);
  const menuRef = React.useRef(null)
  const dispatch = useDispatch();
  const { isLoadingChangePassword } = useSelector((state) => state.auth)
  const { currentUser } = useSelector((state) => state.user)
  const normalizedRole = String(currentUser?.role || currentUser?.effectiveRole || '').toLowerCase();
  const isTakmeerRole = normalizedRole === 'takmeer' || normalizedRole === 'tekmeer';

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    dispatch(logout({}));
  }

  const handleSubmitChangePassword = async (payload) => {
    try {
      await dispatch(changePassword({ payload })).unwrap()
      setOpenChangePassword(false)
      setOpenMenu(false)
    } catch (error) {
    }
  }

  const openChangePasswordModal = () => {
    if (isTakmeerRole) {
      setOpenMenu(false)
      dispatch(modalError(true, {
        message: 'Role Takmeer tidak memiliki akses untuk mengubah password.',
      }))
      return
    }

    setOpenMenu(false)
    setOpenChangePassword(true)
  }

  return (
    <div className="w-full h-16 bg-[#003844] shadow-md flex items-center px-6 justify-between fixed top-0 z-9999">
      <div className="flex gap-4">
        <IconButton aria-label="menu" onClick={toggleHandler} className='text-white!'>
          {isToggled ? <IconToggled /> : <IconUnToggled />}
        </IconButton>
        <div className="logo text-[#ffb100] font-bold text-[18px]">
          <Image src="/assets/logo-main.png" alt="Logo" width={140} height={70} className="inline-block mr-2 align-middle" />
        </div>
      </div>
      <div className="nav-items relative" ref={menuRef}>
        {/* Navigation items can be added here */}
        <IconButton aria-label="settings" onClick={() => setOpenMenu(!openMenu)}>
          <SettingsIcon className="text-white" />
        </IconButton>
        {/* toggle button can be added here */}
        <div className={`absolute top-12 right-0 bg-white shadow-lg rounded-md overflow-hidden w-48 ${openMenu ? '' : 'hidden'}`}>
          <ul>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-center">
              <Button variant="text" color="primary" size="small" onClick={openChangePasswordModal} disabled={isTakmeerRole}>Ubah Password</Button>
            </li>
            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-center">
              <Button variant="text" color="primary" size="small" onClick={() => handleLogout()}>Logout</Button>
            </li>
          </ul>
        </div>
      </div>
      <ModalChangePassword
        open={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
        onSubmit={handleSubmitChangePassword}
        loading={isLoadingChangePassword}
      />
    </div>
  )
}

export default TopNav
