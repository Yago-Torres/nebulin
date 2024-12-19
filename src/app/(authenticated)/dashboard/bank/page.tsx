// src/app/dashboard/bank/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

type LedgerTransactionType = 
  | "DEPOSIT"        // Depósito de dinero
  | "WITHDRAW"       // Retiro de dinero
  | "BET_PLACED"     // Apuesta realizada
  | "BET_WIN"        // Ganancia de apuesta
  | "BET_LOSS";      // Pérdida de apuesta

interface Balance {
  balance: number;
}

interface LedgerEntry {
  id: string;
  type: LedgerTransactionType;
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

  const getAmountDisplay = (entry: LedgerEntry) => {
    // Depósitos y ganancias en verde
    if (entry.type === "DEPOSIT" || entry.type === "BET_WIN") {
      return {
        color: "text-green-600",
        text: `+ ${entry.amount} nebulines`
      };
    }
    
    // Apuestas y retiros en rojo, sin signo para apuestas
    if (entry.type === "BET_PLACED") {
      return {
        color: "text-red-600",
        text: `${entry.amount} nebulines`
      };
    }
    
    // Retiros y pérdidas con signo negativo
    return {
      color: "text-red-600",
      text: `- ${entry.amount} nebulines`
    };
  };


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Tu Banco</h1>

      {/* Display Balance */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold dark:text-white">Saldo Actual</h2>
        <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">{balance} nebulines</p>
      </div>

      {/* Ledger Table */}
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Historial de Transacciones</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="p-3 border border-gray-200 dark:border-gray-600 dark:text-gray-200">Fecha</th>
              <th className="p-3 border border-gray-200 dark:border-gray-600 dark:text-gray-200">Tipo</th>
              <th className="p-3 border border-gray-200 dark:border-gray-600 dark:text-gray-200">Descripción</th>
              <th className="p-3 border border-gray-200 dark:border-gray-600 dark:text-gray-200">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {ledger.length > 0 ? (
              ledger.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-3 border border-gray-200 dark:border-gray-600 dark:text-gray-200">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-600 dark:text-gray-200 capitalize">
                    {entry.type}
                  </td>
                  <td className="p-3 border border-gray-200 dark:border-gray-600 dark:text-gray-200">
                    {entry.description || "N/A"}
                  </td>
                  <td className={`p-3 border border-gray-200 dark:border-gray-600 ${getAmountDisplay(entry).color}`}>
                    {getAmountDisplay(entry).text}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 dark:text-gray-400 p-4">
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
