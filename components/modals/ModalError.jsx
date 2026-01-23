import { useState} from 'react'
import Box from '@mui/material/Box'
import Button from '../buttons/Button'
import { useDispatch, useSelector } from 'react-redux'
import { modalError } from '@/store/actions/modal.action'
import { func } from 'prop-types'
import { dataNotAvailable } from '@/lib/helpers/emptyDataHandler'

const ModalError = (props) => {
  const {
    onClose
  } = props
  const [animation, setAnimation] = useState('animate__fadeInUp')
  const dispatch = useDispatch()
  const {isModalError:open, metaError:meta} = useSelector(state => state.modal)

  const closeModal = () => {
    setAnimation('animate__fadeOutDown')
    setTimeout(() => {
      setAnimation('animate__fadeInUp')
      dispatch(modalError(false, null))
    }, 500)
    if(typeof onClose == 'function'){
      onClose()
    }
  }

  let errorMessage;
  if (!meta) {
    errorMessage = 'Data Tidak Tersedia.';
  } else if (meta?.message === 'password_expired') {
    errorMessage = (
      <div className="text-[13px] text-[#757575]">
        Maaf, kata sandi yang anda gunakan telah kadaluarsa, silahkan perbaharui kata sandi anda terlebih dahulu!
      </div>
    );
  } else {
    let messageText = meta.message;
    if (messageText === 'Invalid file format') {
      messageText = 'Mohon periksa kembali format file yang anda unggah.';
    } else if (!messageText) {
      messageText = dataNotAvailable();
    }
    errorMessage = (
      <div className="text-[13px] text-[#757575]">
        {messageText}
        {meta?.vcc_code && (
          <span className='font-bold text-[#c92d2d]'>{`[${meta?.vcc_code}]`}</span>
        )}
      </div>
    );
  }

  return (
    <Box className={`animate__faster ${open?'block':'hidden'} bg-[#ff1d1d25] filter backdrop-blur-[4px] fixed left-0 right-0 top-0 bottom-0 z-[999]`}>
      <div className={`modal-box p-6 bg-[#ffffffb2] border-[13px] border-white rounded-lg max-w-md animate__animated ${animation} animate__faster absolute left-0 right-0 m-auto top-1/4`}>
        <div className="">
          <div className="text-center">
            <div className={`animate-pulse text-[#FB6E6E] text-[40px] font-semibold font-bebas-neue pb-2 mb-4 border-b border-dashed border-gray-200`}>
              Error!
            </div>
            <div className="text-[13px] !text-slate-300">
              {errorMessage}
            </div>
            <div className='mt-4'>
              <Button 
                dataTestId='CloseModal'
                label='Tutup'
                size='small'
                className={'m-auto !text-[#fff] !py-2 !px-6 !bg-[#d64545] hover:!bg-[#b03a3a] border border-gray-300'}
                onClick={closeModal}
              />
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}

ModalError.propTypes = {
  onClose: func
}

export default ModalError
