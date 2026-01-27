import { Button, FormControl, IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import TextAreaField from '@/components/fields/TextAreaField';
import SelectConsumer from '@/components/forms/SelectConsumer';
import SelectPaymentStatus from '@/components/forms/SelectPaymentStatus';
import { useSelector } from 'react-redux';
import TextInputField from '@/components/fields/TextInputField';
import DatePickerField from '@/components/fields/DatePickerField';

export function iconCollapse() {
  return(
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
    </svg>
  )
}

export function iconUnCollapse() {
  return(
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" />
    </svg>
  )
}

export function iconDelete() {
  return(
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}

function Form({ isEdit = false}) {
  const router = useRouter();
  const { isLoadingCreate } = useSelector((state) => state.pam);
  async function onSubmit(values) {
    // form submission logic here
  }
  const form = useFormik({
    initialValues: {
      // form initial values here
      pelangganId: '',
      paymentDate: '',
      previous_used: '',
      current_used: '',
      billAmount: '',
      paidAmount: '',
      status: '',
      notes: '',
    },
    onSubmit: async (values) => {
      // form submission logic here
      await onSubmit(values);
    },
  });
  React.useEffect(() => {
    form.resetForm();
  },[]);
  return (
    <div>
      <div className="flex items-center mb-6 gap-4">
        <IconButton aria-label="back" onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <div>
          <div className="text-[20px] font-bold text-[#333]">Formulir Biaya Rutinan PAM</div>
          <div className="text-[#666] text-[13px]">Lengkapi data biaya rutinan dengan benar.</div>
        </div>
      </div>
      <form onSubmit={form.handleSubmit} className="ml-auto">
        <div className="grid grid-cols-3 gap-4">
          <FormControl fullWidth className='col-span-3'>
            <SelectConsumer
              label="Pelanggan"
              name="pelangganId"
              value={form.values.pelangganId}
              onChange={(name,value) => form.setFieldValue('pelangganId', value)}
              size={'small'}
              placeholder={'Pilih Pelanggan'}
              disabled={isEdit}
            />
          </FormControl>
          <div className="p-6 rounded-xl border border-dashed border-gray-400 col-span-3">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-300">
              <div className="text-gray-500">Angsuran ke-1</div>
              <div className="flex gap-2">
                <IconButton aria-label="" className='text-red-500' onClick={()=> {}}>
                  {iconDelete()}
                </IconButton>
                <IconButton aria-label="" onClick={()=> {}}>
                  {iconCollapse()}
                </IconButton>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormControl fullWidth className=''>
                <DatePickerField
                  label="Tanggal Pembayaran"
                  name="paymentDate"
                  value={form.values.paymentDate}
                  onChange={(name,value) => form.setFieldValue('paymentDate', value)}
                  size={'small'}
                  row={3}
                />
              </FormControl>
              <FormControl fullWidth className=''>
                <TextInputField
                  label="Jumlah Yang Dibayar"
                  name="paidAmount"
                  value={form.values.paidAmount}
                  onChange={(name,value) => form.setFieldValue('paidAmount', value)}
                  size={'small'}
                  row={3}
                />
              </FormControl>
              <FormControl fullWidth className=''>
                <TextAreaField
                  label="Keterangan"
                  name="notes"
                  value={form.values.notes}
                  onChange={(name,value) => form.setFieldValue('notes', value)}
                  size={'small'}
                  row={3}
                />
              </FormControl>
            </div>
          </div>
          <div className="w-full flex justify-center mt-4 col-span-3">
            <Button
              variant="outlined"
              size="medium"
              onClick={() => {
                // add new installment logic here
              }}
            >
              Tambah Angsuran
            </Button>
          </div>
        </div>
        <div className="flex justify-end pt-6">
          <Button
            variant="contained"
            size="large"
            type="submit"
            color='primary'
            loading={isLoadingCreate}
            disabled={isLoadingCreate}
          >
            {isEdit ? 'Update Biaya Rutinan' : 'Simpan Biaya Rutinan'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Form