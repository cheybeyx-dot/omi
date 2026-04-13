export default function QuickActions() {
  const actions = [
    "Browse Tasks",
    "Withdraw Earnings",
    "Invite Friends",
    "Upgrade Tier",
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="font-semibold mb-4">Quick Actions</h2>

      <div className="space-y-3">
        {actions.map((a, i) => (
          <button
            key={i}
            className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-lg text-sm"
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}
