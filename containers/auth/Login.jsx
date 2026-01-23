import { useFormik } from 'formik'
import React from 'react'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import FormHelperText from '@mui/material/FormHelperText'
import TextInputField from '@/components/fields/TextInputField'
import { useDispatch } from 'react-redux'
import { loginUser } from '@/store/actions/auth.action'

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
    <div>
      <div className="p-6 rounded-xl shadow-lg bg-white max-w-md mx-auto mt-20">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <FormControl fullWidth>
          <TextInputField
            label="Email"
            name="email"
            type="email"
            value={form.values.email}
            onChange={(name, value) => form.setFieldValue(name, value)}
            onBlur={form.handleBlur}
            margin="normal"
          />
          <TextInputField
            label="Password"
            name="password"
            type="password"
            value={form.values.password}
            onChange={(name, value) => form.setFieldValue(name, value)}
            onBlur={form.handleBlur}
            margin="normal"
          />
          <FormHelperText>
            <button
              onClick={form.handleSubmit}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              type="button"
            >
              Login
            </button>
          </FormHelperText>
        </FormControl>
      </div>
    </div>
  )
}

export default Login