export function HelpContent() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">How it Works</h2>
      
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Betting System</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>Each event has two possible outcomes: True or False</li>
          <li>You can bet coins on either outcome</li>
          <li>Payouts are calculated based on the total bets on each side</li>
          <li>The payout ratio = (Opposite side total / Your side total) + 1</li>
          <li>Example: If True has 100 coins and False has 200 coins:
            <ul className="list-circle pl-5 mt-1">
              <li>Betting on True pays 3x (200/100 + 1)</li>
              <li>Betting on False pays 1.5x (100/200 + 1)</li>
            </ul>
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Rewards</h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>If you bet correctly, you receive your bet amount × the payout ratio</li>
          <li>If you bet incorrectly, you lose your bet amount</li>
          <li>New users start with 100 coins</li>
        </ul>
      </section>
    </div>
  );
} 