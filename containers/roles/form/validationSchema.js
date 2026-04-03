import * as Yup from 'yup'

export const rolesValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Nama role wajib diisi')
    .max(100, 'Nama role maksimal 100 karakter'),
  description: Yup.string()
    .trim()
    .required('Deskripsi wajib diisi')
    .max(255, 'Deskripsi maksimal 255 karakter'),
})
