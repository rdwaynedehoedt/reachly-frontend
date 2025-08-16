import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthRedirect = () => {
  const router = useRouter();
  const { needsOnboarding } = useAuth();

  const redirectAfterAuth = () => {
    if (needsOnboarding) {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }
  };

  
  return { redirectAfterAuth, needsOnboarding };
};

export const getRedirectPath = (user: { onboardingCompleted?: boolean } | null): string => {
  if (!user) return '/login';
  if (!user.onboardingCompleted) return '/onboarding';
  return '/dashboard';
};