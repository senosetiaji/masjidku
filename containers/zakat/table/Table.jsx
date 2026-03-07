import TableNormal from '@/components/table/TableNormal';
import { __renderValue } from '@/lib/helpers/helper';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ModalConfirm from '@/components/modals/ModalConfirm';
import { useRouter } from 'next/router';
import { deleteZakat } from '@/store/actions/zakat.action';
import moment from 'moment';
import { dataNotAvailable } from '@/lib/helpers/emptyDataHandler';

function Table({ source, params, setParams, fetchData }) {
  const { data, isLoading, meta } = useSelector(state => state.zakat);
  const deleteModalRef = React.useRef();
  const dispatch = useDispatch();
  const router = useRouter();

  const renderTypeLabel = (value) => {
    if (!value) return dataNotAvailable();
    const normalized = String(value).toLowerCase();
    if (normalized === 'fitrah') return 'Fitrah';
    if (normalized === 'mal') return 'Mal';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  const renderZakatTypeLabel = (value) => {
    if (!value) return dataNotAvailable();
    const normalized = String(value).toLowerCase();
    if (normalized === 'uang') return 'Uang';
    if (normalized === 'beras') return 'Beras';
    if (normalized === 'lainnya' || normalized === 'lain-lain') return 'Lain-lain';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  const renderCurrencyDecimal = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return dataNotAvailable();
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  }

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
      label:"Muzzaki/Pemberi Zakat",
      align:"left",
      render: (val) => __renderValue(val.name)
    },
    {
      label:"Tanggal",
      align:"left",
      render: (val) => val?.date ? moment(val.date).format('DD MMM YYYY') : '-'
    },
    {
      label:"Zakat(Fitrah/Mal)",
      align:"left",
      render: (val) => renderTypeLabel(val?.type)
    },
    {
      label:"Bentuk Zakat",
      align:"left",
      render: (val) => renderZakatTypeLabel(val?.zakatType)
    },
    {
      label:"Jumlah Zakat",
      align:"center",
      render: (val) => {
        const zakatType = String(val?.zakatType || "").toLowerCase();
        return (
          <div className="">
            {zakatType === 'uang' ? renderCurrencyDecimal(val?.amount) : val?.amount ? `${val.amount} Kg` : dataNotAvailable()}
          </div>
        )
      }
    },
    {
      label:"Keterangan",
      align:"left",
      render: (val) => __renderValue(val.description)
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
            <IconButton aria-label="edit" className='bg-yellow-400! text-white! hover:bg-yellow-500!' onClick={() => { router.push(`/zakat/edit/${val?.id}`) }}>
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
    await dispatch(deleteZakat({ id: id, params: {} }))
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
