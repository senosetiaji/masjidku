import { getTokenFromCookie, verifySessionToken } from '@/lib/helpers/apiSessionAuth'
import { getTenantPrisma } from '@/lib/helpers/tenantPrisma'

export async function redirectAuthenticatedUser(context, destination = '/dashboard') {
  try {
    const cookieHeader = context?.req?.headers?.cookie || '';
    const token = getTokenFromCookie(cookieHeader);
    const session = verifySessionToken(token);

    if (!session?.id) {
      return { props: {} };
    }

    const { prisma, tenant } = getTenantPrisma(context.req);

    if (session?.tenant && session.tenant !== tenant.tenantKey) {
      return { props: {} };
    }

    const user = await prisma.user.findUnique({
      where: { id: String(session.id) },
      select: { id: true },
    });

    if (!user) {
      return { props: {} };
    }

    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  } catch (error) {
    return { props: {} };
  }
}