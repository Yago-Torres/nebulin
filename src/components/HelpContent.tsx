export function HelpContent() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">How it Works</h2>
      
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2 dark:text-white">Sistema de Apuestas</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-800 dark:text-gray-300">
          <li>Cada evento tiene dos posibles resultados: Verdadero o Falso</li>
          <li>Puedes apostar nebulines a cualquier resultado</li>
          <li>Los pagos se calculan según el total de apuestas en cada lado</li>
          <li>Si ganas, recibes tu apuesta más una parte proporcional del pool perdedor</li>
          <li>Ejemplo: Si hay 100 nebulines en Verdadero y 200 en Falso:
            <ul className="list-circle pl-5 mt-1 text-gray-700 dark:text-gray-400">
              <li>Apostar a Verdadero paga tu apuesta + (tu apuesta/100 × 200)</li>
              <li>Apostar a Falso paga tu apuesta + (tu apuesta/200 × 100)</li>
            </ul>
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2 dark:text-white">Rewards</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-800 dark:text-gray-300">
          <li>If you bet correctly, you receive your bet amount × the payout ratio</li>
          <li>If you bet incorrectly, you lose your bet amount</li>
          <li>New users start with 100 coins</li>
        </ul>
      </section>
    </div>
  );
} 