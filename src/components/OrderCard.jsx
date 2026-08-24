export default function OrderCard({ order }) {
  const items = order.products || order.items || []

  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              #{order.id}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {order.date || "Just now"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Standard Express Delivery • {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700 border border-emerald-200 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{order.status || "Confirmed"}</span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-3 border border-slate-100">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
          <span className="text-indigo-600 flex items-center gap-1">
            <span>⚡</span> {order.estimatedDelivery || "Arriving Today, by 8:00 PM"}
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">On Schedule</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <div className="h-1.5 rounded-full bg-indigo-600"></div>
          <div className="h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
          <div className="h-1.5 rounded-full bg-slate-200"></div>
        </div>

        <div className="mt-1.5 flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
          <span className="text-indigo-600">Placed</span>
          <span className="text-indigo-600">Packed</span>
          <span>Out for Delivery</span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5 divide-y divide-slate-100">
        {items.map((product, index) => (
          <div
            key={`${product.id || index}-${index}`}
            className="flex items-center justify-between pt-2.5 first:pt-0"
          >
            <div className="flex items-center gap-3">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-10 w-10 rounded-xl object-cover border border-slate-100 shadow-xs"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-base">
                  📦
                </div>
              )}
              <div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                  {product.name}
                </h4>
                <p className="text-[10px] font-medium text-slate-400">
                  {product.vendor || "Verified Seller"} {product.qty ? `• Qty: ${product.qty}` : ""}
                </p>
              </div>
            </div>

            <span className="text-xs font-black text-slate-900">
              ₹{product.price * (product.qty || 1)}
            </span>
          </div>
        ))}
      </div>

      <div className="my-4 border-t border-dashed border-slate-200"></div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Paid</span>
          <p className="text-lg font-black text-slate-900 leading-none mt-0.5">
            ₹{order.total}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => alert(`Invoice for Order #${order.id} downloaded.`)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95"
          >
            Receipt
          </button>
          <button 
            type="button"
            onClick={() => alert(`Tracking package #${order.id}... Live GPS signal active.`)}
            className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-[11px] font-black text-white shadow-md hover:bg-slate-800 transition active:scale-95 flex items-center gap-1"
          >
            <span>Track</span>
            <span>📍</span>
          </button>
        </div>
      </div>
    </div>
  )
}
