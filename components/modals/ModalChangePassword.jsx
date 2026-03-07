import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Button,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import TextInputField from '../fields/TextInputField'

function ModalChangePassword({ open, onClose, onSubmit, loading }) {
  const [values, setValues] = React.useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = React.useState({})
  const [showPassword, setShowPassword] = React.useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  React.useEffect(() => {
    if (!open) {
      setValues({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setErrors({})
      setShowPassword({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
      })
    }
  }, [open])

  const togglePasswordVisibility = (fieldName) => {
    setShowPassword((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }))
  }

  const handleChange = (name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validate = () => {
    const nextErrors = {}

    if (!values.oldPassword) nextErrors.oldPassword = 'Password lama wajib diisi'
    if (!values.newPassword) nextErrors.newPassword = 'Password baru wajib diisi'
    if (!values.confirmPassword) nextErrors.confirmPassword = 'Konfirmasi password wajib diisi'

    if (values.newPassword && values.newPassword.length < 6) {
      nextErrors.newPassword = 'Password baru minimal 6 karakter'
    }

    if (values.newPassword && values.confirmPassword && values.newPassword !== values.confirmPassword) {
      nextErrors.confirmPassword = 'Konfirmasi password tidak sama'
    }

    if (values.oldPassword && values.newPassword && values.oldPassword === values.newPassword) {
      nextErrors.newPassword = 'Password baru harus berbeda dari password lama'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    await onSubmit({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    })
  }

  const handleConfirmPasswordKeyUp = (event) => {
    if (event.key === 'Enter' && !loading) {
      handleSubmit()
    }
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Ubah Password</DialogTitle>
      <DialogContent>
        <Typography variant="body2" className="text-gray-500 mb-4">
          Isi password lama dan password baru Anda.
        </Typography>

        <div className="grid grid-cols-1 gap-4">
          <FormControl fullWidth>
            <TextInputField
              label="Password Lama"
              name="oldPassword"
              type={showPassword.oldPassword ? 'text' : 'password'}
              value={values.oldPassword}
              onChange={handleChange}
              error={errors.oldPassword}
              touched={Boolean(errors.oldPassword)}
              placeholder="Masukkan password lama"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle old password visibility"
                      onClick={() => togglePasswordVisibility('oldPassword')}
                      edge="end"
                      size="small"
                    >
                      {showPassword.oldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>

          <FormControl fullWidth>
            <TextInputField
              label="Password Baru"
              name="newPassword"
              type={showPassword.newPassword ? 'text' : 'password'}
              value={values.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              touched={Boolean(errors.newPassword)}
              placeholder="Masukkan password baru"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle new password visibility"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      edge="end"
                      size="small"
                    >
                      {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>

          <FormControl fullWidth>
            <TextInputField
              label="Konfirmasi Password"
              name="confirmPassword"
              type={showPassword.confirmPassword ? 'text' : 'password'}
              value={values.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              touched={Boolean(errors.confirmPassword)}
              placeholder="Ulangi password baru"
              size="small"
              onKeyUp={handleConfirmPasswordKeyUp}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      edge="end"
                      size="small"
                    >
                      {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        </div>
      </DialogContent>

      <DialogActions className="px-6 pb-4">
        <Button variant="text" color="inherit" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalChangePassword
