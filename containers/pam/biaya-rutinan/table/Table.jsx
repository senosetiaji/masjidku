import TableNormal from '@/components/table/TableNormal';
import { __renderValue, __renderValueDefaultZero } from '@/lib/helpers/helper';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ModalConfirm from '@/components/modals/ModalConfirm';
import { deleteUser } from '@/store/actions/user.action';
import { useRouter } from 'next/router';
import moment from 'moment';
import { deleteData } from '@/store/actions/finance.action';

function Table({ params, setParams, fetchData }) {
  const { rutinan: data, isLoading, meta } = useSelector(state => state.pam);
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
      label:"Nama Pelanggan",
      align:"left",
      sx: {
        minWidth: 350,
      },
      render: (val) => __renderValue(val.pelangganName)
    },
    {
      label:"Tanggal",
      align:"left",
      sx: {
        minWidth: 350,
      },
      render: (val) => val?.paymentDate ? moment(val.paymentDate).format('DD MMM YYYY') : '-'
    },
    {
      label:"Penggunaan",
      align:"center",
      sx: {
        minWidth: 350,
      },
      children: [
        {
          label: "Bulan Sebelumnya (A)",
          align: "center",
          sx: {
            minWidth: 200,
          },
          render: (val) => __renderValueDefaultZero(val.previous_used)
        },
        {
          label: "Bulan Ini (B)",
          align: "center",
          sx: {
            minWidth: 200,
          },
          render: (val) => __renderValueDefaultZero(val.current_used)
        },
        {
          label: "Total Penggunaan (B-A)",
          align: "center",
          sx: {
            minWidth: 200,
          },
          render: (val) => __renderValueDefaultZero(val.water_bill)
        },
      ],
    },
    {
      label:"Total Biaya (Rp)",
      align:"left",
      sx: {
        minWidth: 350,
      },
      render: (val) => __renderValueDefaultZero(val.billAmount)
    },
    {
      label:"Status",
      align:"left",
      sx: {
        minWidth: 150,
      },
      render: (val) => __renderValue(val.status)
    },
    {
      label:"Catatan",
      align:"left",
      sx: {
        minWidth: 150,
      },
      render: (val) => __renderValue(val.notes)
    },
    {
      label:"Aksi",
      align:"center",
      sx: {
        minWidth: 350,
      },
      render: (val) => {
        return (
          <div className='flex gap-2 w-full justify-center'>
            <IconButton aria-label="edit" className='bg-yellow-400! text-white! hover:bg-yellow-500!' onClick={() => { router.push(`/pam/biaya-rutinan/edit/${val?.id}`) }}>
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
    const res = await dispatch(deleteData({ id: id, params: {} }))
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
