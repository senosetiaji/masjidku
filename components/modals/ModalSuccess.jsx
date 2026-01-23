import { useState} from 'react'
import Box from '@mui/material/Box'
import Button from '../buttons/Button'
import { useDispatch, useSelector } from 'react-redux'
import { modalSuccess } from '@/store/actions/modal.action'
import { func } from 'prop-types'
import { useRouter } from 'next/router'

const ModalSuccess = (props) => {
  const {
    onClose
  } = props
  const dispatch = useDispatch();
  const router = useRouter();
  const {isModalSuccess:open, metaSuccess:meta} = useSelector(state => state.modal)
  const [animation, setAnimation] = useState('animate__fadeInUp')
  const [backdropAnimation, setBackdropAnimation] = useState('animate__fadeIn')

  const closeModal = () => {
    setAnimation('animate__fadeOutDown')
    setBackdropAnimation('animate__fadeOut')
    dispatch(modalSuccess(false, null))
    setTimeout(() => {
      setBackdropAnimation('animate__fadeIn')
      setAnimation('animate__fadeInUp')
    }, 500)

    if(typeof onClose == 'function'){
      onClose()
    }
  }

  const handleClose = () => {
    if(typeof onClose == 'function'){
      onClose()
    } else if(meta?.backLink) {
      router.push(meta?.backLink)
      closeModal()
    } else {
      closeModal()
    }
  }

  return (
    <Box className={`fixed left-0 right-0 top-0 bottom-0 ${open?'block':'hidden'} animate__animated ${backdropAnimation} animate__faster bg-[#25ad1931] filter backdrop-blur-[4px] z-[999]`}>
      <div className={`absolute left-0 right-0 m-auto top-1/4 animate__animated ${animation} animate__faster modal-box pb-4 bg-[#ffffffcb] backdrop-blur-lg border-[12px] list-inside border-white rounded-lg max-w-md shadow-md`}>
        <div className="rounded-lg p-4">
          <div className="text-center">
            <div className={` animate-pulse text-[#0FA958] title text-[40px] font-semibold font-bebas-neue pb-2 mb-4 border-b border-dashed border-gray-200`}>
              Success!
            </div>
            <div className="text-[12px] text-slate-600">
              {meta?.message || 'Data telah berhasil disimpan.'}
            </div>
            <div className='mt-4'>
              <Button 
                label={'Ok'}
                size='sm'
                onClick={() => handleClose()}
                className={'m-auto !text-[#fff] !py-2 !px-6 !bg-[#458d60] hover:!bg-[#387951] border border-gray-300'}
              />
            </div>
          </div>
        </div>
      </div>
    </Box>
  )
}

ModalSuccess.propTypes = {
  onClose: func
}

export default ModalSuccess
