export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-slate-600 font-bold text-sm">Loading Sheggar Wheels...</p>
      <p className="text-slate-400 text-xs mt-1">Addis Ababa P2P Car Marketplace</p>
    </div>
  );
}
