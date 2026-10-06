export default function OrderCard({ order }) {
  const items = order.products || order.items || []

  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-slate-200/70 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_45px_rgba(79,70,229,0.10)]">

      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-100/40 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Order Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 font-mono text-[10px] font-black tracking-wider text-indigo-600">
              #{order.id}
            </span>

            <span className="text-[10px] font-semibold text-slate-400">
              {order.date || "Just now"}
            </span>
          </div>

          <p className="mt-2 text-[10px] font-semibold text-slate-500">
            Standard Express Delivery
            <span className="mx-1.5 text-slate-300">•</span>
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Status */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[9px] font-extrabold tracking-wide text-emerald-700">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>

          {order.status || "Confirmed"}
        </div>
      </div>

      {/* Delivery Progress */}
      <div className="relative mt-5 rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 p-3.5">

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs">
              ⚡
            </span>

            <span className="truncate text-[10px] font-extrabold text-indigo-700">
              {order.estimatedDelivery || "Arriving Today, by 8:00 PM"}
            </span>
          </div>

          <span className="shrink-0 text-[8px] font-extrabold uppercase tracking-widest text-emerald-600">
            On Schedule
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <div className="h-1.5 rounded-full bg-indigo-600" />
          <div className="relative h-1.5 overflow-hidden rounded-full bg-indigo-600">
            <div className="absolute inset-0 animate-pulse bg-white/30" />
          </div>
          <div className="h-1.5 rounded-full bg-slate-200" />
        </div>

        <div className="mt-2 flex justify-between text-[8px] font-extrabold uppercase tracking-wider">
          <span className="text-indigo-600">Placed</span>
          <span className="text-indigo-600">Packed</span>
          <span className="text-slate-400">Out for Delivery</span>
        </div>
      </div>

      {/* Products */}
      <div className="relative mt-5 space-y-0">
        {items.map((product, index) => (
          <div
            key={`${product.id || index}-${index}`}
            className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 first:pt-0 last:border-b-0 last:pb-0"
          >
            <div className="flex min-w-0 items-center gap-3">

              {/* Product Image */}
              {product.image ? (
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-sm">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-base">
                  📦
                </div>
              )}

              {/* Product Details */}
              <div className="min-w-0">
                <h4 className="line-clamp-1 text-[11px] font-extrabold text-slate-800">
                  {product.name}
                </h4>

                <p className="mt-0.5 truncate text-[9px] font-medium text-slate-400">
                  {product.vendor || "Verified Seller"}

                  {product.qty && (
                    <>
                      <span className="mx-1 text-slate-300">•</span>
                      Qty: {product.qty}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Item Price */}
            <span className="shrink-0 text-xs font-black text-slate-900">
              ₹{product.price * (product.qty || 1)}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-dashed border-slate-200" />

      {/* Footer */}
      <div className="relative flex items-end justify-between gap-3">

        {/* Total */}
        <div>
          <span className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Total Paid
          </span>

          <p className="mt-1 text-xl font-black leading-none tracking-tight text-slate-950">
            ₹{order.total}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={() =>
              alert(`Invoice for Order #${order.id} downloaded.`)
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-extrabold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:text-slate-900 active:scale-95"
          >
            Receipt
          </button>

          <button
            type="button"
            onClick={() =>
              alert(`Tracking package #${order.id}... Live GPS signal active.`)
            }
            className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-[10px] font-extrabold text-white shadow-sm shadow-slate-900/10 transition-all duration-200 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
          >
            <span>Track</span>
            <span className="text-xs">⌖</span>
          </button>
        </div>
      </div>
    </div>
  )
}