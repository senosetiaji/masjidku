import React from 'react';
import Box from '@mui/material/Box';
import LoadingAnimation  from '@/assets/lottie-files/lottie-loading.json'
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types'

const Lottie = dynamic(
  () => import('lottie-react'),
  { ssr: false }
)

function Loading(props) {
  const {
    show,
    position
  } = props;

  return (
    <Box className={`${!show&&'hidden'} modal-loading ${position || 'fixed'} top-0 left-0 right-0 bottom-0 bg-[#ffffff1a] filter backdrop-blur-3xl z-[999] flex items-center justify-center flex-col`}>
      <Box className='flex flex-col items-center justify-center w-fit'>
        <Lottie
          style={{
            width:'300px',
            objectFit:'cover'
          }} 
          animationData={LoadingAnimation} 
          loop={true} 
          className=' animate__animated animate__fadeInUp animate__fast'
        />
        <h3 className="text-[24px] font-semibold">Mengolah Informasi</h3>
        <div className="animate-pulse text-[14px] text-slate-600 mt-4">Data sedang kami siapkan. Mohon tunggu.</div>
      </Box>
    </Box>
  )
}

Loading.propTypes = {
  show: PropTypes.bool,
  position:PropTypes.string
}

export default Loading
