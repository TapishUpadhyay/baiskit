function ProductCard({ product, onAdd }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">

      <div className="h-32 overflow-hidden rounded-xl bg-gray-100">
  <img
    src={product.image}
    alt={product.name}
    className="h-full w-full object-cover"
  />
</div>

      <h3 className="mt-3 font-semibold">
        {product.name}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {product.vendor}
      </p>

      <div className="mt-2 flex items-center justify-between">

        <p className="font-bold">
          ₹{product.price}
        </p>

        <p className="text-sm">
          ⭐ {product.rating}
        </p>

      </div>

      <button
        onClick={onAdd}
        className="mt-3 w-full rounded-lg bg-black py-2 text-sm text-white"
      >
        Add to Basket
      </button>

    </div>
  )
}

export default ProductCard