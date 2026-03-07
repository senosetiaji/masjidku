import DatePickerField from '@/components/fields/DatePickerField';
import TextAreaField from '@/components/fields/TextAreaField';
import TextInputField from '@/components/fields/TextInputField';
import SelectZakat from '@/components/forms/SelectZakat';
import SelectZakatType from '@/components/forms/SelectZakatType';
import { extractValue } from '@/lib/helpers/helper';
import { createZakat, updateZakat } from '@/store/actions/zakat.action';
import { Button, Divider, FormControl } from '@mui/material'
import { useFormik } from 'formik';
import moment from 'moment';
import { useRouter } from 'next/router';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';

function Form({ isEdit = false }) {
  const dispatch = useDispatch();
  const { isLoadingCreate, detail } = useSelector((state) => state.zakat);
  const router = useRouter();
  const  { pid } = router.query;

  const parseAmount = (value) => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    const normalized = String(value).replace(/\s+/g, '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const formatAmountDisplay = (value) => {
    const parsed = parseAmount(value);
    return parsed.toFixed(2);
  }

  const onSubmit = (values) => {
    const payload = {
      ...values,
      type: extractValue(values.type, 'value'),
      zakatType: extractValue(values.zakatType, 'value'),
      amount: parseAmount(values.amount),
    }
    
    if (isEdit) {
      dispatch(updateZakat({ id: pid, payload: payload }))
    } else {
      dispatch(createZakat({ payload: payload }))
    }
  }

  const formik = useFormik({
    initialValues: {
      name: '',
      date: moment().format('YYYY-MM-DD'),
      type: '',
      zakatType: '',
      amount: '2.50',
      description: '',
    },
    onSubmit: onSubmit,
  });

  React.useEffect(() => {
    if (isEdit && detail) {
      formik.setValues({
        name: detail.name || '',
        date: detail.date ? moment(detail.date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
        type: detail.type ? {
          label: detail.type.charAt(0).toUpperCase() + detail.type.slice(1),
          value: detail.type,
        } : '',
        zakatType: detail.zakatType ? {
          label: detail.zakatType === 'lainnya' ? 'Lain-lain' : detail.zakatType.charAt(0).toUpperCase() + detail.zakatType.slice(1),
          value: detail.zakatType,
        } : '',
        amount: detail.amount !== undefined && detail.amount !== null ? formatAmountDisplay(detail.amount) : '2.50',
        description: detail.description || '',
      })
    }
  }, [isEdit, detail])

  return (
    <div className='p-4 md:p-8 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
      <FormControl fullWidth>
        <DatePickerField
          label="Tanggal Zakat"
          name="date"
          value={formik.values.date}
          onChange={(name, value) => formik.setFieldValue('date', value)}
          onBlur={formik.handleBlur}
          error={formik.touched.date && Boolean(formik.errors.date)}
          helperText={formik.touched.date && formik.errors.date}
          size={'small'}
          placeholder={'Pilih Tanggal Zakat'}
        />
      </FormControl>
      <FormControl fullWidth>
        <SelectZakatType
          label="Zakat"
          name="type"
          value={formik.values.type}
          onChange={(name, value) => formik.setFieldValue('type', value)}
          onBlur={formik.handleBlur}
          error={formik.touched.type && Boolean(formik.errors.type)}
          helperText={formik.touched.type && formik.errors.type}
          size={'small'}
          placeholder={'Pilih Jenis Zakat'}
        />
      </FormControl>
      <div className="p-4 md:p-8 rounded-xl border border-dashed border-gray-300 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="md:col-span-2">
          <div className="text-6">Data Zakat</div>
          <div className='text-[13px] text-gray-400'>Lengkapi data berikut untuk membuat Zakat baru.</div>
        </div>
        <Divider className='md:col-span-2' />
        <FormControl fullWidth>
          <TextInputField
            label="Nama Muzzaki/Pemberi Zakat"
            name="name"
            value={formik.values.name}
            onChange={(name, value) => formik.setFieldValue('name', value)}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            size={'small'}
            placeholder={'Tuliskan Nama Muzzaki/Pemberi Zakat'}
          />
        </FormControl>
        <FormControl fullWidth>
          <SelectZakat
            label="Jenis Zakat"
            name="zakatType"
            value={formik.values.zakatType}
            onChange={(name, value) => formik.setFieldValue('zakatType', value)}
            onBlur={formik.handleBlur}
            error={formik.touched.zakatType && Boolean(formik.errors.zakatType)}
            helperText={formik.touched.zakatType && formik.errors.zakatType}
            size={'small'}
            placeholder={'Pilih Jenis Zakat'}
          />
        </FormControl>
        <FormControl fullWidth className='md:col-span-2'>
          <TextInputField
            label="Jumlah Zakat"
            name="amount"
            value={formik.values.amount}
            onChange={(name, value) => formik.setFieldValue('amount', value)}
            onBlur={formik.handleBlur}
            error={formik.touched.amount && Boolean(formik.errors.amount)}
            helperText={formik.touched.amount && formik.errors.amount}
            size={'small'}
            type="number"
            InputProps={{ inputProps: { step: '0.01', min: '0' } }}
            placeholder={'Tuliskan Jumlah Zakat'}
          />
        </FormControl>
        <FormControl fullWidth className='md:col-span-2'>
          <TextAreaField
            label="Keterangan"
            name="description"
            value={formik.values.description}
            onChange={(name, value) => formik.setFieldValue('description', value)}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
            size={'small'}
            placeholder={'Tuliskan Keterangan (opsional)'}
          />
        </FormControl>
      </div>
      <Button type="submit" variant="contained" color="primary" onClick={formik.handleSubmit} className='w-full md:w-auto md:col-span-2 md:justify-self-end' disabled={isLoadingCreate}>
        Simpan Zakat
      </Button>
    </div>
  )
}

export default Form
