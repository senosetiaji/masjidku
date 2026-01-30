import React from 'react'
import SelectField from '../fields/SelectField'

function SelectPeriode({...props}) {
  const options = [
    { label: 'Bulan', value: '1' },
    { label: 'Tahun', value: '2' },
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

export default SelectPeriode
