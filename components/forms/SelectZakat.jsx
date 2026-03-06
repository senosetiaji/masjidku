import React from 'react'
import SelectField from '../fields/SelectField'

function SelectZakat({...props}) {
  const options = [
    { label: 'Uang', value: 'uang' },
    { label: 'Beras', value: 'beras' },
    { label: 'Lain-lain', value: 'lainnya' },
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

export default SelectZakat
