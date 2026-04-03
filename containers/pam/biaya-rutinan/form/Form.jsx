import { Button, FormControl, IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import DatePickerField from '@/components/fields/DatePickerField';
import NumericInputField from '@/components/fields/NumericInputField';
import TextAreaField from '@/components/fields/TextAreaField';
import SelectConsumer from '@/components/forms/SelectConsumer';
import SelectPaymentStatus from '@/components/forms/SelectPaymentStatus';
import { extractSelect } from '@/lib/helpers/helper';
import { useDispatch, useSelector } from 'react-redux';
import { createPamRutinan, getPreviousUsed, updateDataPamRutin } from '@/store/actions/pam.action';
import * as Yup from 'yup';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const parseNumeric = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
};

const validationSchema = Yup.object().shape({
  pelangganId: Yup.object().nullable().required('Pelanggan wajib dipilih.'),
  current_used: Yup.number()
    .typeError('Penggunaan bulan ini wajib angka.')
    .min(0, 'Penggunaan bulan ini tidak boleh negatif.')
    .required('Penggunaan bulan ini wajib diisi.'),
  previous_used: Yup.number()
    .typeError('Penggunaan bulan sebelumnya wajib angka.')
    .min(0, 'Penggunaan bulan sebelumnya tidak boleh negatif.'),
  status: Yup.object().nullable().required('Status pembayaran wajib dipilih.'),
  paymentDate: Yup.string().when('status', {
    is: (status) => ['paid', 'half_paid'].includes(status?.value),
    then: (schema) => schema.required('Tanggal pembayaran wajib diisi.'),
    otherwise: (schema) => schema.nullable(),
  }),
  paidAmount: Yup.number().when('status', {
    is: (status) => ['paid', 'half_paid'].includes(status?.value),
    then: (schema) => schema
      .typeError('Jumlah bayar wajib angka.')
      .min(0, 'Jumlah bayar tidak boleh negatif.')
      .required('Jumlah bayar wajib diisi.'),
    otherwise: (schema) => schema.nullable(),
  }),
  notes: Yup.string().max(500, 'Keterangan maksimal 500 karakter.'),
});

