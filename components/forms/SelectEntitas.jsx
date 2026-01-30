import React from 'react'
import SelectField from '../fields/SelectField'

function SelectEntitas({...props}) {
  const options = [
    { label: 'Entitas 1', value: '1' },
    { label: 'Entitas 2', value: '2' },
    { label: 'Entitas 3', value: '3' },
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

export default SelectEntitas
