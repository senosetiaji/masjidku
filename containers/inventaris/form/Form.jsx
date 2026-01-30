import React from 'react'
import { useFormik } from 'formik'
import IconButton from '@mui/material/IconButton'
import MuiButton from '@mui/material/Button'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import TextInputField from '@/components/fields/TextInputField'
import NumericInputField from '@/components/fields/NumericInputField'
import { extractValue } from '@/lib/helpers/helper'
import SelectKondisi from '@/components/forms/SelectKondisi'
import { FormControl } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { createInventaris, updateDataInventaris } from '@/store/actions/inventaris.action'

const conditionOptions = [
  { label: 'Baik', value: 'baik' },
  { label: 'Perlu Perbaikan', value: 'perlu_perbaikan' },
  { label: 'Rusak', value: 'rusak' },
]

const createEmptyItem = () => ({
  name: '',
  quantity: '',
  condition: '',
  description: '',
})

function Form({ isEdit = false}) {
  const router = useRouter();
  const { pid } = router.query;
  const dispatch = useDispatch();
  const { detail } = useSelector((state) => state.inventaris);
  
  async function onSubmit(payload) {
    console.log(payload);
    if (isEdit) {
      // dispatch update action
      await dispatch(updateDataInventaris({ id: pid, payload: payload }));
    } else {
      // dispatch create action
      await dispatch(createInventaris({ payload: payload }));
    }
  }
  const form = useFormik({
    initialValues: {
      data: [createEmptyItem()],
    },
    onSubmit: async (values) => {
      const payload = values.data.map((item) => ({
        name: item.name,
        quantity: Number(item.quantity) || 0,
        condition: extractValue(item.condition, 'value'),
        description: item.description,
      }))
      await onSubmit(payload);
    },
  })

  React.useEffect(() => {
    if (isEdit && detail) {
      const mapped = detail ? [{
        name: detail.name || '',
        quantity: detail.quantity ? String(detail.quantity) : '',
        condition: conditionOptions.find(c => c.value === detail.condition) || '',
        description: detail.description || '',
      }] : [createEmptyItem()]
      form.setValues({ data: mapped })
    }
  }, [isEdit, detail])

  const handleFieldChange = (name, value) => {
    form.setFieldValue(name, value)
  }

  const handleAdd = () => {
    form.setFieldValue('data', [...form.values.data, createEmptyItem()])
  }

  const handleRemove = (idx) => {
    const next = form.values.data.filter((_, i) => i !== idx)
    form.setFieldValue('data', next.length ? next : [createEmptyItem()])
  }

  return (
    <div className="">
      <div className="flex items-center mb-6 gap-4">
        <IconButton aria-label="back" onClick={() => router.back()}>
          <ArrowBackIcon />
        </IconButton>
        <div>
          <div className="text-[20px] font-bold text-[#333]">Formulir Inventaris</div>
          <div className="text-[#666] text-[13px]">Lengkapi data inventaris dengan benar.</div>
        </div>
      </div>
      <form onSubmit={form.handleSubmit} className="space-y-6">
        {form.values.data.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-start gap-4 rounded-xl border border-dashed border-gray-200 bg-[#fbfbfb] p-6 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <FormControl fullWidth className='col-span-1 md:col-span-2'>
                <TextInputField
                  label="Nama Inventaris"
                  name={`data[${idx}].name`}
                  value={item.name}
                  onChange={handleFieldChange}
                  placeholder=""
                  size="small"
                  labelfontsize="13px"
                  fontSize="13px"
                  labelMb="6px"
                />
              </FormControl>
              <FormControl fullWidth>
                <NumericInputField
                  label="Jumlah"
                  name={`data[${idx}].quantity`}
                  value={item.quantity}
                  onChange={handleFieldChange}
                  placeholder=""
                  thousandSeparator="."
                  decimalSeparator="," 
                  size="small"
                  labelfontsize="13px"
                  fontSize="13px"
                  labelMb="6px"
                />
              </FormControl>
              <FormControl fullWidth>
              <SelectKondisi
                label="Kondisi"
                name={`data[${idx}].condition`}
                placeholder="Baik/Perlu Perbaikan/ Rusak"
                value={item.condition}
                onChange={handleFieldChange}
                size="small"
                labelfontsize="13px"
                fontSize="13px"
                labelMb="6px"
              />
              </FormControl>
              <FormControl fullWidth className='col-span-1 md:col-span-2'>
                <TextInputField
                  label="Keterangan"
                  name={`data[${idx}].description`}
                  value={item.description}
                  onChange={handleFieldChange}
                  placeholder=""
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
                onClick={() => handleRemove(idx)}
                className="bg-[#ff4d4f]! text-white! shadow-lg hover:bg-[#e04343]!"
                size="large"
                disabled={form.values.data.length === 1 || (isEdit && detail)}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </div>
          </div>
        ))}
        { !isEdit && (
          <div className="flex justify-center pt-2">
            <MuiButton
              type="button"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              className="min-w-55! rounded-lg! border-gray-200! bg-white! hover:bg-gray-50! text-[#3b3b3b]! shadow-sm"
            >
              Tambah Inventaris
            </MuiButton>
          </div>
        )}
      </form>
      <div className="w-full flex justify-end mt-4 pt-4 border-t border-gray-200">
        <MuiButton
          type="button"
          variant="contained"
          onClick={form.submitForm}
          color='primary'
        >
          {isEdit ? "Simpan Perubahan" : "Simpan Inventaris"}
        </MuiButton>
      </div>
    </div>
  )
}

export default Form