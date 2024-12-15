// src/app/dashboard.tsx
"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button"; // Import Button from shadcn/ui
import Link from "next/link";

const DashboardPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <p className="p-4 text-center">Cargando...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-3xl font-bold">Bienvenido, {user?.email}!</h1>
      <p className="text-gray-600">Tu tablero personal está listo.</p>
      {/* Futuras funcionalidades como listar ligas y eventos */}
      <Link href="/create-league">
        <Button variant="primary">Crear Nueva Liga</Button>
      </Link>
    </div>
  );
};

export default DashboardPage;
