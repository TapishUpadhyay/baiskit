import { useState } from "react"
import ProductCard from "./components/ProductCard"
import VendorCard from "./components/VendorCard"
import OrderCard from "./components/OrderCard"
import { products, sellers } from "./data/data"


function App() {
  const [cart, setCart] = useState([])
  const [page, setPage] = useState("home")
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [request, setRequest] = useState("")
const [budget, setBudget] = useState("")
const [quantity, setQuantity] = useState(1)
const [matches, setMatches] = useState([])
const [search, setSearch] = useState("")
const [orders, setOrders] = useState([])
const placeOrder = () => {
  if (cart.length === 0) return

  const newOrder = {
    id: orders.length + 1,
    products: [...cart],
    total: cart.reduce(
      (total, product) => total + product.price,
      0
    ),
    status: "Confirmed",
  }

  setOrders([...orders, newOrder])
  setCart([])
  setPage("orders")
}
const filteredProducts = products.filter((product) =>
  product.name.toLowerCase().includes(search.toLowerCase())
)
const findMatches = () => {
  const results = sellers.filter(
    (seller) =>
      seller.product.toLowerCase().includes(request.toLowerCase()) &&
      seller.price <= Number(budget)
  )

  setMatches(results)
}
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top Bar */}
      <header className="bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🛍️ Baiskit</h1>

          <button className="text-2xl">
            👤
          </button>
        </div>

        {/* Search */}
        <div className="mt-5">
         <input
  type="text"
  placeholder="Search on Baiskit..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 outline-none"
