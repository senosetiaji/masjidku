import TableNormal from '@/components/table/TableNormal';
import { __renderValue } from '@/lib/helpers/helper';
import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ModalConfirm from '@/components/modals/ModalConfirm';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import { deleteRole, getRoles } from '@/store/actions/roles.action';

function Roles() {
  const { data, isLoading, meta } = useSelector(state => state.roles);
  const deleteModalRef = React.useRef();
  const dispatch = useDispatch();
  const router = useRouter();
  const [params, setParams] = React.useState({
    page: 1,
    limit: 10,
    search: '',
  });

  const fetchData = React.useCallback(() => {
    dispatch(getRoles({ params }))
  }, [dispatch, params]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      label:"Title Role",
      align:"left",
      sx: {
        minWidth: 350,
      },
      render: (val) => __renderValue(val.name)
    },
    {
      label:"Description",
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
            <IconButton aria-label="edit" className='bg-yellow-400! text-white! hover:bg-yellow-500!' onClick={() => { router.push(`/settings/roles/edit/${val?.id}`) }}>
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
    await dispatch(deleteRole({ id }))
    fetchData();
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="title text-[20px] font-bold text-[#333]">Data Role</div>
        <Button variant="contained" color="primary" onClick={() => router.push('/settings/roles/create')} className="w-full sm:w-auto">
          Tambah Role
        </Button>
      </div>
      <TableNormal
        columns={columns}
        data={data}
        totalData={meta?.total_row || 0}
        totalPage={meta?.total_page || 1}
        limit={meta?.per_page || params.limit}
        page={params.page}
        params={params}
        setParams={setParams}
        isLoading={isLoading}
      />
      <ModalConfirm ref={deleteModalRef} description="Data yang sudah dihapus tidak dapat dikembalikan." onConfirm={(data) => handleDelete(data)} />
    </div>
  )
}

export default Roles
