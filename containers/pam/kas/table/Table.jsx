import TableNormal from '@/components/table/TableNormal';
import { __renderValue, __renderValueDefaultZero, formatRupiah } from '@/lib/helpers/helper';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ModalConfirm from '@/components/modals/ModalConfirm';
import { useRouter } from 'next/router';
import moment from 'moment';
import { deleteData } from '@/store/actions/finance.action';
import { deleteDataPamKas } from '@/store/actions/pam.action';

function Table({ params, setParams, fetchData }) {
  const { finance, isLoading } = useSelector(state => state.pam);
  const { data = [], meta } = finance ;
  const deleteModalRef = React.useRef();
  const dispatch = useDispatch();
  const router = useRouter();

  const columns = [
    {
      label:"No",
      align:"center",
      sx: {
        width: 50,
      },
      render: (val, index) => index + 1 + ((params.page - 1) * params.limit),
    },
    {
      label:"Tanggal",
      align:"left",
      sx: {
        minWidth: 350,
      },
      render: (val) => val?.date ? moment(val.date).format('DD MMM YYYY') : '-'
    },
    {
      label:"Jumlah",
      align:"left",
      sx: {
        minWidth: 350,
      },
      render: (val) => __renderValue(val.amount)
    },
    {
      label:"Tipe",
      align:"left",
      sx: {
        minWidth: 350,
      },
      render: (val) => __renderValue(val.type)
    },
    {
      label:"Saldo",
      align:"left",
      hide: params?.bulan,
      sx: {
        minWidth: 350,
      },
      render: (val) => formatRupiah(val.saldo) 
    },
    {
      label:"Keterangan",
      align:"left",
      sx: {
        minWidth: 350,
      },
      render: (val) => __renderValue(val.description)
    },
    {
      label:"Aksi",
      align:"center",
      sx: {
        width: 350,
      },
      render: (val) => {
        return (
          <div className='flex gap-2 w-full justify-center'>
            <IconButton aria-label="edit" className='bg-yellow-400! text-white! hover:bg-yellow-500!' onClick={() => { router.push(`/keuangan/edit/${val?.id}`) }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="delete" className='bg-red-400! text-white! hover:bg-red-500!' onClick={() => { deleteModalRef.current.open(val?.id); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        )
      }
    },
  ]

  async function handleDelete(id) {
    // dispatch(deleteUserAction(id, params));
    const res = await dispatch(deleteDataPamKas({ id: id, params: {} }))
    fetchData();
  }

  return (
    <div>
      <TableNormal
        columns={columns}
        data={data}
        totalData={meta?.total_row}
        page={params.page}
        params={params}
        setParams={setParams}
        isLoading={isLoading}
      />
      <ModalConfirm ref={deleteModalRef} description="Data yang sudah dihapus tidak dapat dikembalikan." onConfirm={(data) => handleDelete(data)} />
    </div>
  )
}

export default Table
