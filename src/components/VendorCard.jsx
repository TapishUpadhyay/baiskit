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
      className="group relative cursor-pointer overflow-hidden rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_45px_rgba(79,70,229,0.11)]"
    >
      {/* Subtle hover glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-100/40 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">

          {/* Store Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-xl shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-indigo-200 group-hover:bg-indigo-600">
            <span className="transition-transform duration-300 group-hover:scale-110 group-hover:grayscale group-hover:brightness-0 group-hover:invert">
              🏪
            </span>
          </div>

          {/* Store Info */}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-extrabold text-slate-900 transition-colors duration-200 group-hover:text-indigo-600">
              {name || "Nearby Store"}
            </h3>

            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
              {type || "Local Store"}
            </p>
          </div>
        </div>

        {/* Open Status */}
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-extrabold tracking-wide ${
            openNow === true
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : openNow === false
              ? "border-rose-200 bg-rose-50 text-rose-600"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          {openNow === true
            ? "● Open"
            : openNow === false
            ? "● Closed"
            : "Hours unavailable"}
        </span>
      </div>

      {/* Address */}
      {address && (
        <div className="relative mt-4 flex gap-2 rounded-xl bg-slate-50/80 px-3 py-2.5 ring-1 ring-inset ring-slate-100">
          <span className="mt-0.5 shrink-0 text-xs">📍</span>

          <p className="line-clamp-2 text-[10px] font-medium leading-4 text-slate-500">
            {address}
          </p>
        </div>
      )}

      {/* Store Stats */}
      <div className="relative mt-4 flex flex-wrap items-center gap-2">

        {distance && (
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/70 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm">
            <span className="text-indigo-500">⌖</span>
            <span>{distance}</span>
          </div>
        )}

        {rating !== null && rating !== undefined && (
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-200/70 bg-amber-50 px-2.5 py-1.5 text-[10px] font-extrabold text-amber-800">
            <span className="text-amber-500">★</span>
            <span>{rating}</span>

            {totalRatings > 0 && (
              <span className="font-medium text-amber-700/60">
                ({totalRatings})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5">

        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[9px]">
            G
          </span>
          <span>Google Places</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onView?.()
          }}
          className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-[10px] font-extrabold text-white shadow-sm shadow-slate-900/10 transition-all duration-200 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
        >
          <span>View on Maps</span>

          <span className="text-sm leading-none transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>
    </div>
  )
}