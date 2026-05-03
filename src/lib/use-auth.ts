import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const { user, isLoaded } = useUser();
  const { signOut, openSignIn } = useClerk();
  const { getToken } = useClerkAuth();

  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? '',
        name:
          user.fullName ??
          user.firstName ??
          user.primaryEmailAddress?.emailAddress ??
          '',
      }
    : null;

  return {
    user: authUser,
    loading: !isLoaded,
    signIn: () => openSignIn({ fallbackRedirectUrl: '/dashboard' }),
    signOut: () => signOut(),
    getToken,
  };
}
