import React, { forwardRef, useImperativeHandle, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '../buttons/Button'

const ModalPreviewImage = forwardRef((props, ref) => {
  const { title = 'Preview Bukti', emptyMessage = 'Gambar tidak tersedia.' } = props;

  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [animation, setAnimation] = useState('animate__fadeInUp')
  const [backdropAnimation, setBackdropAnimation] = useState('animate__fadeIn')

  const openModal = (url) => {
    setImageUrl(url || '')
    setOpen(true)
  }

  const closeModal = () => {
    setAnimation('animate__fadeOutDown')
    setBackdropAnimation('animate__fadeOut')
    setTimeout(() => {
      setBackdropAnimation('animate__fadeIn')
      setAnimation('animate__fadeInUp')
      setOpen(false)
      setImageUrl('')
    }, 350)
  }

  useImperativeHandle(ref, () => ({
    open: (url) => openModal(url),
    close: () => closeModal(),
  }))

  return (
    <Box className={`${open ? 'block' : 'hidden'} animate__animated ${backdropAnimation} animate__faster bg-[#dfab003f] filter backdrop-blur-xs fixed left-0 right-0 top-0 bottom-0 z-99!`}>
      <div className={`w-fit rounded-xl bg-[#ffffffc2] border-13 border-white absolute top-0 bottom-0 left-0 right-0 m-auto h-fit animate__animated animate__faster shadow-lg min-w-[320px] max-w-[95%] md:max-w-175 2xl:max-w-225 p-4 ${animation}`}>
        <div className="text-[#333] title text-[20px] text-center font-semibold">
          {title}
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Preview Bukti"
              className="w-full h-auto max-h-[70vh] object-contain rounded"
            />
          ) : (
            <div className="text-center text-gray-500 text-sm py-10">{emptyMessage}</div>
          )}
        </div>

        <div className="flex items-center justify-center mt-5">
          <Button
            className={'bg-transparent! hover:bg-gray-300! text-[#747474]! border border-transparent! hover:border-gray-300!'}
            variant="outlined"
            label="Tutup"
            size={'small'}
            onClick={closeModal}
          />
        </div>
      </div>
    </Box>
  )
})

export default ModalPreviewImage
