import React from 'react'
import SelectField from '../fields/SelectField'

function SelectTipeKeuangan({...props}) {
  const options = [
    { label: 'Pemasukan', value: 'income' },
    { label: 'Pengeluaran', value: 'expense' },
    { label: 'Pemindahan Dana', value: 'transfer' },
  ]

  return (
    <div>
      <SelectField
        options={options}
        {...props}
      />
    </div>
  )
}

export default SelectTipeKeuangan
