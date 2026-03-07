import { useEffect } from 'react';
import { useRouter } from 'next/router';

function RoleAccessRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/permissions');
  }, [router]);

  return null;
}

export default RoleAccessRedirect;
