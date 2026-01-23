import { useFormik } from 'formik'
import React from 'react'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import FormHelperText from '@mui/material/FormHelperText'
import TextInputField from '@/components/fields/TextInputField'
import { useDispatch } from 'react-redux'
import { loginUser } from '@/store/actions/auth.action'
import Button from '@mui/material/Button'
import { Divider } from '@mui/material'

function Login() {
  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    const payload = {
      username: e.email,
      password: e.password,
    }
    dispatch(loginUser({payload: payload}));
  }
  const form = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: (values) => {
      handleSubmit(values);
    },
  })
  return (
    <div className='h-screen flex items-center justify-center'>
      <div className="p-6 rounded-xl bg-white max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-600">Masjid.ku</h2>
        <p className='text-sm text-center text-gray-400 mb-4'>Welcome back! Please login to your account.</p>
        <div className="grid grid-cols-1 gap-4">
          <FormControl fullWidth>
            <TextInputField
              label="Email"
              name="email"
              type="email"
              value={form.values.email}
              onChange={(name, value) => form.setFieldValue(name, value)}
              onBlur={form.handleBlur}
              margin="normal"
              fontSize="14px"
            />
          </FormControl>
          <FormControl fullWidth>
            <TextInputField
              label="Password"
              name="password"
              type="password"
              value={form.values.password}
              onChange={(name, value) => form.setFieldValue(name, value)}
              onBlur={form.handleBlur}
              margin="normal"
              fontSize="14px"
            />
          </FormControl>
          <Divider />
          <FormHelperText>
            <Button variant="contained" className='w-full' color="primary" size='large' onClick={form.handleSubmit}>
              Login
            </Button>
          </FormHelperText>
        </div>
      </div>
    </div>
  )
}

export default Login