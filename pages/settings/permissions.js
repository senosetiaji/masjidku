import RootLayout from '@/components/layouts/RootLayout';
import { Permissions } from '@/containers/settings';
import React from 'react';

function PermissionsPage() {
  const breadcrumbs = [
    { label: 'Settings', link: '/settings/permissions', isDisabled: true },
    { label: 'Permissions', link: '/settings/permissions', isDisabled: true },
  ];

  return (
    <RootLayout breadcrumbs={breadcrumbs}>
      <Permissions />
    </RootLayout>
  );
}

export default PermissionsPage;
