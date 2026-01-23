import React, { useState,forwardRef, useImperativeHandle, useEffect } from 'react'
import Box from '@mui/material/Box';
import Button from '../buttons/Button';
import { any, bool, func, string } from 'prop-types';

const ModalConfirm = forwardRef((props, ref) => {
  const {
    loading,
    message,
    description,
    onConfirm,
    dataTestId,
    onClose,
    noConfirmation
  } = props;

  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const [animation, setAnimation] = useState('animate__fadeInUp')
  const [backdropAnimation, setBackdropAnimation] = useState('animate__fadeIn')

  const openModal = (val) => {
    setOpen(true)
    setData(val)
  }

  React.useEffect(() => {
    console.log('data modal confirm', data);
  }, [data])

  const closeModal = () => {
    setAnimation('animate__fadeOutDown')
    setBackdropAnimation('animate__fadeOut')
    setData(null)
    if(typeof onClose == 'function'){
      onClose()
    }
    setTimeout(() => {
      setBackdropAnimation('animate__fadeIn')
      setAnimation('animate__fadeInUp')
      setOpen(false)
      
    }, 500);
  }

  useEffect(() => {
    if(!loading) {
      closeModal()
    }
  }, [loading])

  useImperativeHandle(ref, ()=> {
    return {
      open:(val) => openModal(val),
      close:() => closeModal()
    }
  })


  const handleConfirm = () => {
    if(typeof confirm == 'function'){
      onConfirm(data)
    }
    closeModal()
  }

  return (
    <Box className={`${open?'block':'hidden'} animate__animated ${backdropAnimation} animate__faster bg-[#dfab003f] filter backdrop-blur-[4px] fixed left-0 right-0 top-0 bottom-0 !z-[99]`}>
      <div className={`w-fit rounded-xl bg-[#ffffffc2] border-[12px] border-white absolute top-0 bottom-0 left-0 right-0 m-auto h-fit animate__animated  animate__faster shadow-lg min-w-[300px] max-w-[90%] md:max-w-[400px] lg:max-w-[500px] 2xl:max-w-[600px] 3xl:max-w-[700px] 4xl:max-w-[800px] 5xl:max-w-[900px] animate__faster p-6 ${animation}`}>
        <div className={`text-[#f1cd00ea] title text-[40px] text-center font-semibold font-bebas-neue`}>
          Peringatan!
        </div>
        <div className="text-center text-gray-400 mt-2 text-[15px]">{message || 'Apakah anda yakin ingin melanjutkan aksi ini?'}</div>
        {description && <div className="text-center text-gray-400 mt-1 text-[12px]">{description}</div>}
        <div className="flex items-center justify-center gap-4 mt-6">
          {!noConfirmation && (
            <>
              <Button className={'!bg-transparent hover:!bg-gray-300 !text-[#747474] border !border-transparent hover:!border-gray-300'}
                variant="outlined"
                label="Batal"
                size={'small'} 
                dataTestId={"btn-modal-cancel"}
                disabled={loading}
                loading={loading}
                onClick={closeModal}/>
              <Button className={'!bg-yellow-400 hover:!bg-yellow-700 !text-white'}
                label="Ya, Lanjutkan"
                dataTestId={dataTestId || "btn-modal-confirm"}
                size={'small'} 
                variant="contained" 
                onClick={handleConfirm} 
                disabled={loading}
                loading={loading}/>
            </>
          )}
        </div>
      </div>
    </Box>
  )
})

ModalConfirm.propTypes = {
  loading: bool,
  message: any,
  description: string,
  onConfirm: func,
  noConfirmation: bool,
  dataTestId: string,
  onClose:func,
}

export default ModalConfirm
