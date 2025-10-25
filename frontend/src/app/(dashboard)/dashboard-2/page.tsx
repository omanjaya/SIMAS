'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard2RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return null; // Render nothing while redirecting
}
