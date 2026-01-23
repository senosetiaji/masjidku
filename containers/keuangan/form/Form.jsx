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

  const form = useFormik({
    initialValues: {
      data: [createEmptyEntry()],
    },
    onSubmit: (values) => {
      // Hook this up to API/dispatch when ready
      console.log(values)
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
          <div className="text-xl font-bold text-[#333]">Formulir Keuangan</div>
          <div className="text-[#666] tinos-regular">Lengkapi data keuangan dengan benar.</div>
        </div>
      </div>
      <form onSubmit={form.handleSubmit} className="space-y-6">
        {form.values.data.map((item, idx) => (
          <div
            key={item.id}
            className="relative rounded-xl border border-dashed border-gray-200 bg-[#fbfbfb] p-6 shadow-sm flex gap-4 w-full"
          >
            <div className="grid gap-2 w-full">
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