import { Button, FormControl, IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFormik } from 'formik';
import DatePickerField from '@/components/fields/DatePickerField';
import NumericInputField from '@/components/fields/NumericInputField';
import TextInputField from '@/components/fields/TextInputField';
import TextAreaField from '@/components/fields/TextAreaField';
import SelectConsumer from '@/components/forms/SelectConsumer';
import SelectPaymentStatus from '@/components/forms/SelectPaymentStatus';
import { extractSelect } from '@/lib/helpers/helper';
import { useDispatch, useSelector } from 'react-redux';
import { createPamRutinan, getPreviousUsed, updateDataPamRutin } from '@/store/actions/pam.action';

function Form({ isEdit = false}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { tahun, bulan } = router.query;
  const { detailRutinan, previousUsed, isLoadingCreate } = useSelector((state) => state.pam);

  async function onSubmit(values) {
    // form submission logic here
    const payoad = {
      ...values,
      pelangganId: extractSelect(values.pelangganId, 'value'),
      status: extractSelect(values.status, 'value'),
      tahun: tahun ? parseInt(tahun, 10) : null,
      bulan: bulan ? parseInt(bulan, 10) : null,
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
        status: detailRutinan.status ? { label: detailRutinan.status.charAt(0).toUpperCase() + detailRutinan.status.slice(1), value: detailRutinan.status } : '',
        notes: detailRutinan.notes || '',
      });
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
      <form onSubmit={form.handleSubmit} className="ml-auto">
        <div className="grid grid-cols-3 gap-4">
          <FormControl fullWidth className='col-span-3'>
            <SelectConsumer
              label="Pelanggan"
              name="pelangganId"
              value={form.values.pelangganId}
              onChange={(name,value) => form.setFieldValue('pelangganId', value)}
              size={'small'}
              placeholder={'Pilih Pelanggan'}
              disabled={isEdit}
            />
          </FormControl>
          <div className="col-span-3 p-4 bg-[#f9f9f9] rounded-lg border border-dashed border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <FormControl fullWidth>
                <NumericInputField
                  label="Bulan Ini"
                  name="current_used"
                  value={form.values.current_used}
                  onChange={(name,value) => form.setFieldValue('current_used', value)}
                  size={'small'}
                  placeholder={'Masukkan penggunaan bulan ini'}
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
              <div className="col-span-3 flex justify-end mt-2">
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
          <FormControl fullWidth className='col-span-3'>
            <SelectPaymentStatus
              label="Status Pembayaran"
              name="status"
              value={form.values.status}
              onChange={(name,value) => form.setFieldValue('status', value)}
              size={'small'}
              placeholder={'Pilih Status Pembayaran'}
            />
          </FormControl>
          {
            (form.values.status?.value === 'paid' || form.values.status?.value === 'half_paid') && (
            <FormControl fullWidth className='col-span-3'>
              <DatePickerField
                label="Tanggal"
                name="paymentDate"
                value={form.values.paymentDate}
                size={'small'}
                onChange={(name,value) => form.setFieldValue('paymentDate', value)}
              />
            </FormControl>
            )
          }
          {
            (form.values.status?.value === 'half_paid' || form.values.status?.value === 'paid') && (
            <FormControl fullWidth className='col-span-3'>
              <NumericInputField
                label="Jumlah Bayar (Rp)"
                name="paidAmount"
                value={form.values.paidAmount}
                onChange={(name,value) => form.setFieldValue('paidAmount', value)}
                size={'small'}
                placeholder={'Masukkan jumlah bayar'}
              />
            </FormControl>
            )
          }
          <FormControl fullWidth className='col-span-3'>
            <TextAreaField
              label="Keterangan"
              name="notes"
              value={form.values.notes}
              onChange={(name,value) => form.setFieldValue('notes', value)}
              size={'small'}
              row={3}
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
          >
            {isEdit ? 'Update Biaya Rutinan' : 'Simpan Biaya Rutinan'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Form