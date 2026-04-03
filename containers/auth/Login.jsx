import { useFormik } from 'formik'
import React from 'react'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import FormHelperText from '@mui/material/FormHelperText'
import TextInputField from '@/components/fields/TextInputField'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '@/store/actions/auth.action'
import Button from '@mui/material/Button'
import { Divider, IconButton, InputAdornment } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import ModalError from '@/components/modals/ModalError'
import { useRouter } from 'next/router'

function Login() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginTitle, setLoginTitle] = React.useState('Masjid.ku');
  const { isLoading } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const isSingleTenant = String(process.env.NEXT_PUBLIC_DISABLE_MULTI_TENANT || '').toLowerCase() === 'true';
    if (isSingleTenant) {
      setLoginTitle('Masjid.ku');
      return;
    }

    const host = (window.location.hostname || '').toLowerCase();
    const reserved = new Set(['www', 'api', 'localhost']);
    const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);

    if (!host || host === 'localhost' || isIpv4) {
      return;
    }

    const parts = host.split('.').filter(Boolean);
    const subdomain = parts.length >= 3 ? parts[0] : '';

    if (!subdomain || reserved.has(subdomain)) {
      return;
    }

    const normalized = subdomain
      .split(/[-_]/g)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    if (normalized) {
      setLoginTitle(normalized);
    }
  }, []);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const handleSubmit = async (e) => {
    const payload = {
      username: e.username,
      password: e.password,
    }
    const res = await dispatch(loginUser({payload: payload}));
    console.log('login response:', res);
    if (res.meta.requestStatus === "fulfilled") { 
      router.push('/dashboard');
    }
  }
  const form = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    onSubmit: (values) => {
      handleSubmit(values);
    },
  })
  return (
    <div className='h-screen flex items-center justify-center landing-page'>
      <div className="p-6 rounded-xl max-w-md w-full">
        <h2 className="text-[20px] font-bold mb-2 text-center text-gray-600">{loginTitle}</h2>
        <p className='text-sm text-center text-gray-400 mb-4'>Welcome back! Please login to your account.</p>
        <div className="grid grid-cols-1 gap-4">
          <FormControl fullWidth>
            <TextInputField
              label="Username"
              name="username"
              type="text"
              value={form.values.username}
              onChange={(name, value) => form.setFieldValue(name, value)}
              onBlur={form.handleBlur}
              margin="normal"
              fontSize="13px"
            />
          </FormControl>
          <FormControl fullWidth>
            <TextInputField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.values.password}
              onChange={(name, value) => form.setFieldValue(name, value)}
              onBlur={form.handleBlur}
              margin="normal"
              fontSize="13px"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={toggleShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </FormControl>
          <Divider />
          <FormHelperText>
            <Button variant="contained" className='w-full' color="primary" size='large' onClick={form.handleSubmit} disabled={isLoading} loading={isLoading}>
              Login
            </Button>
          </FormHelperText>
        </div>
      </div>
      <ModalError />
    </div>
  )
}

export default Login