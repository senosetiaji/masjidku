import { Button, FormControl, IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import DatePickerField from '@/components/fields/DatePickerField';
import NumericInputField from '@/components/fields/NumericInputField';
import TextInputField from '@/components/fields/TextInputField';
import TextAreaField from '@/components/fields/TextAreaField';
import SelectConsumer from '@/components/forms/SelectConsumer';

function Form({ isEdit = false}) {
  const router = useRouter();
  const form = useFormik({
    initialValues: {
      // form initial values here
      consumer: '',
      date: '',
      previous_month: '',
      current_month: '',
      amount: '',
      description: '',
    },
    onSubmit: async (values) => {
      // form submission logic here
    },
  });
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
              name="consumer"
              value={form.values.consumer}
              onChange={(name,value) => form.setFieldValue('consumer', value)}
              size={'small'}
              placeholder={'Pilih Pelanggan'}
            />
          </FormControl>
          <FormControl fullWidth className='col-span-3'>
            <DatePickerField
              label="Tanggal"
              name="date"
              value={form.values.date}
              size={'small'}
              onChange={(name,value) => form.setFieldValue('date', value)}
            />
          </FormControl>
          <div className="col-span-3 p-4 bg-[#f9f9f9] rounded-lg border border-dashed border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <FormControl fullWidth>
                <NumericInputField
                  label="Bulan Ini"
                  name="current_month"
                  value={form.values.current_month}
                  onChange={(name,value) => form.setFieldValue('current_month', value)}
                  size={'small'}
                  placeholder={'Masukkan penggunaan bulan ini'}
                />
              </FormControl>
              <FormControl fullWidth>
                <NumericInputField
                  label="Bulan Sebelumnya"
                  name="previous_month"
                  value={form.values.previous_month}
                  onChange={(name,value) => form.setFieldValue('previous_month', value)}
                  size={'small'}
                  disabled
                />
              </FormControl>
              <FormControl fullWidth>
                <NumericInputField
                  label="Total Biaya (Rp)"
                  name="amount"
                  value={form.values.amount}
                  onChange={(name,value) => form.setFieldValue('amount', value)}
                  size={'small'}
                  disabled={true}
                />
              </FormControl>
              <div className="col-span-3 flex justify-end mt-2">
                <Button
                  variant="contained"
                  size="medium"
                  onClick={form.submitForm}
                  className='bg-yellow-500!'
                >
                  Hitung Total Biaya
                </Button>
              </div>
            </div>
          </div>
          <FormControl fullWidth className='col-span-3'>
            <TextAreaField
              label="Keterangan"
              name="description"
              value={form.values.description}
              onChange={(name,value) => form.setFieldValue('description', value)}
              size={'small'}
              row={3}
            />
          </FormControl>
        </div>
        <div className="flex justify-end pt-6">
          <Button
            variant="contained"
            size="large"
            type="submit"
            color='primary'
          >
            {isEdit ? 'Update Biaya Rutinan' : 'Simpan Biaya Rutinan'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Form