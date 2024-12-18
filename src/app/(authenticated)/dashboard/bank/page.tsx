// src/app/dashboard/bank/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

interface Balance {
  balance: number;
}

interface LedgerEntry {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  timestamp: string;
}

export default function BankPage() {
  const { user, isLoading } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data on load
  useEffect(() => {
    if (!isLoading && user) {
      fetchBalance();
      fetchLedger();
    }
  }, [user, isLoading]);

  // Fetch current balance
  const fetchBalance = async () => {
    const { data, error } = await supabase
      .from<Balance>("users_balance")
      .select("balance")
      .eq("id", user?.id)
      .single();

    if (error) {
      console.error("Error fetching balance:", error);
      toast.error("Error al obtener el saldo.");
    } else {
      setBalance(data?.balance || 0);
    }
  };

  // Fetch user ledger history
  const fetchLedger = async () => {
    const { data, error } = await supabase
      .from<LedgerEntry>("ledger")
      .select("*")
      .eq("user_id", user?.id)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching ledger:", error);
      toast.error("Error al obtener el historial de transacciones.");
    } else {
      setLedger(data || []);
    }
  };

  if (isLoading || !user) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">Tu Banco</h1>

      {/* Display Balance */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Saldo Actual</h2>
        <p className="text-4xl font-bold text-green-600">{balance} nebulines</p>
      </div>

      {/* Ledger Table */}
      <h2 className="text-xl font-semibold mb-4">Historial de Transacciones</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">Fecha</th>
              <th className="p-3 border">Tipo</th>
              <th className="p-3 border">Descripción</th>
              <th className="p-3 border">Monto</th>
            </tr>
          </thead>
          <tbody>
            {ledger.length > 0 ? (
              ledger.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="p-3 border capitalize">{entry.type}</td>
                  <td className="p-3 border">{entry.description || "N/A"}</td>
                  <td
                    className={`p-3 border ${
                      entry.type === "deposit" || entry.type === "bet_win"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {entry.type === "withdraw" || entry.type === "bet_loss"
                      ? `- ${entry.amount} nebulines`
                      : `+ ${entry.amount} nebulines`}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 p-4">
                  No hay transacciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
