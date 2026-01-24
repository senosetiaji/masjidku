import React from 'react'
import SelectField from '../fields/SelectField'
import { useDispatch, useSelector } from 'react-redux';
import { getAllPelanggan } from '@/store/actions/master.action';

function SelectConsumer({...props}) {
  const dispatch = useDispatch();
  const { pelanggan: data } = useSelector(state => state.master);
  const options = []

  React.useEffect(()=> {
    dispatch(getAllPelanggan({ params: { all: true } }));
  }, [])

  React.useEffect(() => {
    if(data && data.length > 0){
      data.forEach(item => {
        options.push({
          label: item.name,
          value: item.id,
        })
      });
    }
  }, [data]);

  return (
    <div>
      <SelectField
        options={options}
        {...props}
      />
    </div>
  )
}

export default SelectConsumer