/>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-24">
        {page === "basket" ? (
  <section>
    <h2 className="mb-6 text-2xl font-bold">
      Your Basket 🛒
    </h2>

    {cart.length === 0 ? (
      <div className="rounded-2xl bg-white p-8 text-center">
        <p className="text-gray-500">
          Your basket is empty.
        </p>
      </div>
    ) : (
      <>
        <div className="space-y-4">
          {cart.map((product, index) => (
            <div
              key={`${product.id}-${index}`}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
            >
              <div>
                <h3 className="font-semibold">
                  {product.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {product.vendor}
                </p>
              </div>

              <p className="font-bold">
                ₹{product.price}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex justify-between">
            <span className="font-semibold">
              Total
            </span>

            <span className="text-xl font-bold">
              ₹{cart.reduce((total, product) => total + product.price, 0)}
            </span>
          </div>

          <button
            onClick={placeOrder}
            className="mt-5 w-full rounded-xl bg-black py-3 text-white"
          >
            Proceed to Checkout
          </button>
        </div>

        <button
          onClick={() => setPage("home")}
          className="mt-4 w-full rounded-xl border py-3"
        >
          ← Continue Shopping
        </button>
      </>
    )}
    </section>

) : page === "baiskit" ? (

  <section>
    <h2 className="text-2xl font-bold">
      Create Baiskit 🎯
    </h2>

    <p className="mt-2 text-gray-500">
      Tell us what you need and your budget.
    </p>

    <div className="mt-6 space-y-5">

      <div>
        <label className="mb-2 block font-semibold">
          What do you need?
        </label>
        <input
  type="text"
  placeholder="e.g. Wireless Earbuds"
  value={request}
  onChange={(e) => setRequest(e.target.value)}
  className="w-full rounded-xl border px-4 py-3"
/>

        
      </div>

      <div>
        <label className="mb-2 block font-semibold">
          Your Budget
        </label>

        <input
          type="number"
          placeholder="e.g. 1500"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full rounded-xl border px-4 py-3"
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold">
          Quantity
        </label>

        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          defaultValue="1"
          min="1"
          className="w-full rounded-xl border px-4 py-3"
        />
      </div>

      <button
  onClick={findMatches}
  className="w-full rounded-xl bg-black py-3 font-semibold text-white"
>
  Find My Matches
</button>

{matches.length > 0 && (
  <div className="mt-8">

    <h3 className="mb-4 text-xl font-bold">
      Your Matches 🎯
    </h3>

    <div className="space-y-4">

      {matches.map((seller) => (
        <div
          key={seller.id}
          className="rounded-2xl bg-white p-5 shadow-sm"
        >

          <div className="flex justify-between">

            <div>
              <h4 className="font-bold">
                {seller.name}
              </h4>

              <p className="text-sm text-gray-500">
                {seller.type}
              </p>
            </div>

            {seller.verified && (
              <span className="text-sm">
                ✓ Verified
              </span>
            )}

          </div>

          <div className="mt-4 flex items-center justify-between">

            <span className="text-xl font-bold">
              ₹{seller.price}
            </span>

            <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">
              Contact Seller
            </button>

          </div>

        </div>
      ))}

    </div>

  </div>
)}

    </div>

  </section>
  ) : page === "vendors" ? (

  <section>

  <h2 className="text-2xl font-bold">
    Local Vendors 🏪
  </h2>

  <p className="mt-2 text-gray-500">
    Discover trusted sellers near you.
  </p>

  <div className="mt-6 space-y-4">

    <VendorCard
      name="Rahul Electronics"
      type="Electronics"
      distance="0.4 km"
      rating="4.7"
      onView={() => {
        setSelectedVendor("Rahul Electronics")
        setPage("store")
      }}
    />

    <VendorCard
      name="Priya's Resale Store"
      type="Verified Resale"
      distance="0.8 km"
      rating="4.6"
      onView={() => {
        setSelectedVendor("Priya's Resale Store")
        setPage("store")
      }}
    />

    <VendorCard
      name="Tech World"
      type="Electronics"
      distance="1.2 km"
      rating="4.5"
      onView={() => {
        setSelectedVendor("Tech World")
        setPage("store")
      }}
    />

  </div>

</section>

  ) : page === "store" ? (
<section>

  <button
    onClick={() => setPage("vendors")}
    className="mb-6 rounded-lg border px-4 py-2"
  >
    ← Back to Vendors
  </button>

  <div className="rounded-2xl bg-white p-6 shadow-sm">

    <div className="flex items-center justify-between">

      <div>
        <h2 className="text-2xl font-bold">
          {selectedVendor}
        </h2>

        <p className="mt-2 text-gray-500">
          📍 Local Vendor
        </p>

        <p className="mt-1">
          ⭐ 4.7
        </p>
      </div>

      <span className="text-4xl">
        ✓
      </span>

    </div>

    <div className="mt-6">

      <h3 className="text-xl font-bold">
        About this Store
      </h3>

      <p className="mt-2 text-gray-500">
        Trusted seller on Baiskit with verified listings
        and competitive prices.
      </p>

    </div>

    <button className="mt-6 w-full rounded-xl bg-black py-3 text-white">
      Contact Seller
    </button>

  </div>

</section>

) : page === "orders" ? (
  <section>

  <h2 className="text-2xl font-bold">
    Your Orders 📦
  </h2>

  {orders.length === 0 ? (

    <div className="mt-6 rounded-2xl bg-white p-8 text-center">
      <p className="text-gray-500">
        No orders yet.
      </p>
    </div>

  ) : (

    <div className="mt-6 space-y-4">

      {orders.map((order) => (
  <OrderCard
    key={order.id}
    order={order}
  />
))}

    </div>

  )}

</section>

  // ORDERS PAGE
) : (

  <>


        {/* Categories */}
        <section>
          <h2 className="mb-4 text-xl font-bold">
            Categories
          </h2>

          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-xl bg-white p-4 text-center shadow-sm">
              📱
              <p className="mt-2 text-sm">Electronics</p>
            </div>

            <div className="rounded-xl bg-white p-4 text-center shadow-sm">
              👕
              <p className="mt-2 text-sm">Fashion</p>
            </div>

            <div className="rounded-xl bg-white p-4 text-center shadow-sm">
              🏠
              <p className="mt-2 text-sm">Home</p>
            </div>

            <div className="rounded-xl bg-white p-4 text-center shadow-sm">
              📚
              <p className="mt-2 text-sm">Books</p>
            </div>
          </div>
        </section>

        {/* Offers */}
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold">
            Offers
          </h2>

          <div className="rounded-2xl bg-black p-6 text-white">
            <p className="text-sm">Special Deal</p>
            <h3 className="mt-2 text-2xl font-bold">
              Flat 20% Off
            </h3>
            <p className="mt-2 text-gray-300">
              On selected electronics
            </p>

            <button className="mt-4 rounded-lg bg-white px-5 py-2 text-black">
              Shop Now
            </button>
          </div>
        </section>

        {/* Products */}
<section className="mt-8">
  <h2 className="mb-4 text-xl font-bold">
    Popular Products
  </h2>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

   {filteredProducts.map((product) => (
  <ProductCard
    key={product.id}
    product={product}
    onAdd={() => setCart([...cart, product])}
  />
))}
  

  </div>
</section>

        {/* Sale Nearby */}
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold">
            Sale Nearby
          </h2>

          <div className="space-y-3">

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">
                    Rahul Electronics
                  </h3>
                  <p className="text-sm text-gray-500">
                    0.4 km away
                  </p>
                </div>

                <span>📍</span>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">
                    Priya's Resale Store
                  </h3>
                  <p className="text-sm text-gray-500">
                    0.8 km away
                  </p>
                </div>

                <span>📍</span>
              </div>
            </div>

          </div>
        </section>
</>
)}
      </main>

      {/* Bottom Navigation */}
     <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg">
        <div className="mx-auto grid max-w-lg grid-cols-5 py-3 text-center text-xs">

         <button onClick={() => setPage("home")}>
  🏠
  <p>Home</p>
</button>

<button onClick={() => setPage("vendors")}>
  🏪
  <p>Vendors</p>
</button>

          <button onClick={() => setPage("baiskit")}>
  ➕
  <p>Create</p>
</button>

          <button onClick={() => setPage("basket")}>
  🛒
  <p>Basket ({cart.length})</p>
</button>

          <button onClick={() => setPage("orders")}>
  📦
  <p>Orders</p>
</button>
        </div>
      </nav>

    </div>
  )
}

export default App