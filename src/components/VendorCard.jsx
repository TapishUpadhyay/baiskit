export default function VendorCard({
  name,
  type,
  distance,
  rating,
  totalRatings,
  address,
  openNow,
  onView
}) {
  return (
    <div
      onClick={onView}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-950/5 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3">

        <div className="flex items-center gap-3.5 min-w-0">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 text-xl border border-indigo-100/60 text-indigo-600 shadow-inner group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            🏪
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              {name || "Nearby Store"}
            </h3>

            <p className="mt-0.5 text-xs font-medium text-slate-500 truncate">
              {type || "Local Store"}
            </p>
          </div>

        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold border ${
            openNow === true
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : openNow === false
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-slate-100 text-slate-500 border-slate-200"
          }`}
        >
          {openNow === true
            ? "Open Now"
            : openNow === false
            ? "Closed"
            : "Hours unavailable"}
        </span>

      </div>

      {address && (
        <p className="mt-3 text-[10px] leading-4 text-slate-500 line-clamp-2">
          📍 {address}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">

        {distance && (
          <div className="flex items-center gap-1 rounded-xl bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200/60">
            <span className="text-indigo-600">📍</span>
            <span>{distance}</span>
          </div>
        )}

        {rating !== null && rating !== undefined && (
          <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200/60">
            <span className="text-amber-500">★</span>
            <span>{rating}</span>

            {totalRatings > 0 && (
              <span className="text-[10px] font-medium text-amber-700/70">
                ({totalRatings})
              </span>
            )}
          </div>
        )}

      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">

        <span className="text-[11px] font-medium text-slate-400">
          Google Places
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onView?.()
          }}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md shadow-slate-900/10 group-hover:bg-indigo-600 group-hover:shadow-indigo-500/25 transition-all duration-200 active:scale-95"
        >
          <span>View on Maps</span>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>

      </div>
    </div>
  )
}