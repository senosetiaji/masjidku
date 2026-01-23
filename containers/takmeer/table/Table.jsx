import TableNormal from '@/components/table/TableNormal';
import { __renderValue, __renderValueDefaultZero } from '@/lib/helpers/helper';
import moment from 'moment';
import React from 'react'
import { useSelector } from 'react-redux';
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function Table({ source, params, setParams }) {
  const { data, isLoading, meta } = useSelector(state => state.user);
  const tipe = params?.tipe || 'kontrak';

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
      label:"Nama Lengkap",
      align:"left",
      sx: {
        minWidth: 350,
      },
      render: (val) => __renderValue(val.name)
    },
    {
      label:"Jabatan",
      align:"left",
      sx: {
        minWidth: 350,
      },
      render: (val) => __renderValue(val.jabatan)
    },
    {
      label:"Nomor Telepon",
      align:"left",
      sx: {
        minWidth: 350,
      },
      render: (val) => __renderValue(val.phone)
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
            <IconButton aria-label="edit" className='bg-yellow-400! text-white! hover:bg-yellow-500!' onClick={() => {}}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="delete" className='bg-red-400! text-white! hover:bg-red-500!' onClick={() => {}}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        )
      }
    },
  ]

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
    </div>
  )
}

export default Table
