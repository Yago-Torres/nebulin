// src/app/signup/page.tsx
'use client';

import { useRouter } from 'next/navigation'; // Correct import for App Router
import SignupForm from '@/components/auth/SignupForm';

const SignupPage: React.FC = () => {
  const router = useRouter();

  const handleSignup = () => {
    router.push('/dashboard');  // Navigate after signup
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Registrarse</h1>
      <SignupForm onSignup={handleSignup} />
    </div>
  );
};

export default SignupPage;
