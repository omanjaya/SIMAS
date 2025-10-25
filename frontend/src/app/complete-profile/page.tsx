'use client';

import { Header } from '@/components/layout/header';
import CompleteProfileForm from '@/components/profile/complete-profile-form';

export default function CompleteProfilePage() {
  return (
    <>
      <Header />
      <div className="p-6">
        <CompleteProfileForm />
      </div>
    </>
  );
}