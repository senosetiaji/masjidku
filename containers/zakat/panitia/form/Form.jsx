import SelectField from '@/components/fields/SelectField'
import TextInputField from '@/components/fields/TextInputField'
import SelectYear from '@/components/forms/SelectYear'
import { extractValue } from '@/lib/helpers/helper'
import { createPanitiaZakat, updatePanitiaZakat } from '@/store/actions/panitiaZakat.action'
import { Button, FormControl } from '@mui/material'
import { useFormik } from 'formik'
import { useRouter } from 'next/router'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

const roleOptions = [
  { label: 'Ketua', value: 'ketua' },
  { label: 'Bendahara', value: 'bendahara' },
  { label: 'Amil', value: 'amil' },
]

function Form({ isEdit = false }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { pid } = router.query;
  const { isLoadingCreate, detail } = useSelector((state) => state.panitiaZakat);

  const onSubmit = (values) => {
    const serviceYear = extractValue(values.serviceYear, 'value')
    const payload = {
      ...values,
      role: extractValue(values.role, 'value'),
      serviceYear: Number(serviceYear),
    }

    if (isEdit) {
      dispatch(updatePanitiaZakat({ id: pid, payload }))
      return;
    }
    dispatch(createPanitiaZakat({ payload }))
  }

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      serviceYear: '',
      role: '',
    },
    onSubmit,
  });

  React.useEffect(() => {
    if (isEdit && detail) {
      formik.setValues({
        name: detail.name || '',
        phone: detail.phone || '',
        serviceYear: detail.serviceYear !== undefined && detail.serviceYear !== null
          ? { label: String(detail.serviceYear), value: String(detail.serviceYear) }
          : '',
        role: detail.role ? roleOptions.find((item) => item.value === detail.role) || '' : '',
      })
    }
  }, [isEdit, detail])

  return (
    <form onSubmit={formik.handleSubmit} className='grid grid-cols-2 gap-4'>
      <FormControl fullWidth className='col-span-2'>
        <TextInputField
          label='Nama Panitia'
          name='name'
          value={formik.values.name}
          onChange={(name, value) => formik.setFieldValue(name, value)}
          placeholder='Masukkan nama panitia'
          size={'small'}
        />
      </FormControl>

      <FormControl fullWidth>
        <TextInputField
          label='Nomor Telepon'
          name='phone'
          value={formik.values.phone}
          onChange={(name, value) => formik.setFieldValue(name, value)}
          placeholder='Masukkan nomor telepon'
          size={'small'}
        />
      </FormControl>

      <FormControl fullWidth>
        <SelectField
          label='Peran'
          name='role'
          value={formik.values.role}
          onChange={(name, value) => formik.setFieldValue(name, value)}
          options={roleOptions}
          placeholder='Pilih peran'
          size={'small'}
        />
      </FormControl>

      <FormControl fullWidth className='col-span-2'>
        <SelectYear
          label='Masa Kerja (Tahun)'
          name='serviceYear'
          value={formik.values.serviceYear}
          onChange={(name, value) => formik.setFieldValue(name, value)}
          placeholder='Pilih jumlah tahun masa kerja'
          size={'small'}
        />
      </FormControl>

      <div className='col-span-2 flex justify-end mt-4'>
        <Button type='submit' variant='contained' color='primary' disabled={isLoadingCreate}>
          {isEdit ? 'Simpan Perubahan' : 'Simpan Panitia'}
        </Button>
      </div>
    </form>
  )
}

export default Form
