import TextAreaField from '@/components/fields/TextAreaField'
import TextInputField from '@/components/fields/TextInputField'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import { useFormik } from 'formik'
import React from 'react'
import { rolesValidationSchema } from './validationSchema'

function Form({ isEdit = false, detail = null, isLoading = false, onSubmit, onCancel }) {
  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: detail?.name || '',
      description: detail?.description || '',
    },
    validationSchema: rolesValidationSchema,
    onSubmit: (values) => {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
      }

      if (typeof onSubmit === 'function') {
        onSubmit(payload)
      }
    },
  })

  return (
    <div>
      <form onSubmit={form.handleSubmit} className='grid grid-cols-1 gap-4'>
        <FormControl fullWidth>
          <TextInputField
            label='Nama Role'
            name='name'
            value={form.values.name}
            onChange={(name, value) => form.setFieldValue(name, value)}
            touched={form.touched.name}
            error={form.errors.name}
            placeholder='Masukkan nama role'
            size='small'
          />
        </FormControl>

        <FormControl fullWidth>
          <TextAreaField
            label='Deskripsi'
            name='description'
            value={form.values.description}
            onChange={(name, value) => form.setFieldValue(name, value)}
            touched={form.touched.description}
            error={form.errors.description}
            placeholder='Masukkan deskripsi role'
            size='small'
            row={4}
          />
        </FormControl>
      </form>

      <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-4'>
        <Button
          variant='text'
          color='inherit'
          className='w-full sm:w-auto'
          onClick={() => {
            if (typeof onCancel === 'function') {
              onCancel()
            }
          }}
        >
          Batal
        </Button>
        <Button
          variant='contained'
          color='primary'
          className='w-full sm:w-auto'
          disabled={isLoading}
          onClick={form.handleSubmit}
        >
          {isEdit ? 'Simpan Perubahan' : 'Simpan Role'}
        </Button>
      </div>
    </div>
  )
}

export default Form