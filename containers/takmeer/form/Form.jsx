import React, { use } from 'react'
import IconButton from '@mui/material/IconButton'
import { useRouter } from 'next/router'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import FormControl from '@mui/material/FormControl'
import TextInputField from '@/components/fields/TextInputField';
import Button from '@mui/material/Button'
import SelectRoles from '@/components/forms/SelectRoles';
import { extractSelect } from '@/lib/helpers/helper';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, updateUser } from '@/store/actions/user.action';

function Form({ isEdit = false }) {
  const router = useRouter();
  const { pid } = router.query;
  const dispatch = useDispatch();
  const { isLoadingCreate, detail } = useSelector((state) => state.user);
  const [generatedPassword, setGeneratedPassword] = React.useState('');

  const onSubmit = (values) => {
    const payload = {
      ...values,
      role: extractSelect(values.role, 'value'),
      password: generatedPassword,
    };
    if(isEdit){
      dispatch(updateUser({ id: pid, payload : payload}));
      return;
    }
    dispatch(createUser({payload : payload}));

  };
  const form = useFormik({
    initialValues: {
      name: '',
      phone: '',
      jabatan: '',
      username: '',
      role: '',
    },
    onSubmit: onSubmit,
  });

  React.useEffect(() => {
    if (isEdit && detail) {
      form.setValues({
        name: detail.name || '',
        phone: detail.phone || '',
        jabatan: detail.jabatan || '',
        username: detail.username || '',
        role: {label: detail.role.toUpperCase(), value: detail.role} || '',
      });
    }
  }, [isEdit, detail]);

  const handleGeneratePassword = () => {
    const newPassword = Math.random().toString(36).slice(-8);
    setGeneratedPassword(newPassword);
  };
  return (
    <div className="">
      <div className="flex items-center mb-6 gap-4">
        <IconButton aria-label="back" onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <div>
          <div className="text-2xl font-bold text-[#333]">Formulir Takmeer</div>
          <div className="text-[#666] tinos-regular">Lengkapi data takmeer dengan benar.</div>
        </div>
      </div>
      <form onSubmit={form.handleSubmit} className="grid grid-cols-2 gap-4">
        <FormControl fullWidth className=''>
          <TextInputField
            label="Nama Lengkap"
            name="name"
            value={form.values.name}
            onChange={(name, value) => form.setFieldValue(name, value)}
            placeholder="Masukkan nama lengkap"
            size={'small'}
          />            
        </FormControl>
        <FormControl fullWidth className=''>
          <TextInputField
            label="Nomor Telepon"
            name="phone"
            value={form.values.phone}
            onChange={(name, value) => form.setFieldValue(name, value)}
            placeholder="Masukkan nomor telepon"
            size={'small'}
          />            
        </FormControl>
        <FormControl fullWidth className='col-span-2'>
          <TextInputField
            label="Jabatan"
            name="jabatan"
            value={form.values.jabatan}
            onChange={(name, value) => form.setFieldValue(name, value)}
            placeholder="Tuliskan jabatan"
            size={'small'}
          />            
        </FormControl>
        <FormControl fullWidth className='col-span-2'>
          <SelectRoles
            label="Role"
            name="role"
            value={form.values.role}
            onChange={(name, value) => form.setFieldValue(name, value)}
            placeholder="Pilih role"
            size={'small'}
          />            
        </FormControl>
        <div className="p-6 rounded-xl border border-dashed border-gray-300 col-span-2 grid grid-cols-1 gap-4">
          <FormControl fullWidth className='mb-4'>
            <TextInputField
              label="Username"
              name="username"
              value={form.values.username}
              onChange={(name, value) => form.setFieldValue(name, value)}
              placeholder="Masukkan username"
              size={'small'}
            />            
          </FormControl>
          <div className="">
            <Button variant="contained" color="secondary" onClick={handleGeneratePassword}>
              Generate Password
            </Button>
            <div className="">
              <div className="mt-4 text-gray-700 mb-2">Kata Sandi: </div>
              <div className="font-mono font-bold text-lg p-2 bg-gray-100 rounded-md max-w-50 text-center">{generatedPassword || '—'}</div>
            </div>
          </div>
        </div>
        <div className="col-span-2 flex justify-end mt-4">
          <Button type="submit" variant="contained" color="primary" disabled={!generatedPassword || !form.isValid || isLoadingCreate} loading={isLoadingCreate}>
            Simpan Takmeer
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Form
