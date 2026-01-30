import React from 'react'
import SelectField from '../fields/SelectField'
import { useDispatch, useSelector } from 'react-redux';
import { getAllPelanggan } from '@/store/actions/master.action';

function SelectConsumer({ ...props }) {
  const dispatch = useDispatch();
  const { pelanggan } = useSelector(state => state.master);
  const { data } = pelanggan;
  const [options, setOptions] = React.useState([]);
  React.useEffect(() => {
    dispatch(getAllPelanggan({ params: { all: true } }));
  }, []);

  React.useEffect(() => {
    if (data && data.length > 0) {
      const opts = data.map(item => ({
        label: item.name,
        value: item.id,
      }));
      setOptions(opts);
    }
  }, [data]);


  // const options = React.useMemo(() => {
  //   if (!data || data.length === 0) return [];
  //   return data.map(item => ({
  //     label: item.name,
  //     value: item.id,
  //   }));
  // }, [data]);

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
