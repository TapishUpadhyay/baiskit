function VendorCard({ name, type, distance, rating, onView }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">

      <div className="flex justify-between">

        <div>
          <h3 className="font-bold">
            {name}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {type} • {distance} away
          </p>
        </div>

        <span>
          ✓
        </span>

      </div>

      <div className="mt-4 flex justify-between">

        <span className="text-sm">
          ⭐ {rating}
        </span>

        <button
          onClick={onView}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          View Store
        </button>

      </div>

    </div>
  )
}

export default VendorCard