// src/app/page.tsx
"use client";

import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Import Button from shadcn/ui

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="p-4 text-center">Cargando...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      {user ? (
        <>
          <h2 className="text-2xl font-semibold">Bienvenido de nuevo, {user.email}!</h2>
          <Link href="/dashboard">
            <Button variant="primary">Ir al Dashboard</Button>
          </Link>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold">Bienvenido a Nebulin</h2>
          <p className="text-gray-600">
            Tu mercado de predicciones privado con amigos.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary">Registrarse</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
