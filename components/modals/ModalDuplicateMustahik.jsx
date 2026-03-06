import React, { useEffect, useImperativeHandle, useState, forwardRef } from 'react'
import Box from '@mui/material/Box'
import Button from '../buttons/Button'
import SelectYear from '../forms/SelectYear'

const ModalDuplicateMustahik = forwardRef(({ onSubmit, loading }, ref) => {
  const [open, setOpen] = useState(false)
  const [animation, setAnimation] = useState('animate__fadeInUp')
  const [backdropAnimation, setBackdropAnimation] = useState('animate__fadeIn')
  const [form, setForm] = useState({ fromYear: null, toYear: null })
  const [error, setError] = useState('')

  const resetState = () => {
    setForm({ fromYear: null, toYear: null })
    setError('')
  }

  const openModal = () => {
    setOpen(true)
  }

  const closeModal = () => {
    setAnimation('animate__fadeOutDown')
    setBackdropAnimation('animate__fadeOut')
    setTimeout(() => {
      setOpen(false)
      setAnimation('animate__fadeInUp')
      setBackdropAnimation('animate__fadeIn')
      resetState()
    }, 300)
  }

  useImperativeHandle(ref, () => ({
    open: openModal,
    close: closeModal,
  }))

  useEffect(() => {
    if (!loading && open) {
      // do not auto-close here to allow user to see errors from API modal
    }
  }, [loading, open])

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = () => {
    const fromVal = form.fromYear?.value
    const toVal = form.toYear?.value

    if (!fromVal || !toVal) {
      setError('Silakan pilih tahun asal dan tahun tujuan.')
      return
    }
    if (fromVal === toVal) {
      setError('Tahun asal dan tujuan tidak boleh sama.')
      return
    }

    if (typeof onSubmit === 'function') {
      onSubmit({ fromYear: fromVal, toYear: toVal, onSuccess: closeModal })
    }
  }

  return (
    <Box className={`${open ? 'block' : 'hidden'} animate__animated ${backdropAnimation} animate__faster bg-[#dfab003f] filter backdrop-blur-[4px] fixed left-0 right-0 top-0 bottom-0 !z-[99]`}>
      <div className={`w-fit rounded-xl bg-[#ffffffc2] border-[13px] border-white absolute top-0 bottom-0 left-0 right-0 m-auto h-fit animate__animated animate__faster shadow-lg min-w-[320px] max-w-[90%] md:max-w-[420px] lg:max-w-[500px] p-6 ${animation}`}>
        <div className="text-[#f1cd00ea] title text-[28px] text-center font-semibold font-bebas-neue">
          Duplikasi Mustahik
        </div>
        <div className="text-center text-gray-500 mt-1 text-[14px]">
          Salin seluruh data mustahik dari tahun asal ke tahun tujuan.
        </div>

        <div className="grid grid-cols-1 gap-4 mt-6">
          <div>
            <SelectYear
              label="Tahun Asal"
              placeholder="Pilih tahun asal"
              name="fromYear"
              value={form.fromYear}
              onChange={handleChange}
              size={'small'}
            />
          </div>
          <div>
            <SelectYear
              label="Tahun Tujuan"
              placeholder="Pilih tahun tujuan"
              name="toYear"
              value={form.toYear}
              onChange={handleChange}
              size={'small'}
            />
          </div>
          {error ? <div className="text-red-500 text-sm text-center">{error}</div> : null}
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            className={'!bg-transparent hover:!bg-gray-300 !text-[#747474] border !border-transparent hover:!border-gray-300'}
            variant="outlined"
            label="Batal"
            size={'small'}
            disabled={loading}
            loading={false}
            onClick={closeModal}
          />
          <Button
            className={'!bg-yellow-400 hover:!bg-yellow-700 !text-white'}
            label="Duplikasi"
            size={'small'}
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
          />
        </div>
      </div>
    </Box>
  )
})

ModalDuplicateMustahik.displayName = 'ModalDuplicateMustahik'

export default ModalDuplicateMustahik
