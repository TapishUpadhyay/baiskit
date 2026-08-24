export default function VendorCard({ name, type, distance, rating, onView }) {
  return (
    <div 
      onClick={onView}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-950/5 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 text-xl border border-indigo-100/60 text-indigo-600 shadow-inner group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            🏪
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                {name}
              </h3>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white shadow-xs">
                ✓
              </span>
            </div>

            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {type || "Verified Merchant"}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Open Now</span>
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200/60">
          <span className="text-indigo-600">📍</span>
          <span>{distance || "Nearby"}</span>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200/60">
          <span className="text-amber-500">★</span>
          <span>{rating || "4.8"}</span>
          <span className="text-[10px] font-medium text-amber-700/80">(120+)</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
        <span className="text-[11px] font-medium text-slate-400">
          ⚡ Express 15-min pickup
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onView?.()
          }}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md shadow-slate-900/10 group-hover:bg-indigo-600 group-hover:shadow-indigo-500/25 transition-all duration-200 active:scale-95"
        >
          <span>View Store</span>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </button>
      </div>
    </div>
  )
}
