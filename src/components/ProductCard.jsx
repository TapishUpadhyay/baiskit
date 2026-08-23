import { useState } from "react"

export default function ProductCard({ product, onAdd }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const originalPrice = product.originalPrice || Math.round(product.price * 1.3)
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100)

  const handleAdd = (e) => {
    e.stopPropagation()
    setIsAdding(true)
    onAdd?.(product)
    setTimeout(() => setIsAdding(false), 500)
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-3.5 shadow-sm hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {discountPercent > 0 && (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black tracking-wide text-white shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        <button
          type="button"
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-xs shadow-sm hover:scale-110 active:scale-90 transition-all"
          title="Save to Wishlist"
        >
          <span className={isLiked ? "text-rose-500 scale-110" : "text-slate-400"}>
            {isLiked ? "❤️" : "🤍"}
          </span>
        </button>
      </div>

      <div className="mt-3 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-600 text-[11px] line-clamp-1">
              {product.vendor || "Verified Merchant"}
            </span>
            <span className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200/60">
              <span>★</span>
              <span>{product.rating || "4.5"}</span>
            </span>
          </div>

          <h3 className="mt-1.5 font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-[10px] line-through font-medium text-slate-400">
              ₹{originalPrice}
            </p>
            <p className="text-base font-black text-slate-900 leading-none">
              ₹{product.price}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm ${
              isAdding
                ? "bg-emerald-600 text-white scale-95 shadow-emerald-500/20"
                : "bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-indigo-500/25"
            }`}
          >
            <span>{isAdding ? "✓" : "+"}</span>
            <span>{isAdding ? "Added" : "Add"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
