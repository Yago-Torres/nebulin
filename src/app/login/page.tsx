// src/app/login/page.tsx
'use client';

import { useRouter } from 'next/navigation'; // Correct import for App Router
import LoginForm from '@/components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/dashboard');  // Correct usage of navigation
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Iniciar Sesión</h1>
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default LoginPage;
