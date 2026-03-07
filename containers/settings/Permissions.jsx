import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getSettingsPermissions,
  updateSettingsPermissions,
} from '@/store/actions/settingsPermissions.action';

function Permissions() {
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const dispatch = useDispatch();
  const {
    roles,
    catalog,
    rolePermissionsMap,
    isLoading: loading,
    isSaving: saving,
  } = useSelector((state) => state.settingsPermissions);

  const [selectedRole, setSelectedRole] = React.useState('');
  const [selectedPermissions, setSelectedPermissions] = React.useState(new Set());

  React.useEffect(() => {
    dispatch(getSettingsPermissions());
  }, [dispatch]);

  React.useEffect(() => {
    if (!selectedRole && roles.length > 0) {
      const initialRole = roles[0].name;
      setSelectedRole(initialRole);
      setSelectedPermissions(new Set(rolePermissionsMap[initialRole] || []));
    }
  }, [roles, rolePermissionsMap, selectedRole]);

  const handleRoleChange = (event) => {
    const roleName = event.target.value;
    setSelectedRole(roleName);
    setSelectedPermissions(new Set(rolePermissionsMap[roleName] || []));
    setSuccess('');
    setError('');
  };

  const togglePermission = (permissionName) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permissionName)) {
        next.delete(permissionName);
      } else {
        next.add(permissionName);
      }
      return next;
    });
  };

  const toggleGroupPermissions = (groupPermissions) => {
    const names = groupPermissions.map((item) => item.name);
    const allChecked = names.every((name) => selectedPermissions.has(name));

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (allChecked) {
        names.forEach((name) => next.delete(name));
      } else {
        names.forEach((name) => next.add(name));
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;

    setError('');
    setSuccess('');

    try {
      const payload = {
        roleName: selectedRole,
        permissions: Array.from(selectedPermissions),
      };

      await dispatch(updateSettingsPermissions({ payload })).unwrap();

      setSuccess(`Permissions untuk role ${selectedRole} berhasil disimpan.`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menyimpan permissions.');
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[20px] font-bold text-[#333]">Pengaturan Permissions</div>
          <div className="text-[13px] text-gray-500">Atur hak akses menu dan halaman per role.</div>
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading || saving || !selectedRole}
          className="w-full sm:w-auto"
        >
          {saving ? 'Menyimpan...' : 'Simpan Permissions'}
        </Button>
      </div>

      {error && <Alert severity="error" className="mb-4">{error}</Alert>}
      {success && <Alert severity="success" className="mb-4">{success}</Alert>}

      {loading ? (
        <div className="py-10 flex justify-center">
          <CircularProgress size={28} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-lg border border-gray-200 bg-[#fbfbfb]">
            <Typography variant="subtitle2" className="mb-2">Pilih Role</Typography>
            <FormControl size="small" fullWidth>
              <Select value={selectedRole} onChange={handleRoleChange}>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.name}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {catalog.map((group) => {
            const groupPermissions = group.permissions || [];
            const total = groupPermissions.length;
            const selectedCount = groupPermissions.filter((item) => selectedPermissions.has(item.name)).length;
            const allChecked = total > 0 && selectedCount === total;

            return (
              <Box key={group.key} className="p-4 rounded-lg border border-gray-200 bg-white">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                  <div>
                    <Typography variant="subtitle1" className="font-semibold">{group.label}</Typography>
                    <Typography variant="caption" className="text-gray-500">
                      {selectedCount}/{total} permission dipilih
                    </Typography>
                  </div>
                  <Button variant="outlined" size="small" onClick={() => toggleGroupPermissions(groupPermissions)}>
                    {allChecked ? 'Uncheck Semua' : 'Check Semua'}
                  </Button>
                </div>

                <FormGroup>
                  {groupPermissions.map((permission) => (
                    <FormControlLabel
                      key={permission.name}
                      control={
                        <Checkbox
                          checked={selectedPermissions.has(permission.name)}
                          onChange={() => togglePermission(permission.name)}
                        />
                      }
                      label={
                        <div>
                          <div className="text-[13px] font-medium text-gray-700">{permission.name}</div>
                          <div className="text-[12px] text-gray-500">{permission.description}</div>
                        </div>
                      }
                    />
                  ))}
                </FormGroup>
              </Box>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Permissions;
