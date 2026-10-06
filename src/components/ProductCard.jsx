import { useState } from "react"

export default function ProductCard({ product, onAdd }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const originalPrice =
    product.originalPrice || Math.round(product.price * 1.3)

  const discountPercent = Math.round(
    ((originalPrice - product.price) / originalPrice) * 100
  )

  const handleAdd = (e) => {
    e.stopPropagation()
    setIsAdding(true)
    onAdd?.(product)

    setTimeout(() => {
      setIsAdding(false)
    }, 600)
  }

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/70 bg-white p-3 shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_45px_rgba(79,70,229,0.12)]">

      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-slate-100">

        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />

        {/* Image overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Discount */}
        {discountPercent > 0 && (
          <div className="absolute left-2.5 top-2.5">
            <span className="inline-flex items-center rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white shadow-lg shadow-indigo-900/20">
              {discountPercent}% OFF
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          type="button"
          onClick={() => setIsLiked(!isLiked)}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 active:scale-90 ${
            isLiked
              ? "border-rose-200 bg-rose-50/95 shadow-sm"
              : "border-white/60 bg-white/90 shadow-sm hover:bg-white hover:scale-105"
          }`}
          title={isLiked ? "Remove from Wishlist" : "Save to Wishlist"}
          aria-label={isLiked ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <span
            className={`text-sm transition-transform duration-200 ${
              isLiked
                ? "scale-110 text-rose-500"
                : "text-slate-400 group-hover:text-slate-500"
            }`}
          >
            {isLiked ? "♥" : "♡"}
          </span>
        </button>
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col justify-between px-1 pt-3">

        <div>
          {/* Vendor + Rating */}
          <div className="flex items-center justify-between gap-2">

            <span className="min-w-0 truncate text-[10px] font-extrabold uppercase tracking-[0.08em] text-indigo-600">
              {product.vendor || "Verified Merchant"}
            </span>

            <span className="flex shrink-0 items-center gap-1 rounded-lg border border-amber-200/70 bg-amber-50 px-1.5 py-1 text-[10px] font-extrabold text-amber-700">
              <span className="text-[11px]">★</span>
              {product.rating || "4.5"}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="mt-2 line-clamp-2 min-h-[32px] text-sm font-extrabold leading-4 text-slate-900 transition-colors duration-200 group-hover:text-indigo-600">
            {product.name}
          </h3>

          {/* Optional condition */}
          {product.condition && (
            <div className="mt-2">
              <span className="inline-flex rounded-md bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-500 ring-1 ring-inset ring-slate-200/70">
                {product.condition}
              </span>
            </div>
          )}
        </div>

        {/* Price + Add */}
        <div className="mt-4 flex items-end justify-between gap-2 border-t border-slate-100 pt-3">

          <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-400 line-through">
              ₹{originalPrice}
            </p>

            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-lg font-black tracking-tight text-slate-950">
                ₹{product.price}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-extrabold shadow-sm transition-all duration-200 active:scale-95 ${
              isAdding
                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-slate-950 text-white hover:bg-indigo-600 hover:shadow-indigo-500/20"
            }`}
          >
            <span className="text-sm leading-none">
              {isAdding ? "✓" : "+"}
            </span>

            <span>
              {isAdding ? "Added" : "Add"}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}