import React from 'react'
import SelectField from '../fields/SelectField'

function SelectZakatType({...props}) {
  const options = [
    { label: 'Fitrah', value: 'fitrah' },
    { label: 'Mal', value: 'mal' },
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

export default SelectZakatType
