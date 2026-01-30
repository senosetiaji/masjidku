import React from 'react'
import SelectField from '../fields/SelectField'

function SelectPaymentStatus({...props}) {
  const options = [
    { label: 'Paid', value: 'paid' },
    { label: 'Half Paid', value: 'half_paid' },
    { label: 'Unpaid', value: 'unpaid' },
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

export default SelectPaymentStatus
