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
import { deleteDataPamKas, deleteDataPamPemasangan } from '@/store/actions/pam.action';

function Table({ params, setParams, fetchData }) {
  const { installation, isLoading } = useSelector(state => state.pam);
  const { data = [], meta } = installation ;
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
      render: (val) => val?.pelangganName ?? '-'
    },
    {
      label:"Pembayaran Kredit",
      align:"center",
      sx: {
        minWidth: 350,
      },
      children: [
        {
          label: "Angsuran Ke-1",
          align: "center",
          sx: {
            minWidth: 200,
          },
          render: (val) => formatRupiah(val?.payments?.[0]?.amount),
        },
        {
          label: "Angsuran Ke-2",
          align: "center",
          sx: {
            minWidth: 200,
          },
          render: (val) => formatRupiah(val?.payments?.[1]?.amount),
        },
        {
          label: "Angsuran Ke-3",
          align: "center",
          sx: {
            minWidth: 200,
          },
          render: (val) => formatRupiah(val?.payments?.[2]?.amount),
        },
        {
          label: "Angsuran Ke-4",
          align: "center",
          sx: {
            minWidth: 200,
          },
          render: (val) => formatRupiah(val?.payments?.[3]?.amount),
        },
        {
          label: "Angsuran Ke-5",
          align: "center",
          sx: {
            minWidth: 200,
          },
          render: (val) => formatRupiah(val?.payments?.[4]?.amount),
        },
        {
          label: "Angsuran Ke-6",
          align: "center",
          sx: {
            minWidth: 200,
          },
          render: (val) => formatRupiah(val?.payments?.[5]?.amount),
        },
      ]
    },
    {
      label:"Total Pembayaran (A)",
      align:"center",
      sx: {
        minWidth: 250,
      },
      render: (val) => {
        const totalPayment = val?.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
        return formatRupiah(totalPayment);
      }
    },
    {
      label:"Total Tagihan (B)",
      align:"center",
      sx: {
        minWidth: 250,
      },
      render: (val) => {
        const installationBill = val?.installationBill || 0;
        return formatRupiah(installationBill);
      }
    },
    {
      label:"Tagihan Yang Harus Dibayar (B-A)",
      align:"center",
      sx: {
        minWidth: 250,
      },
      render: (val) => {
        if(!val?.billsToPay || val?.billsToPay <= 0) return <div className='text-emerald-600 uppercase font-bold'>Lunas</div>;
        return (
          <div className="text-red-600 font-bold">{formatRupiah(val.billsToPay)}</div>
        )
      }
    },
    {
      label:"Aksi",
      align:"center",
      sx: {
        width: 150,
      },
      render: (val) => {
        return (
          <div className='flex gap-2 w-full justify-center'>
            <IconButton aria-label="edit" className='bg-yellow-400! text-white! hover:bg-yellow-500!' onClick={() => { router.push(`/pam/pemasangan/edit/${val?.id}`) }}>
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
    const res = await dispatch(deleteDataPamPemasangan({ id: id, params: {} }))
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
