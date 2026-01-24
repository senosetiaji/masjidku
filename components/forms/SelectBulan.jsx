import React from 'react'
import SelectField from '../fields/SelectField';

function SelectBulan({...props}) {
  const [options, setOptions] = React.useState([])

  React.useEffect(() => {
    const bulanOptions = [
      { label: 'Januari', value: '1' },
      { label: 'Februari', value: '2' },
      { label: 'Maret', value: '3' },
      { label: 'April', value: '4' },
      { label: 'Mei', value: '5' },
      { label: 'Juni', value: '6' },
      { label: 'Juli', value: '7' },
      { label: 'Agustus', value: '8' },
      { label: 'September', value: '9' },
      { label: 'Oktober', value: '10' },
      { label: 'November', value: '11' },
      { label: 'Desember', value: '12' },
    ];
    setOptions(bulanOptions);
  }, []);

  return (
    <div>
      <SelectField
        options={options}
        {...props}
      />
    </div>
  )
}

export default SelectBulan