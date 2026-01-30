import React from 'react'
import SelectField from '../fields/SelectField'

function SelectKondisi({...props}) {
  const options = [
    { label: 'Baik', value: 'baik' },
    { label: 'Perlu Perbaikan', value: 'perlu_perbaikan' },
    { label: 'Rusak', value: 'rusak' },
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

export default SelectKondisi
