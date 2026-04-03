import TableNormal from '@/components/table/TableNormal';
import ModalConfirm from '@/components/modals/ModalConfirm';
import { __renderValue } from '@/lib/helpers/helper';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import React from 'react'
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { deletePanitiaZakat } from '@/store/actions/panitiaZakat.action';
import { useActionPermissionGuard } from '@/lib/hooks/useActionPermissionGuard';

function Table({ params, setParams, fetchData }) {
  const { data, isLoading, meta } = useSelector(state => state.panitiaZakat);
  const dispatch = useDispatch();
  const router = useRouter();
  const deleteModalRef = React.useRef();
  const { guardAction } = useActionPermissionGuard();

  const renderRoleLabel = (value) => {
    if (!value) return '-';
    const normalized = String(value).toLowerCase();
    if (normalized === 'ketua') return 'Ketua';
    if (normalized === 'bendahara') return 'Bendahara';
    if (normalized === 'amil') return 'Amil';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  const columns = [
    {
      label: "No",
      align: "center",
      sx: { width: 50 },
      render: (val, index) => index + 1 + ((params.page - 1) * params.limit),
    },
    {
      label: "Nama Panitia",
      align: "left",
      sx: { minWidth: 250 },
      render: (val) => __renderValue(val.name)
    },
    {
      label: "No. Telepon",
      align: "left",
      sx: { minWidth: 180 },
      render: (val) => __renderValue(val.phone)
    },
    {
      label: "Masa Kerja (Tahun)",
      align: "center",
      sx: { minWidth: 180 },
      render: (val) => val?.serviceYear ?? '-'
    },
    {
      label: "Peran",
      align: "left",
      sx: { minWidth: 180 },
      render: (val) => renderRoleLabel(val.role)
    },
    {
      label: "Dibuat",
      align: "center",
      sx: { minWidth: 160 },
      render: (val) => val?.createdAt ? moment(val.createdAt).format('DD MMM YYYY') : '-'
    },
    {
      label: "Aksi",
      align: "center",
      sx: { width: 160 },
      render: (val) => {
        return (
          <div className='flex gap-2 w-full justify-center'>
            <IconButton aria-label="edit" className='bg-yellow-400! text-white! hover:bg-yellow-500!' onClick={() => guardAction({ action: 'update', permission: '/zakat/panitia/edit', onAllowed: () => router.push(`/zakat/panitia/edit/${val?.id}`) })}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="delete" className='bg-red-400! text-white! hover:bg-red-500!' onClick={() => guardAction({ action: 'delete', permission: ['/zakat/panitia/delete', '/zakat/panitia/edit'], onAllowed: () => deleteModalRef.current.open(val?.id) })}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        )
      }
    },
  ]

  async function handleDelete(id) {
    await dispatch(deletePanitiaZakat({ id: id, params: {} }))
    fetchData();
  }

  return (
    <div>
      <TableNormal
        columns={columns}
        data={data}
        totalData={meta?.total_row}
        totalPage={meta?.total_page}
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
