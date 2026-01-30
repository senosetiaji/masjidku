import { useFormik } from 'formik'
import React from 'react'
import FormControl from '@mui/material/FormControl'
import TextInputField from '@/components/fields/TextInputField'
import TextAreaField from '@/components/fields/TextAreaField'
import Button from '@mui/material/Button'
import { useDispatch, useSelector } from 'react-redux'
import { createPelanggan, updateDataPelanggan } from '@/store/actions/master.action'

function Form({ isEdit = false }) {
  const dispatch = useDispatch();
  const { pelanggan } = useSelector(state => state.master);
  const { detail } = pelanggan;
  const onSubmit = (values) => {
    const payload = {
      ...values
    }
    if (isEdit) {
      // Dispatch update action
      dispatch(updateDataPelanggan({ id: detail.id, payload: payload }));
    } else {
      // Dispatch create action
      dispatch(createPelanggan({ payload: payload }));
    }
  }
  const form = useFormik({
    initialValues: {
      // Define your form fields here
      name: '',
      address: '',
      phone: '',
      installationBill: '',
    },
    onSubmit: (values) => {
      // Handle form submission
      onSubmit(values);
    },
  })

  React.useEffect(() => {
    if (isEdit && detail) {
      form.setValues({
        name: detail.name || '',
        address: detail.address || '',
        phone: detail.phone || '',
        installationBill: detail.installationBill || 0,
      });
    }
  }, [isEdit, detail]); 
  return (
    <div className="">
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <FormControl fullWidth>
          <TextInputField
            size={'small'}
            label="Name"
            name="name"
            value={form.values.name}
            onChange={(name, value) => form.setFieldValue(name, value)}
            error={form.touched.name && Boolean(form.errors.name)}
            helperText={form.touched.name && form.errors.name}
            placeholder={'Tuliskan Nama Pengguna'}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextInputField
            size={'small'}
            label="Phone"
            name="phone"
            value={form.values.phone}
            onChange={(name, value) => form.setFieldValue(name, value)}
            error={form.touched.phone && Boolean(form.errors.phone)}
            helperText={form.touched.phone && form.errors.phone}
            placeholder={'Tuliskan Nomor Telepon'}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextInputField
            size={'small'}
            label="Installation Bill"
            name="installationBill"
            value={form.values.installationBill}
            onChange={(name, value) => form.setFieldValue(name, value)}
            error={form.touched.installationBill && Boolean(form.errors.installationBill)}
            helperText={form.touched.installationBill && form.errors.installationBill}
            placeholder={'Tuliskan Jumlah Tagihan Instalasi'}
          />
        </FormControl>
        <FormControl fullWidth className='col-span-3'>
          <TextAreaField
            size={'small'}
            row={3}
            label="Address"
            name="address"
            value={form.values.address}
            onChange={(name, value) => form.setFieldValue(name, value)}
            error={form.touched.address && Boolean(form.errors.address)}
            helperText={form.touched.address && form.errors.address}
            placeholder={'Tuliskan Alamat'}
          />
        </FormControl>
      </div>
      <div className="flex justify-end gap-4 mt-4">
        <Button variant="text" color="default">
          Batal
        </Button>
        <Button variant="contained" color="primary" className='ml-2' onClick={form.handleSubmit}>
          Simpan Data
        </Button>
      </div>
    </div>
  )
}

export default Form
