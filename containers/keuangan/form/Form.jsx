import React from 'react'
import { useFormik } from 'formik'
import IconButton from '@mui/material/IconButton'
import MuiButton from '@mui/material/Button'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import DatePickerField from '@/components/fields/DatePickerField'
import NumericInputField from '@/components/fields/NumericInputField'
import TextInputField from '@/components/fields/TextInputField'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import { useDispatch, useSelector } from 'react-redux'
import { createFinance, updateDataFinance } from '@/store/actions/finance.action'
import { FormControl } from '@mui/material'
import moment from 'moment'
import SelectTipeKeuangan from '@/components/forms/SelectTipeKeuangan'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const typeOptions = [
  { label: 'Pemasukan', value: 'income' },
  { label: 'Pengeluaran', value: 'expense' },
]

const createEmptyEntry = () => ({
  date: new Date().toISOString().slice(0, 10),
  nominal: '',
  type: typeOptions[0],
  description: '',
  photoDataUrl: '',
  photoPreviewUrl: '',
  photoFileName: '',
  removePhoto: false,
})

function Form({ isEdit = false }) {
  const router = useRouter();
  const { pid } = router.query;
  const dispatch = useDispatch();
  const { detail } = useSelector(state => state.finance);
  const fileInputRefs = React.useRef({});
  const [photoErrors, setPhotoErrors] = React.useState({});
  const [isProcessingPhoto, setIsProcessingPhoto] = React.useState({});

  const convertFileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  
  function onSubmit(values) {
    const payload = {
      data: values.data.map((item) => ({
        date: item.date,
        amount: Number(item.nominal.toString().replace(/[^0-9,-]+/g, '').replace(',', '.')),
        type: item.type.value,
        description: item.description,
        photoDataUrl: item.photoDataUrl || undefined,
        removePhoto: !!item.removePhoto,
      })),
    }
    // Example dispatch call
    // dispatch(saveFinanceData(payload));
    if(isEdit) {
      // dispatch update action here
      dispatch(updateDataFinance({id: pid, payload: payload.data}));
      return;
    }
    dispatch(createFinance({payload: payload.data}));
  }

  const form = useFormik({
    initialValues: {
      data: [createEmptyEntry()],
    },
    onSubmit: (values) => {
      // Hook this up to API/dispatch when ready
      onSubmit(values)
    },
  })

  React.useEffect(() => {
    if (isEdit && detail) {
      form.setValues({
        data: [{
          date: moment(detail.date).format('YYYY-MM-DD'),
          nominal: detail.amount,
          type: typeOptions.find(opt => opt.value === detail.type) || typeOptions[0],
          description: detail.description,
          photoDataUrl: '',
          photoPreviewUrl: detail.photoUrl || '',
          photoFileName: '',
          removePhoto: false,
        }]
      });
    }
  }, [isEdit, detail])

  const handleSelectPhoto = async (event, index) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      setPhotoErrors((prev) => ({ ...prev, [index]: 'Format foto harus JPG, PNG, atau WEBP.' }));
      return;
    }

    if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
      setPhotoErrors((prev) => ({ ...prev, [index]: 'Ukuran foto maksimal 5MB.' }));
      return;
    }

    setIsProcessingPhoto((prev) => ({ ...prev, [index]: true }));
    setPhotoErrors((prev) => ({ ...prev, [index]: '' }));

    try {
      const dataUrl = await convertFileToDataUrl(selectedFile);
      form.setFieldValue(`data[${index}].photoDataUrl`, dataUrl);
      form.setFieldValue(`data[${index}].photoPreviewUrl`, dataUrl);
      form.setFieldValue(`data[${index}].photoFileName`, selectedFile.name);
      form.setFieldValue(`data[${index}].removePhoto`, false);
    } catch (error) {
      setPhotoErrors((prev) => ({ ...prev, [index]: 'Gagal memproses foto. Silakan coba lagi.' }));
    } finally {
      setIsProcessingPhoto((prev) => ({ ...prev, [index]: false }));
      if (event.target) {
        event.target.value = '';
      }
    }
  }

  const handleRemovePhoto = (index) => {
    form.setFieldValue(`data[${index}].photoDataUrl`, '');
    form.setFieldValue(`data[${index}].photoPreviewUrl`, '');
    form.setFieldValue(`data[${index}].photoFileName`, '');
    form.setFieldValue(`data[${index}].removePhoto`, true);
    setPhotoErrors((prev) => ({ ...prev, [index]: '' }));
  }

  const handleFieldChange = (name, value) => {
    form.setFieldValue(name, value)
  }

  const handleAddEntry = () => {
    form.setFieldValue('data', [...form.values.data, createEmptyEntry()])
  }

  const handleRemoveEntry = (index) => {
    const next = form.values.data.filter((_, idx) => idx !== index)
    form.setFieldValue('data', next.length ? next : [createEmptyEntry()])
  }

  return (
    <div className="">
      <div className="flex items-center mb-6 gap-4">
        <IconButton aria-label="back" onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <div>
          <div className="text-[20px] font-bold text-[#333]">Formulir Keuangan</div>
          <div className="text-[#666] text-[13px]">Lengkapi data keuangan dengan benar.</div>
        </div>
      </div>
      <form onSubmit={form.handleSubmit} className="space-y-6">
        {form.values.data.map((item, idx) => (
          <div
            key={idx}
            className="relative rounded-xl border border-dashed border-gray-200 bg-[#fbfbfb] p-6 shadow-sm flex flex-col gap-4 w-full md:flex-row"
          >
            <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              <FormControl fullWidth>
                <DatePickerField
                  label="Tanggal"
                  name={`data[${idx}].date`}
                  value={item.date}
                  onChange={handleFieldChange}
                  size="medium"
                  labelfontsize="13px"
                  fontSize="13px"
                  labelMb="6px"
                />
              </FormControl>
              <FormControl fullWidth>
                <NumericInputField
                  label="Nominal"
                  name={`data[${idx}].nominal`}
                  value={item.nominal}
                  onChange={handleFieldChange}
                  placeholder="Rp."
                  prefix="Rp. "
                  thousandSeparator="."
                  decimalSeparator="," 
                  size="small"
                  labelfontsize="13px"
                  fontSize="13px"
                  labelMb="6px"
                />
              </FormControl>
              <FormControl fullWidth>
                <SelectTipeKeuangan
                  label="Jenis"
                  name={`data[${idx}].type`}
                  placeholder="Pilih jenis"
                  value={item.type}
                  onChange={handleFieldChange}
                  size="small"
                  labelfontsize="13px"
                  fontSize="13px"
                  labelMb="6px"
                />
              </FormControl>
              <FormControl fullWidth className="md:col-span-2 lg:col-span-3">
                <TextInputField
                  label="Keterangan"
                  name={`data[${idx}].description`}
                  value={item.description}
                  onChange={handleFieldChange}
                  placeholder="Tuliskan keterangan"
                  size="small"
                  labelfontsize="13px"
                  fontSize="13px"
                  labelMb="6px"
                />
              </FormControl>
              <FormControl fullWidth className="md:col-span-2 lg:col-span-3">
                <div className="text-[#4F4F4F] font-medium mb-2 text-[13px]">Foto Bukti Kwitansi (Opsional)</div>
                <div className="flex flex-col gap-3">
                  <input
                    ref={(el) => {
                      fileInputRefs.current[idx] = el;
                    }}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => handleSelectPhoto(event, idx)}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => fileInputRefs.current[idx]?.click()}
                      disabled={!!isProcessingPhoto[idx]}
                    >
                      {isProcessingPhoto[idx] ? 'Memproses Foto...' : 'Pilih Foto'}
                    </Button>
                    {(item.photoFileName || item.photoPreviewUrl) && (
                      <Button
                        variant="text"
                        size="small"
                        color="error"
                        onClick={() => handleRemovePhoto(idx)}
                      >
                        Hapus Foto
                      </Button>
                    )}
                    {(item.photoFileName || item.photoPreviewUrl) && (
                      <div className="text-[12px] text-gray-600 break-all">
                        {item.photoFileName || item.photoPreviewUrl?.split('/').pop()}
                      </div>
                    )}
                  </div>
                  {!!photoErrors[idx] && (
                    <div className="text-[12px] text-red-600">{photoErrors[idx]}</div>
                  )}
                  {!!item.photoPreviewUrl && (
                    <div className="w-full max-w-sm border border-gray-200 rounded-md p-2 bg-white">
                      <img src={item.photoPreviewUrl} alt="Preview bukti kwitansi" className="w-full h-auto rounded" />
                    </div>
                  )}
                </div>
              </FormControl>
            </div>

            <div className="">
              <IconButton
                aria-label="hapus baris"
                onClick={() => handleRemoveEntry(idx)}
                size="large"
                color='error'
                disabled={idx === 0 && form.values.data.length === 1}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </div>
          </div>
        ))}
        {!isEdit && (
          <div className="flex justify-center pt-2">
            <MuiButton
              type="button"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddEntry}
              className="min-w-55! w-full! md:w-fit rounded-lg! border-gray-200! bg-white! hover:bg-gray-50! text-[#3b3b3b]! shadow-sm"
            >
              Tambah Data Keuangan
            </MuiButton>
          </div>
        )}
      </form>
      <div className="mt-6 flex justify-end pt-4 border-t border-gray-50">
        <Button variant="contained" color="primary" onClick={form.handleSubmit} className="mt-6 w-full md:w-auto">
          {isEdit ? 'Perbarui Data Keuangan' : 'Simpan Data Keuangan'}
        </Button>
      </div>
    </div>
  )
}

export default Form