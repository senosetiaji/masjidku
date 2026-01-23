import React from 'react'
import { useFormik } from 'formik'
import IconButton from '@mui/material/IconButton'
import MuiButton from '@mui/material/Button'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import DatePickerField from '@/components/fields/DatePickerField'
import NumericInputField from '@/components/fields/NumericInputField'
import SelectField from '@/components/fields/SelectField'
import TextInputField from '@/components/fields/TextInputField'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import { useDispatch } from 'react-redux'
import { createFinance } from '@/store/actions/finance.action'
import { FormControl } from '@mui/material'

const typeOptions = [
  { label: 'Pemasukan', value: 'income' },
  { label: 'Pengeluaran', value: 'expense' },
]

const createEmptyEntry = () => ({
  date: new Date().toISOString().slice(0, 10),
  nominal: '',
  type: typeOptions[0],
  description: '',
})

function Form({ isEdit = false }) {
  const router = useRouter();
  const dispatch = useDispatch();
  
  function onSubmit(values) {
    const payload = {
      data: values.data.map((item) => ({
        date: item.date,
        amount: Number(item.nominal.toString().replace(/[^0-9,-]+/g, '').replace(',', '.')),
        type: item.type.value,
        description: item.description,
      })),
    }
    console.log('Submitting payload:', payload)
    // Example dispatch call
    // dispatch(saveFinanceData(payload));
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
            key={item.id}
            className="relative rounded-xl border border-dashed border-gray-200 bg-[#fbfbfb] p-6 shadow-sm flex gap-4 w-full"
          >
            <div className="grid grid-cols-3 gap-2 w-full">
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
                <SelectField
                  label="Jenis"
                  name={`data[${idx}].type`}
                  placeholder="Pilih jenis"
                  options={typeOptions}
                  value={item.type}
                  onChange={handleFieldChange}
                  size="small"
                  labelfontsize="13px"
                  fontSize="13px"
                  labelMb="6px"
                />
              </FormControl>
              <FormControl fullWidth className="col-span-3">
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
            </div>

            <div className="">
              <IconButton
                aria-label="hapus baris"
                onClick={() => handleRemoveEntry(idx)}
                className="bg-[#ff4d4f]! text-white! shadow-lg hover:bg-[#e04343]!"
                size="large"
              >
                <DeleteOutlineIcon />
              </IconButton>
            </div>
          </div>
        ))}

        <div className="flex justify-center pt-2">
          <MuiButton
            type="button"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddEntry}
            className="min-w-55! rounded-lg! border-gray-200! bg-white! hover:bg-gray-50! text-[#3b3b3b]! shadow-sm"
          >
            Tambah Data Keuangan
          </MuiButton>
        </div>
      </form>
      <div className="mt-6 flex justify-end pt-4 border-t border-gray-50">
        <Button variant="contained" color="primary" onClick={form.handleSubmit} className="mt-6">
          {isEdit ? 'Perbarui Data Keuangan' : 'Simpan Data Keuangan'}
        </Button>
      </div>
    </div>
  )
}

export default Form