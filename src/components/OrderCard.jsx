function OrderCard({ order }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">

      <div className="flex justify-between">

        <h3 className="font-bold">
          Order #{order.id}
        </h3>

        <span className="text-sm">
          ✓ {order.status}
        </span>

      </div>

      <div className="mt-4 space-y-2">

        {order.products.map((product, index) => (
          <div
            key={`${product.id}-${index}`}
            className="flex justify-between text-sm"
          >
            <span>
              {product.name}
            </span>

            <span className="font-semibold">
              ₹{product.price}
            </span>
          </div>
        ))}

      </div>

      <div className="mt-4 flex justify-between border-t pt-4">

        <span className="font-semibold">
          Total
        </span>

        <span className="font-bold">
          ₹{order.total}
        </span>

      </div>

    </div>
  )
}

export default OrderCard