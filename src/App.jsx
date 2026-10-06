import { useState, useRef } from "react"
import ProductCard from "./components/ProductCard"
import VendorCard from "./components/VendorCard"
import OrderCard from "./components/OrderCard"
import {
  products as initialProducts,
  sellers as initialSellers
} from "./data/data"

export default function App() {
  const [products] = useState(initialProducts || [])
  const [sellers] = useState(initialSellers || [])

  const [cart, setCart] = useState([])
  const [page, setPage] = useState("home")
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Demand
  const [request, setRequest] = useState("")
  const [budget, setBudget] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [matches, setMatches] = useState([])

  // Search / Orders / Promo
  const [search, setSearch] = useState("")
  const [orders, setOrders] = useState([])
  const [promoCode, setPromoCode] = useState("")
  const [discountPercent, setDiscountPercent] = useState(0)
  const [toast, setToast] = useState(null)

  // Backend comparison
  const [apiResults, setApiResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  const toastTimerRef = useRef(null)

  // --------------------------------------------------
  // Toast
  // --------------------------------------------------

  const showToast = (msg) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }

    setToast(msg)

    toastTimerRef.current = setTimeout(() => {
      setToast(null)
    }, 2500)
  }

  // --------------------------------------------------
  // Get User Location
  // --------------------------------------------------

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        showToast("Location is not supported by this browser")
        reject(new Error("Geolocation not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }

          setUserLocation(location)
          resolve(location)
        },
        () => {
          showToast(
            "Please allow location access to compare nearby prices"
          )
          reject(new Error("Location permission denied"))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    })
  }

  // --------------------------------------------------
  // Baiskit Search
  // --------------------------------------------------

  const searchBaiskit = async () => {
    if (!search.trim()) {
      showToast("Please enter a product to search")
      return
    }

    setIsLoading(true)
    setPage("home")

    try {
      let location = userLocation

      if (!location) {
        location = await getUserLocation()
      }

      const response = await fetch(
        `https://baiskit.onrender.com/api/search?product=${encodeURIComponent(
          search.trim()
        )}&lat=${location.lat}&lng=${location.lng}`
      )

      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.success) {
        setApiResults(null)

        showToast(
          data?.message || "No comparison found for this product"
        )

        return
      }

      setApiResults(data)

      if (!data.priceResults?.length) {
        showToast("No live prices found yet")
      }
    } catch (error) {
      console.error("Baiskit API error:", error)

      setApiResults(null)

      if (
        error.message === "Location permission denied" ||
        error.message === "Geolocation not supported"
      ) {
        return
      }

      showToast("Unable to connect to Baiskit right now")
    } finally {
      setIsLoading(false)
    }
  }

  // --------------------------------------------------
  // Clear Search
  // --------------------------------------------------

  const clearSearch = () => {
    setSearch("")
    setApiResults(null)
  }

  // --------------------------------------------------
  // Cart
  // --------------------------------------------------

  const addToCart = (product) => {
    const existing = cart.find(
      (item) => item.id === product.id
    )

    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: (item.qty || 1) + 1
              }
            : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          ...product,
          qty: 1
        }
      ])
    }

    showToast(`Added ${product.name} to Basket!`)
  }

  const updateCartQty = (id, delta) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                qty: (item.qty || 1) + delta
              }
            : item
        )
        .filter((item) => item.qty > 0)
    )
  }

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id))
    showToast("Item removed from basket")
  }

  // --------------------------------------------------
  // Promo
  // --------------------------------------------------

  const applyPromo = () => {
    if (
      promoCode.trim().toUpperCase() ===
      "BAISKIT20"
    ) {
      setDiscountPercent(0.2)
      showToast("🎉 20% Discount Activated!")
    } else {
      showToast("❌ Invalid Promo Code")
    }
  }

  // --------------------------------------------------
  // Cart Calculations
  // --------------------------------------------------

  const subtotal = cart.reduce(
    (sum, item) =>
      sum +
      (Number(item.price) || 0) *
        (item.qty || 1),
    0
  )

  const discountAmount =
    subtotal * discountPercent

  const grandTotal = Math.max(
    0,
    subtotal - discountAmount
  )

  // --------------------------------------------------
  // Order
  // --------------------------------------------------

  const placeOrder = () => {
    if (cart.length === 0) return

    const newOrder = {
      id: `BSK-${Math.floor(
        100000 + Math.random() * 900000
      )}`,
      products: [...cart],
      total: Math.round(grandTotal),
      date: new Date().toLocaleDateString(
        "en-IN",
        {
          month: "short",
          day: "numeric",
          year: "numeric"
        }
      ),
      status: "Confirmed",
      estimatedDelivery:
        "Today, by 8:30 PM"
    }

    setOrders([newOrder, ...orders])
    setCart([])
    setDiscountPercent(0)
    setPromoCode("")
    setPage("orders")

    showToast(
      "🎉 Order Placed Successfully!"
    )
  }

  // --------------------------------------------------
  // Product Filter
  // --------------------------------------------------

  const filteredProducts = products.filter(
    (product) => {
      const productName =
        product.name?.toLowerCase() || ""

      const vendorName =
        product.vendor?.toLowerCase() || ""

      const productCategory =
        product.category?.toLowerCase() || ""

      const query =
        search.toLowerCase()

      const matchesSearch =
        !query ||
        productName.includes(query) ||
        vendorName.includes(query)

      const matchesCategory =
        selectedCategory === "All" ||
        productCategory ===
          selectedCategory.toLowerCase()

      return (
        matchesSearch &&
        matchesCategory
      )
    }
  )

  // --------------------------------------------------
  // Demand Matchmaker
  // --------------------------------------------------

  const findMatches = () => {
    if (!request.trim()) {
      showToast(
        "Please enter what you are looking for"
      )
      return
    }

    const results = sellers.filter(
      (seller) => {
        const productName =
          seller.product?.toLowerCase() || ""

        const sellerName =
          seller.name?.toLowerCase() || ""

        const query =
          request.toLowerCase()

        const matchText =
          productName.includes(query) ||
          sellerName.includes(query)

        const totalPrice =
          (Number(seller.price) || 0) *
          quantity

        const matchBudget = budget
          ? totalPrice <= Number(budget)
          : true

        return (
          matchText &&
          matchBudget
        )
      }
    )

    setMatches(results)

    if (results.length === 0) {
      showToast(
        "No vendors found within that budget"
      )
    }
  }

  // --------------------------------------------------
  // Home
  // --------------------------------------------------

  const goHome = () => {
    setPage("home")
    clearSearch()
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">

      {/* TOAST */}

      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-full bg-slate-900/95 backdrop-blur-xl px-5 py-2.5 text-xs font-bold text-white shadow-2xl border border-slate-800">
          <span>✨</span>
          <span>{toast}</span>
        </div>
      )}

      {/* HEADER */}

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80">

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-3">

          <div className="flex items-center justify-between gap-4">

            <button
              onClick={goHome}
              className="flex items-center gap-3 cursor-pointer group text-left"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-xl shadow-lg shadow-indigo-600/25 text-white transition-transform group-hover:scale-105">
                🛍️
              </div>

              <div>
                <div className="flex items-center gap-1.5">

                  <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 bg-clip-text text-transparent">
                    Baiskit
                  </h1>

                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                    PRO
                  </span>

                </div>

                <p className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>Local price comparison</span>
                </p>

              </div>
            </button>

            {/* DESKTOP NAV */}

            <div className="hidden lg:flex items-center gap-2">

              <button
                onClick={() => setPage("home")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  page === "home"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Home
              </button>

              <button
                onClick={() => setPage("vendors")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  page === "vendors" ||
                  page === "store"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Stores
              </button>

              <button
                onClick={() => setPage("orders")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  page === "orders"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Orders
              </button>

              <button
                onClick={() =>
                  setPage("baiskit")
                }
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
              >
                ✨ Demand
              </button>

              <button
                onClick={() =>
                  setPage("basket")
                }
                className="relative rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
              >
                🛒 Basket

                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                    {cart.reduce(
                      (s, i) =>
                        s + (i.qty || 1),
                      0
                    )}
                  </span>
                )}

              </button>

            </div>

            {/* MOBILE DEMAND */}

            <button
              onClick={() =>
                setPage("baiskit")
              }
              className="lg:hidden flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-md"
            >
              ✨ Demand
            </button>

          </div>

          {/* SEARCH */}

          <div className="mt-3 relative">

            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">

              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

            </div>

            <input
              type="text"
              placeholder="Search a product & compare prices..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchBaiskit()
                }
              }}
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-100/70 pl-10 pr-20 py-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />

            {search && (
              <>
                <button
                  onClick={searchBaiskit}
                  disabled={isLoading}
                  aria-label="Search"
                  className="absolute inset-y-0 right-9 flex items-center pr-1 text-indigo-500 hover:text-indigo-700 transition disabled:opacity-50"
                >
                  🔍
                </button>

                <button
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition"
                >
                  ✕
                </button>
              </>
            )}

          </div>

        </div>

      </header>

      {/* MAIN */}

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5 pb-28 lg:pb-10">

        {/* ==================================================
            BASKET
        ================================================== */}

        {page === "basket" && (
          <section className="animate-in fade-in duration-300 max-w-5xl mx-auto">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  Your Basket
                </h2>

                <p className="text-xs font-medium text-slate-500">
                  {cart.reduce(
                    (s, i) =>
                      s + (i.qty || 1),
                    0
                  )}{" "}
                  items in your cart
                </p>

              </div>

              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs font-bold text-rose-500 hover:underline"
                >
                  Clear All
                </button>
              )}

            </div>

            {cart.length === 0 ? (

              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">

                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-3xl">
                  🛒
                </div>

                <h3 className="text-base font-bold text-slate-800">
                  Your basket is empty
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Discover great deals from verified local stores around you.
                </p>

                <button
                  onClick={() =>
                    setPage("home")
                  }
                  className="mt-5 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25"
                >
                  Browse Products
                </button>

              </div>

            ) : (

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">

                <div className="space-y-3">

                  {cart.map((item) => (

                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-xl object-cover border border-slate-100 shrink-0"
                        />

                        <div className="min-w-0">

                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {item.name}
                          </h4>

                          <p className="text-[11px] text-slate-500">
                            {item.vendor}
                          </p>

                          <p className="mt-1 text-xs font-black text-indigo-600">
                            ₹
                            {(item.price || 0) *
                              (item.qty || 1)}
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-2">

                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-1.5 py-1">

                          <button
                            onClick={() =>
                              updateCartQty(
                                item.id,
                                -1
                              )
                            }
                            className="h-6 w-6 rounded-lg bg-white text-xs font-bold text-slate-700 shadow-sm"
                          >
                            -
                          </button>

                          <span className="w-7 text-center text-xs font-black text-slate-800">
                            {item.qty || 1}
                          </span>

                          <button
                            onClick={() =>
                              updateCartQty(
                                item.id,
                                1
                              )
                            }
                            className="h-6 w-6 rounded-lg bg-white text-xs font-bold text-slate-700 shadow-sm"
                          >
                            +
                          </button>

                        </div>

                        <button
                          onClick={() =>
                            removeItem(item.id)
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                        >
                          ✕
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

                <div className="space-y-4">

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm flex gap-2">

                    <input
                      type="text"
                      placeholder="Voucher: BAISKIT20"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(
                          e.target.value
                        )
                      }
                      className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-800 outline-none"
                    />

                    <button
                      onClick={applyPromo}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
                    >
                      Apply
                    </button>

                  </div>

                  <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2.5">

                    <div className="flex justify-between text-xs text-slate-500">

                      <span>
                        Subtotal
                      </span>

                      <span className="font-bold text-slate-800">
                        ₹{subtotal}
                      </span>

                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-xs text-emerald-600">

                        <span>
                          Voucher Discount
                        </span>

                        <span className="font-bold">
                          -₹
                          {Math.round(
                            discountAmount
                          )}
                        </span>

                      </div>
                    )}

                    <div className="flex justify-between text-xs text-slate-500">

                      <span>
                        Delivery
                      </span>

                      <span className="font-bold text-emerald-600">
                        FREE
                      </span>

                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between">

                      <div>

                        <p className="text-xs font-black text-slate-900">
                          Total Payable
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Taxes Included
                        </p>

                      </div>

                      <span className="text-xl font-black text-indigo-600">
                        ₹
                        {Math.round(
                          grandTotal
                        )}
                      </span>

                    </div>

                    <button
                      onClick={placeOrder}
                      className="w-full mt-2 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 py-3.5 text-xs font-black text-white shadow-xl"
                    >
                      Proceed to 1-Tap Checkout ⚡
                    </button>

                  </div>

                </div>

              </div>

            )}

          </section>
        )}

        {/* ==================================================
            DEMAND
        ================================================== */}

        {page === "baiskit" && (
          <section className="animate-in fade-in duration-300 max-w-5xl mx-auto">

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-6 text-white shadow-xl">

              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-300 border border-indigo-500/30">
                Reverse Marketplace
              </span>

              <h2 className="mt-3 text-2xl font-black tracking-tight">
                Create a Baiskit Demand
              </h2>

              <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-2xl">
                Tell nearby sellers your exact budget. Verified local shops can compete to fulfill your order.
              </p>

            </div>

            <div className="mt-5 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">

              <div>

                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  What item do you want?
                </label>

                <input
                  type="text"
                  placeholder="e.g. Wireless Earbuds, Study Desk..."
                  value={request}
                  onChange={(e) =>
                    setRequest(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                />

              </div>

              <div>

                <div className="flex justify-between items-center mb-1.5">

                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Max Target Budget (₹)
                  </label>

                  <span className="text-[10px] font-bold text-indigo-600">
                    Smart Price AI
                  </span>

                </div>

                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={budget}
                  onChange={(e) =>
                    setBudget(
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                />

                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">

                  {[
                    "1000",
                    "1500",
                    "2000",
                    "3000"
                  ].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() =>
                        setBudget(amt)
                      }
                      className={`rounded-xl px-3 py-1 text-xs font-bold transition ${
                        budget === amt
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}

                </div>

              </div>

              <div>

                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Quantity Required
                </label>

                <div className="flex items-center gap-3">

                  <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1">

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          Math.max(
                            1,
                            quantity - 1
                          )
                        )
                      }
                      className="h-8 w-8 rounded-xl bg-white font-bold text-slate-700 shadow-sm"
                    >
                      -
                    </button>

                    <span className="w-10 text-center font-black text-slate-800 text-xs">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(
                          quantity + 1
                        )
                      }
                      className="h-8 w-8 rounded-xl bg-white font-bold text-slate-700 shadow-sm"
                    >
                      +
                    </button>

                  </div>

                  <span className="text-[11px] text-slate-400">
                    1 unit = Standard warranty
                  </span>

                </div>

              </div>

              <button
                onClick={findMatches}
                className="w-full mt-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-xs font-black text-white shadow-lg"
              >
                Find Matched Sellers ✨
              </button>

            </div>

            {matches.length > 0 && (

              <div className="mt-6 space-y-3">

                <div className="flex justify-between items-center">

                  <h3 className="text-sm font-black text-slate-900">
                    Found{" "}
                    {matches.length}{" "}
                    Verified Offers
                  </h3>

                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    Within Budget
                  </span>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  {matches.map(
                    (seller) => (

                      <div
                        key={seller.id}
                        className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm"
                      >

                        <div className="flex justify-between items-start">

                          <div>

                            <div className="flex items-center gap-1.5">

                              <h4 className="font-black text-xs text-slate-900">
                                {seller.name}
                              </h4>

                              {seller.verified && (
                                <span className="h-3.5 w-3.5 rounded-full bg-blue-500 text-[8px] text-white flex items-center justify-center font-bold">
                                  ✓
                                </span>
                              )}

                            </div>

                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {seller.type} •{" "}
                              {seller.distance}
                            </p>

                          </div>

                          <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg">
                            ⭐{" "}
                            {seller.rating}
                          </span>

                        </div>

                        <div className="mt-3 border-t border-slate-100 pt-3 flex justify-between items-center">

                          <div>

                            <p className="text-[10px] uppercase font-bold text-slate-400">
                              Offer Price
                            </p>

                            <p className="text-lg font-black text-indigo-600">
                              ₹{seller.price}
                            </p>

                          </div>

                          <div className="flex gap-2">

                            <button
                              onClick={() => {
                                setSelectedVendor(
                                  seller.name
                                )
                                setPage(
                                  "store"
                                )
                              }}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
                            >
                              Visit Store
                            </button>

                            <button
                              onClick={() =>
                                showToast(
                                  `Connecting to ${seller.name}...`
                                )
                              }
                              className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white"
                            >
                              Lock Deal
                            </button>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

          </section>
        )}

        {/* ==================================================
    VENDORS
================================================== */}

{page === "vendors" && (
  <section className="animate-in fade-in duration-300 max-w-6xl mx-auto">

    <div className="mb-5">
      <h2 className="text-2xl font-black tracking-tight text-slate-900">
        Nearby Stores 🏪
      </h2>

      <p className="text-xs text-slate-500 mt-0.5">
        Real physical stores found near your location
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">

      {apiResults?.nearbyVendors?.length > 0 ? (
        apiResults.nearbyVendors.map((vendor, index) => (
          <VendorCard
            key={vendor.id || `${vendor.name}-${index}`}
            name={vendor.name}
            type={vendor.type || "Local Store"}
            distance={vendor.distance}
            rating={vendor.rating}
            totalRatings={vendor.totalRatings}
address={vendor.address}
openNow={vendor.openNow}
            onView={() => {
              if (vendor.mapsUrl) {
                window.open(
                  vendor.mapsUrl,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            }}
          />
        ))
      ) : (
        <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-bold text-slate-700">
            No nearby stores found
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Search for a product first to find nearby physical stores.
          </p>
        </div>
      )}

    </div>

  </section>
)}

        {/* ==================================================
            STORE
        ================================================== */}

        {page === "store" && (
          <section className="animate-in fade-in duration-300 max-w-4xl mx-auto">

            <button
              onClick={() =>
                setPage("vendors")
              }
              className="mb-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
            >
              ← Back to Stores
            </button>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">

              <div className="flex justify-between items-start">

                <div>

                  <div className="flex items-center gap-2">

                    <h2 className="text-xl font-black text-slate-900">
                      {selectedVendor ||
                        "Local Merchant"}
                    </h2>

                    <span className="h-4 w-4 rounded-full bg-blue-600 text-[9px] text-white flex items-center justify-center font-bold">
                      ✓
                    </span>

                  </div>

                  <p className="text-xs text-slate-500 mt-1">
                    📍 Local verified merchant
                  </p>

                  <div className="mt-2 flex gap-2">

                    <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      ● Open Now
                    </span>

                    <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      ⭐ 4.8 Rating
                    </span>

                  </div>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                  🏪
                </div>

              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">

                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  About Merchant
                </h4>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Verified local merchant available through Baiskit.
                  Product availability and pricing may vary.
                </p>

              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">

                <button
                  onClick={() =>
                    showToast(
                      `Calling ${
                        selectedVendor ||
                        "store"
                      }...`
                    )
                  }
                  className="rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700"
                >
                  📞 Call Store
                </button>

                <button
                  onClick={() =>
                    showToast(
                      "Opening Live Chat..."
                    )
                  }
                  className="rounded-2xl bg-slate-900 py-2.5 text-xs font-bold text-white"
                >
                  💬 Message
                </button>

              </div>

            </div>

          </section>
        )}

        {/* ==================================================
            ORDERS
        ================================================== */}

        {page === "orders" && (
          <section className="animate-in fade-in duration-300 max-w-5xl mx-auto">

            <div className="mb-5">

              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Your Orders 📦
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Order status & receipt history
              </p>

            </div>

            {orders.length === 0 ? (

              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">

                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  📦
                </div>

                <h3 className="font-bold text-slate-800 text-sm">
                  No Orders Placed Yet
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  When you checkout, your delivery updates will appear here.
                </p>

                <button
                  onClick={() =>
                    setPage("home")
                  }
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
                >
                  Start Shopping
                </button>

              </div>

            ) : (

              <div className="space-y-3.5">

                {orders.map(
                  (order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                    />
                  )
                )}

              </div>

            )}

          </section>
        )}

        {/* ==================================================
            HOME
        ================================================== */}

        {page === "home" && (

          <div className="animate-in fade-in duration-300 space-y-6">

            {/* LOADING */}

            {isLoading && (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center text-xs font-bold text-indigo-700 animate-pulse">
                🔍 Searching online prices, Baiskit listings & nearby stores...
              </div>
            )}

            {/* ==================================================
                PRICE COMPARISON
            ================================================== */}

            {apiResults && (

              <section className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-4 sm:p-5 shadow-sm space-y-4">

                {/* HEADER */}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                  <div>

                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">

                      <span>
                        Baiskit Price Match
                      </span>

                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        LIVE
                      </span>

                    </h2>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {apiResults.totalPriceResults ??
                        0}{" "}
                      price results for "
                      {search}"
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setApiResults(null)
                    }
                    className="self-start sm:self-auto shrink-0 text-xs font-bold text-slate-400 hover:text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-xl"
                  >
                    ✕ Close
                  </button>

                </div>

                {/* RESULT COUNTS */}

                <div className="grid grid-cols-3 gap-2">

                  <div className="rounded-2xl bg-white border border-slate-200 p-3 text-center shadow-sm">

                    <p className="text-lg font-black text-blue-600">
                      {apiResults.onlineCount ??
                        0}
                    </p>

                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Online
                    </p>

                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200 p-3 text-center shadow-sm">

                    <p className="text-lg font-black text-indigo-600">
                      {apiResults.localCount ??
                        0}
                    </p>

                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Local
                    </p>

                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200 p-3 text-center shadow-sm">

                    <p className="text-lg font-black text-emerald-600">
                      {apiResults.secondHandCount ??
                        0}
                    </p>

                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Second-Hand
                    </p>

                  </div>

                </div>

               {/* LOWEST OVERALL */}

{apiResults.comparison?.lowestOverall && (() => {
  const deal = apiResults.comparison.lowestOverall
  const isOnline = deal.type === "online"

  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-white shadow-md">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">
            🏆 Lowest Price Found
          </p>

          <h3 className="mt-1 text-sm font-black">
            {deal.seller || deal.platform || "Baiskit Seller"}
          </h3>

          {deal.condition && (
            <p className="text-[11px] text-indigo-100 mt-0.5">
              {deal.condition}
            </p>
          )}

        </div>

        <div className="sm:text-right">

          <p className="text-2xl font-black">
            ₹{deal.price}
          </p>

          <p className="text-[10px] text-indigo-100 capitalize">
            {deal.type}
          </p>

        </div>

      </div>

      {isOnline && deal.url ? (
        <a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full mt-3 rounded-xl bg-white py-2 text-center text-xs font-black text-indigo-700 hover:bg-indigo-50 transition"
        >
          View Lowest Online Deal →
        </a>
      ) : (
        <button
          onClick={() => {
            addToCart({
              id: `compare-${Date.now()}`,
              name: `${search}${
                deal.condition
                  ? ` (${deal.condition})`
                  : ""
              }`,
              price: deal.price,
              vendor:
                deal.seller ||
                deal.platform ||
                "Baiskit",
              image:
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80"
            })
          }}
          className="w-full mt-3 rounded-xl bg-white py-2 text-xs font-black text-indigo-700 hover:bg-indigo-50 transition"
        >
          Add Lowest Price to Basket 🛒
        </button>
      )}

    </div>
  )
})()}

                {/* PRICE CATEGORIES */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                  {/* LOCAL */}

                  <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      🏪 Lowest Local
                    </p>

                    {apiResults.comparison
                      ?.lowestLocal ? (

                      <>
                        <h3 className="mt-2 text-xs font-black text-slate-900">
                          {apiResults.comparison.lowestLocal.seller ||
                            apiResults.comparison.lowestLocal.platform}
                        </h3>

                        <p className="text-lg font-black text-indigo-600 mt-1">
                          ₹
                          {
                            apiResults.comparison
                              .lowestLocal
                              .price
                          }
                        </p>

                        <p className="text-[10px] text-slate-500 mt-1">
                          {apiResults.comparison
                            .lowestLocal
                            .distance ||
                            "Baiskit listing"}
                        </p>
                      </>

                    ) : (

                      <p className="mt-2 text-xs text-slate-400">
                        No local price found
                      </p>

                    )}

                  </div>

                  {/* SECOND HAND */}

                  <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      ♻️ Lowest Second-Hand
                    </p>

                    {apiResults.comparison
                      ?.lowestSecondHand ? (

                      <>
                        <h3 className="mt-2 text-xs font-black text-slate-900">
                          {apiResults.comparison.lowestSecondHand.seller ||
                            apiResults.comparison.lowestSecondHand.platform}
                        </h3>

                        <p className="text-lg font-black text-emerald-600 mt-1">
                          ₹
                          {
                            apiResults.comparison
                              .lowestSecondHand
                              .price
                          }
                        </p>

                        <p className="text-[10px] text-slate-500 mt-1">
                          {apiResults.comparison
                            .lowestSecondHand
                            .condition ||
                            "Second-hand"}
                        </p>
                      </>

                    ) : (

                      <p className="mt-2 text-xs text-slate-400">
                        No second-hand price found
                      </p>

                    )}

                  </div>

                  {/* ONLINE */}

                  <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      🌐 Lowest Online
                    </p>

                    {apiResults.comparison
                      ?.lowestOnline ? (

                      <>
                        <h3 className="mt-2 text-xs font-black text-slate-900">
                          {
                            apiResults.comparison
                              .lowestOnline
                              .platform
                          }
                        </h3>

                        <p className="text-lg font-black text-blue-600 mt-1">
                          ₹
                          {
                            apiResults.comparison
                              .lowestOnline
                              .price
                          }
                        </p>

                        {apiResults.comparison
                          .lowestOnline
                          .url && (
                          <a
                            href={
                              apiResults
                                .comparison
                                .lowestOnline
                                .url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-[10px] font-bold text-blue-600 hover:underline"
                          >
                            View Online Deal →
                          </a>
                        )}

                      </>

                    ) : (

                      <p className="mt-2 text-xs text-slate-400">
                        Online prices not available yet
                      </p>

                    )}

                  </div>

                </div>

                {/* ALL PRICE RESULTS */}

                {apiResults.priceResults
                  ?.length > 0 && (

                  <div className="space-y-2">

                    <div className="flex items-center justify-between">

                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        All Available Prices
                      </p>

                      <span className="text-[10px] text-slate-400">
                        {
                          apiResults
                            .priceResults
                            .length
                        }{" "}
                        offers
                      </span>

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">

                      {apiResults.priceResults.map(
                        (item, index) => {

                          const isOnline =
                            item.type ===
                            "online"

                          const isSecondHand =
                            item.type ===
                            "second-hand"

                          return (
                            <div
                              key={`${item.seller || item.platform || "price"}-${index}`}
                              className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"
                            >

                              <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                  <div className="flex items-center gap-2">

                                    <h4 className="text-xs font-bold text-slate-900 truncate">
                                      {item.seller ||
                                        item.platform ||
                                        "Seller"}
                                    </h4>

                                    <span
                                      className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-black uppercase ${
                                        isOnline
                                          ? "bg-blue-50 text-blue-600"
                                          : isSecondHand
                                          ? "bg-emerald-50 text-emerald-700"
                                          : "bg-indigo-50 text-indigo-700"
                                      }`}
                                    >
                                      {isOnline
                                        ? "Online"
                                        : isSecondHand
                                        ? "Second-Hand"
                                        : "Local"}
                                    </span>

                                  </div>

                                  <p className="text-[10px] text-slate-500 mt-1 truncate">
                                    {item.product ||
                                      search}
                                  </p>

                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {item.condition ||
                                      ""}

                                    {item.distance
                                      ? ` • ${item.distance}`
                                      : ""}
                                  </p>

                                </div>

                                <div className="text-right shrink-0">

                                  <p className="text-sm font-black text-slate-900">
                                    ₹
                                    {item.price}
                                  </p>

                                  {item.rating && (
                                    <p className="text-[9px] text-amber-500 font-bold">
                                      ⭐{" "}
                                      {item.rating}
                                    </p>
                                  )}

                                </div>

                              </div>

                              <div className="mt-2.5 flex items-center justify-between gap-2">

                                <span className="text-[9px] font-bold text-slate-400">
                                  {item.source ||
                                    "Baiskit"}
                                </span>

                                {isOnline &&
                                item.url ? (

                                  <a
                                    href={
                                      item.url
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700 transition"
                                  >
                                    View Deal →
                                  </a>

                                ) : (

                                  <button
                                    onClick={() => {

                                      addToCart({
                                        id: `compare-${Date.now()}-${index}`,
                                        name:
                                          item.product ||
                                          search,
                                        price:
                                          item.price,
                                        vendor:
                                          item.seller ||
                                          item.platform ||
                                          "Baiskit",
                                        image:
                                          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80"
                                      })

                                    }}
                                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-slate-800 transition"
                                  >
                                    Add to Basket
                                  </button>

                                )}

                              </div>

                            </div>
                          )
                        }
                      )}

                    </div>

                  </div>

                )}

                {/* NO PRICE RESULTS */}

                {!apiResults.priceResults
                  ?.length && (

                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">

                    <p className="text-sm font-bold text-slate-700">
                      No price results found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try another product name or a more specific model.
                    </p>

                  </div>

                )}

                {/* NEARBY VENDORS */}

                {apiResults.nearbyVendors
                  ?.length > 0 && (

                  <div className="space-y-2">

                    <div className="flex items-center justify-between">

                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Nearby Stores
                      </p>

                      <span className="text-[10px] text-slate-400">
                        {
                          apiResults
                            .nearbyVendors
                            .length
                        }{" "}
                        found
                      </span>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

                      {apiResults.nearbyVendors.map(
                        (vendor, index) => (

                          <div
                            key={`${vendor.name || "vendor"}-${index}`}
                            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                          >

                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0">

                                <h4 className="text-xs font-black text-slate-900 truncate">
                                  {vendor.name ||
                                    "Nearby Store"}
                                </h4>

                                <p className="mt-1 text-[10px] text-slate-500">
                                  {vendor.address ||
                                    "Local store"}
                                </p>

                                {vendor.distance && (
                                  <p className="mt-1 text-[10px] font-bold text-indigo-600">
                                    📍{" "}
                                    {
                                      vendor.distance
                                    }
                                  </p>
                                )}

                              </div>

                              <div className="shrink-0 text-right">

                                {vendor.rating && (
                                  <p className="text-[9px] font-bold text-amber-500">
                                    ⭐{" "}
                                    {
                                      vendor.rating
                                    }
                                  </p>
                                )}

                                {vendor.openNow !==
                                  undefined && (
                                  <p
                                    className={`mt-1 text-[9px] font-bold ${
                                      vendor.openNow
                                        ? "text-emerald-600"
                                        : "text-rose-500"
                                    }`}
                                  >
                                    {vendor.openNow
                                      ? "Open"
                                      : "Closed"}
                                  </p>
                                )}

                              </div>

                            </div>

                            {vendor.mapsUrl && (
                              <a
                                href={
                                  vendor.mapsUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 text-[10px] font-bold text-indigo-600 hover:underline"
                              >
                                Open in Maps →
                              </a>
                            )}

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              </section>

            )}

            {/* PRODUCT FEED */}

            {!apiResults && (

              <section className="space-y-4">

                <div>

                  <h2 className="text-lg font-black text-slate-900">
                    Explore Products
                  </h2>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Browse available Baiskit products
                  </p>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {filteredProducts.map(
                    (product) => (

                      <ProductCard
                        key={product.id}
                        product={product}
                        onAdd={() =>
                          addToCart(
                            product
                          )
                        }
                      />

                    )
                  )}

                </div>

                {filteredProducts.length ===
                  0 && (

                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">

                    <div className="text-3xl">
                      🔍
                    </div>

                    <h3 className="mt-2 text-sm font-bold text-slate-800">
                      No products found
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Try searching for another product.
                    </p>

                  </div>

                )}

              </section>

            )}

          </div>

        )}

      </main>

      {/* MOBILE NAV */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl">

        <div className="grid grid-cols-4 px-2 py-2">

          <button
            onClick={() =>
              setPage("home")
            }
            className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] font-bold ${
              page === "home"
                ? "text-indigo-600"
                : "text-slate-400"
            }`}
          >
            <span className="text-lg">
              🏠
            </span>
            Home
          </button>

          <button
            onClick={() =>
              setPage("vendors")
            }
            className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] font-bold ${
              page === "vendors" ||
              page === "store"
                ? "text-indigo-600"
                : "text-slate-400"
            }`}
          >
            <span className="text-lg">
              🏪
            </span>
            Stores
          </button>

          <button
            onClick={() =>
              setPage("orders")
            }
            className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] font-bold ${
              page === "orders"
                ? "text-indigo-600"
                : "text-slate-400"
            }`}
          >
            <span className="text-lg">
              📦
            </span>
            Orders
          </button>

          <button
            onClick={() =>
              setPage("basket")
            }
            className={`relative flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] font-bold ${
              page === "basket"
                ? "text-indigo-600"
                : "text-slate-400"
            }`}
          >
            <span className="text-lg">
              🛒
            </span>

            Basket

            {cart.length > 0 && (
              <span className="absolute top-0.5 right-5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-black text-white">
                {cart.reduce(
                  (s, i) =>
                    s + (i.qty || 1),
                  0
                )}
              </span>
            )}

          </button>

        </div>

      </nav>

    </div>
  )
}