function Form({ isEdit = false}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { tahun, bulan } = router.query;
  const { detailRutinan, previousUsed, isLoadingCreate } = useSelector((state) => state.pam);
  const fileInputRef = React.useRef(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = React.useState('');
  const [photoDataUrl, setPhotoDataUrl] = React.useState('');
  const [photoFileName, setPhotoFileName] = React.useState('');
  const [isCompressingPhoto, setIsCompressingPhoto] = React.useState(false);
  const [photoError, setPhotoError] = React.useState('');

  const compressImageFile = async (file) => {
    const objectUrl = URL.createObjectURL(file);
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = objectUrl;
    });

    const maxWidth = 1280;
    const maxHeight = 1280;
    const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const targetWidth = Math.max(1, Math.floor(image.width * ratio));
    const targetHeight = Math.max(1, Math.floor(image.height * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const compressedBlob = await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.8);
    });

    URL.revokeObjectURL(objectUrl);
    return compressedBlob;
  };

  const convertBlobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const handleSelectPhoto = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      setPhotoError('Format foto harus JPG, PNG, atau WEBP.');
      return;
    }

    if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
      setPhotoError('Ukuran foto maksimal 5MB.');
      return;
    }

    setIsCompressingPhoto(true);
    setPhotoError('');

    try {
      const compressedBlob = await compressImageFile(selectedFile);
      if (!compressedBlob) {
        setPhotoError('Gagal melakukan kompresi foto.');
        return;
      }

      const dataUrl = await convertBlobToDataUrl(compressedBlob);
      setPhotoDataUrl(dataUrl);
      setPhotoPreviewUrl(dataUrl);
      setPhotoFileName(selectedFile.name);
    } catch (error) {
      setPhotoError('Gagal memproses foto. Silakan coba lagi.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  async function onSubmit(values) {
    if (!tahun || !bulan) {
      return;
    }

    // form submission logic here
    const payoad = {
      ...values,
      pelangganId: extractSelect(values.pelangganId, 'value'),
      status: extractSelect(values.status, 'value'),
      tahun: tahun ? parseInt(tahun, 10) : null,
      bulan: bulan ? parseInt(bulan, 10) : null,
      water_bill: parseNumeric(values.current_used) - parseNumeric(values.previous_used),
      photoDataUrl,
    };

    if (isEdit) {
      await dispatch(updateDataPamRutin({ id: detailRutinan.id, payload: payoad }));
      return;
    }
    await dispatch(createPamRutinan({ payload: payoad }));
    console.log('submit payload:', payoad);

  }
  const form = useFormik({
    initialValues: {
      // form initial values here
      pelangganId: '',
      paymentDate: '',
      previous_used: '',
      current_used: '',
      billAmount: '',
      paidAmount: '',
      status: '',
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      // form submission logic here
      await onSubmit(values);
    },
  });
  React.useEffect(() => {
    form.resetForm();
  },[]);
  React.useEffect(() => {
    if(isEdit) return;
    if (!form.values.pelangganId) return;
    const newParams = {
      pelangganId: extractSelect(form.values.pelangganId, 'value'),
      tahun: tahun ? parseInt(tahun, 10) : null,
      bulan: bulan ? parseInt(bulan, 10) : null,
    };
    dispatch(getPreviousUsed({ params: newParams }))
  }, [form.values.pelangganId]);
  React.useEffect(() => {
    if(isEdit) return;
    if(previousUsed) {
      form.setFieldValue('previous_used', previousUsed.current_used || 0);
    }
  }, [previousUsed]);
  React.useEffect(() => {
    if (isEdit && detailRutinan) {
      form.setValues({
        pelangganId: detailRutinan.pelangganId ? { label: detailRutinan.pelangganName, value: detailRutinan.pelangganId } : '',
        paymentDate: detailRutinan.paymentDate ? new Date(detailRutinan.paymentDate) : '',
        previous_used: detailRutinan.previous_used || '',
        current_used: detailRutinan.current_used || '',
        billAmount: detailRutinan.billAmount || '',
        paidAmount: detailRutinan.paidAmount || '',
        status: detailRutinan.status ? { label: detailRutinan.status.charAt(0).toUpperCase() + detailRutinan.status.slice(1), value: String(detailRutinan.status).replace('-', '_') } : '',
        notes: detailRutinan.notes || '',
      });

      setPhotoDataUrl('');
      setPhotoFileName('');
      setPhotoPreviewUrl(detailRutinan.photoUrl || '');
      setPhotoError('');
    }
  }, [isEdit, detailRutinan]);

  function calculateBillAmount() {
    const currentUsed = parseFloat(form.values.current_used) || 0;
    const previousUsed = parseFloat(form.values.previous_used) || 0;
    const usage = currentUsed - previousUsed;
    const ratePerUnit = 4000;
    const totalBill = usage * ratePerUnit;
    form.setFieldValue('billAmount', totalBill >= 0 ? totalBill : 0);
  }
  return (
    <div>
      <div className="flex items-center mb-6 gap-4">
        <IconButton aria-label="back" onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <div>
          <div className="text-[20px] font-bold text-[#333]">Formulir Biaya Rutinan PAM</div>
          <div className="text-[#666] text-[13px]">Lengkapi data biaya rutinan dengan benar.</div>
        </div>
      </div>
      <form onSubmit={form.handleSubmit} className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FormControl fullWidth className='lg:col-span-3'>
            <SelectConsumer
              label="Pelanggan"
              name="pelangganId"
              value={form.values.pelangganId}
              onChange={(name,value) => form.setFieldValue('pelangganId', value)}
              size={'small'}
              placeholder={'Pilih Pelanggan'}
              disabled={isEdit}
              touched={form.submitCount > 0}
              error={form.submitCount > 0 ? form.errors.pelangganId : ''}
            />
          </FormControl>
          <div className="lg:col-span-3 p-4 bg-[#f9f9f9] rounded-lg border border-dashed border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormControl fullWidth>
                <NumericInputField
                  label="Bulan Ini"
                  name="current_used"
                  value={form.values.current_used}
                  onChange={(name,value) => form.setFieldValue('current_used', value)}
                  size={'small'}
                  placeholder={'Masukkan penggunaan bulan ini'}
                  touched={form.submitCount > 0}
                  error={form.submitCount > 0 ? form.errors.current_used : ''}
                />
              </FormControl>
              <FormControl fullWidth>
                <NumericInputField
                  label="Bulan Sebelumnya"
                  name="previous_used"
                  value={form.values.previous_used}
                  onChange={(name,value) => form.setFieldValue('previous_used', value)}
                  size={'small'}
                  disabled
                  touched={form.submitCount > 0}
                  error={form.submitCount > 0 ? form.errors.previous_used : ''}
                />
              </FormControl>
              <FormControl fullWidth>
                <NumericInputField
                  label="Total Biaya (Rp)"
                  name="billAmount"
                  value={form.values.billAmount}
                  onChange={(name,value) => form.setFieldValue('billAmount', value)}
                  size={'small'}
                  disabled={true}
                />
              </FormControl>
              <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
                <Button
                  variant="contained"
                  size="medium"
                  onClick={calculateBillAmount}
                  className='bg-yellow-500!'
                >
                  Hitung Total Biaya
                </Button>
              </div>
            </div>
          </div>
          <FormControl fullWidth className='lg:col-span-3'>
            <SelectPaymentStatus
              label="Status Pembayaran"
              name="status"
              value={form.values.status}
              onChange={(name,value) => form.setFieldValue('status', value)}
              size={'small'}
              placeholder={'Pilih Status Pembayaran'}
              touched={form.submitCount > 0}
              error={form.submitCount > 0 ? form.errors.status : ''}
            />
          </FormControl>
          {
            (form.values.status?.value === 'paid' || form.values.status?.value === 'half_paid') && (
            <FormControl fullWidth className='lg:col-span-3'>
              <DatePickerField
                label="Tanggal"
                name="paymentDate"
                value={form.values.paymentDate}
                size={'small'}
                onChange={(name,value) => form.setFieldValue('paymentDate', value)}
                touched={form.submitCount > 0}
                error={form.submitCount > 0 ? form.errors.paymentDate : ''}
              />
            </FormControl>
            )
          }
          {
            (form.values.status?.value === 'half_paid' || form.values.status?.value === 'paid') && (
            <FormControl fullWidth className='lg:col-span-3'>
              <NumericInputField
                label="Jumlah Bayar (Rp)"
                name="paidAmount"
                value={form.values.paidAmount}
                onChange={(name,value) => form.setFieldValue('paidAmount', value)}
                size={'small'}
                placeholder={'Masukkan jumlah bayar'}
                touched={form.submitCount > 0}
                error={form.submitCount > 0 ? form.errors.paidAmount : ''}
              />
            </FormControl>
            )
          }
          <FormControl fullWidth className='lg:col-span-3'>
            <div className="text-[#4F4F4F] font-medium mb-2 text-[13px]">Foto Bukti Meteran</div>
            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleSelectPhoto}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressingPhoto}
                >
                  {isCompressingPhoto ? 'Memproses Foto...' : 'Pilih Foto'}
                </Button>
                {(photoFileName || detailRutinan?.photoUrl) && (
                  <div className="text-[12px] text-gray-600 break-all">
                    {photoFileName || detailRutinan?.photoUrl?.split('/').pop()}
                  </div>
                )}
              </div>
              {!!photoError && (
                <div className="text-[12px] text-red-600">{photoError}</div>
              )}
              {photoPreviewUrl && (
                <div className="w-full max-w-sm border border-gray-200 rounded-md p-2 bg-white">
                  <img src={photoPreviewUrl} alt="Preview bukti meteran" className="w-full h-auto rounded" />
                </div>
              )}
            </div>
          </FormControl>
          <FormControl fullWidth className='lg:col-span-3'>
            <TextAreaField
              label="Keterangan"
              name="notes"
              value={form.values.notes}
              onChange={(name,value) => form.setFieldValue('notes', value)}
              size={'small'}
              row={3}
              touched={form.submitCount > 0}
              error={form.submitCount > 0 ? form.errors.notes : ''}
            />
          </FormControl>
        </div>
        <div className="flex justify-end pt-6">
          <Button
            variant="contained"
            size="large"
            type="submit"
            color='primary'
            loading={isLoadingCreate}
            disabled={isLoadingCreate}
            className='w-full sm:w-auto'
          >
            {isEdit ? 'Update Biaya Rutinan' : 'Simpan Biaya Rutinan'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Form