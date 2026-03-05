import DatePickerField from '@/components/fields/DatePickerField';
import TextAreaField from '@/components/fields/TextAreaField';
import TextInputField from '@/components/fields/TextInputField';
import SelectZakat from '@/components/forms/SelectZakat';
import SelectZakatType from '@/components/forms/SelectZakatType';
import { Button, Divider, FormControl } from '@mui/material'
import { useFormik } from 'formik';
import React from 'react'

function Form() {
  const formik = useFormik({
    initialValues: {
      name: '',
      date: '',
      type: '',
      zakatType: '',
      amount: '',
      description: '',
    },
    onSubmit: (values) => {
      console.log("Form values:", values);
    },
  });
  return (
    <div className='p-8 rounded-xl shadow-sm grid grid-cols-2 gap-6'>
      <FormControl fullWidth>
        <DatePickerField
          label="Tanggal Zakat"
          name="date"
          value={formik.values.date}
          onChange={(name, value) => formik.setFieldValue('date', value)}
          onBlur={formik.handleBlur}
          error={formik.touched.date && Boolean(formik.errors.date)}
          helperText={formik.touched.date && formik.errors.date}
          size={'small'}
          placeholder={'Pilih Tanggal Zakat'}
        />
      </FormControl>
      <FormControl fullWidth>
        <SelectZakatType
          label="Zakat"
          name="zakatType"
          value={formik.values.zakatType}
          onChange={(name, value) => formik.setFieldValue('zakatType', value)}
          onBlur={formik.handleBlur}
          error={formik.touched.zakatType && Boolean(formik.errors.zakatType)}
          helperText={formik.touched.zakatType && formik.errors.zakatType}
          size={'small'}
          placeholder={'Pilih Jenis Zakat'}
        />
      </FormControl>
      <div className="p-8 rounded-xl border border-dashed border-gray-300 col-span-2 grid grid-cols-2 gap-6">
        <div className="col-span-2">
          <div className="text-6">Data Zakat</div>
          <div className='text-[13px] text-gray-400'>Lengkapi data berikut untuk membuat Zakat baru.</div>
        </div>
        <Divider className='col-span-2' />
        <FormControl fullWidth>
          <TextInputField
            label="Nama Muzzaki/Pemberi Zakat"
            name="name"
            value={formik.values.name}
            onChange={(name, value) => formik.setFieldValue('name', value)}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            size={'small'}
            placeholder={'Tuliskan Nama Muzzaki/Pemberi Zakat'}
          />
        </FormControl>
        <FormControl fullWidth>
          <SelectZakat
            label="Jenis Zakat"
            name="type"
            value={formik.values.type}
            onChange={(name, value) => formik.setFieldValue('type', value)}
            onBlur={formik.handleBlur}
            error={formik.touched.type && Boolean(formik.errors.type)}
            helperText={formik.touched.type && formik.errors.type}
            size={'small'}
            placeholder={'Pilih Jenis Zakat'}
          />
        </FormControl>
        <FormControl fullWidth className='col-span-2'>
          <TextInputField
            label="Jumlah Zakat"
            name="amount"
            value={formik.values.amount}
            onChange={(name, value) => formik.setFieldValue('amount', value)}
            onBlur={formik.handleBlur}
            error={formik.touched.amount && Boolean(formik.errors.amount)}
            helperText={formik.touched.amount && formik.errors.amount}
            size={'small'}
            placeholder={'Tuliskan Jumlah Zakat'}
          />
        </FormControl>
        <FormControl fullWidth className='col-span-2'>
          <TextAreaField
            label="Keterangan"
            name="description"
            value={formik.values.description}
            onChange={(name, value) => formik.setFieldValue('description', value)}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            size={'small'}
            placeholder={'Tuliskan Keterangan (opsional)'}
          />
        </FormControl>
      </div>
      <Button type="submit" variant="contained" color="primary" onClick={formik.handleSubmit} className='col-span-2 self-end'>
        Simpan Zakat
      </Button>
    </div>
  )
}

export default Form
