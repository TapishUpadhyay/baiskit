import { useState, useRef, useEffect } from "react"
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

  const [request, setRequest] = useState("")
  const [budget, setBudget] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [matches, setMatches] = useState([])

  const [search, setSearch] = useState("")
  const [orders, setOrders] = useState([])
  const [promoCode, setPromoCode] = useState("")
  const [discountPercent, setDiscountPercent] = useState(0)
  const [toast, setToast] = useState(null)

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
  // Nearby Vendors
  // --------------------------------------------------

  useEffect(() => {
    if (page !== "vendors") return

    if (!navigator.geolocation) {
      showToast("Location is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        setUserLocation({ lat, lng })

        try {
          const response = await fetch(
            `https://baiskit.onrender.com/api/vendors/nearby?lat=${lat}&lng=${lng}&keyword=store`
          )

          const data = await response.json()

          if (data.success) {
            setApiResults((prev) => ({
              ...(prev || {}),
              nearbyVendors: data.vendors || []
            }))
          }
        } catch (error) {
          console.error("Nearby vendors error:", error)
        }
      },
      (error) => {
        console.error("Location error:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }, [page])

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

      if (!response.ok) {
        setApiResults(null)

        showToast(
          data?.message ||
            data?.error ||
            `Baiskit server error (${response.status})`
        )

        return
      }

      if (!data?.success) {
        setApiResults(null)

        showToast(
          data?.message ||
            data?.error ||
            "No comparison found for this product"
        )

        return
      }

      setApiResults(data)

      if (!data.priceResults?.length) {
        showToast(
          "No live prices found for this product. Try another product."
        )
      }
    } catch (error) {
      console.error("Baiskit search error:", error)

      setApiResults(null)

      if (error.message === "Location permission denied") {
        showToast(
          "Location access is required to find nearby prices and stores"
        )
        return
      }

      if (error.message === "Geolocation not supported") {
        showToast("Your browser does not support location services")
        return
      }

      if (
        error.name === "TypeError" ||
        error.message?.toLowerCase().includes("fetch")
      ) {
        showToast(
          "Unable to connect to Baiskit. Please try again."
        )
        return
      }

      showToast("Something went wrong. Please try again.")
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
    if (promoCode.trim().toUpperCase() === "BAISKIT20") {
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

  const discountAmount = subtotal * discountPercent

  const grandTotal = Math.max(
    0,
    subtotal - discountAmount
  )

  const cartCount = cart.reduce(
    (sum, item) => sum + (item.qty || 1),
    0
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
      estimatedDelivery: "Today, by 8:30 PM"
    }

    setOrders([newOrder, ...orders])
    setCart([])
    setDiscountPercent(0)
    setPromoCode("")
    setPage("orders")

    showToast("🎉 Order Placed Successfully!")
  }

  // --------------------------------------------------
  // Product Filter
  // --------------------------------------------------

  const filteredProducts = products.filter((product) => {
    const productName =
      product.name?.toLowerCase() || ""

    const vendorName =
      product.vendor?.toLowerCase() || ""

    const productCategory =
      product.category?.toLowerCase() || ""

    const query = search.toLowerCase()

    const matchesSearch =
      !query ||
      productName.includes(query) ||
      vendorName.includes(query)

    const matchesCategory =
      selectedCategory === "All" ||
      productCategory ===
        selectedCategory.toLowerCase()

    return matchesSearch && matchesCategory
  })

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

    const results = sellers.filter((seller) => {
      const productName =
        seller.product?.toLowerCase() || ""

      const sellerName =
        seller.name?.toLowerCase() || ""

      const query = request.toLowerCase()

      const matchText =
        productName.includes(query) ||
        sellerName.includes(query)

      const totalPrice =
        (Number(seller.price) || 0) *
        quantity

      const matchBudget = budget
        ? totalPrice <= Number(budget)
        : true

      return matchText && matchBudget
    })

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
  // Shared UI
  // --------------------------------------------------

  const SectionTitle = ({
    eyebrow,
    title,
    description,
    action
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600">
            {eyebrow}
          </p>
        )}

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">

      {/* --------------------------------------------------
          TOAST
      -------------------------------------------------- */}

      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-[calc(100%-32px)]">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-xl px-5 py-3 text-xs font-bold text-white shadow-2xl shadow-slate-900/20">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
              ✨
            </span>
            <span className="truncate">
              {toast}
            </span>
          </div>
        </div>
      )}

      {/* --------------------------------------------------
          HEADER
      -------------------------------------------------- */}

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-2xl">

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-3">

          <div className="flex items-center justify-between gap-4">

            {/* LOGO */}

            <button
              onClick={goHome}
              className="group flex items-center gap-3 text-left"
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-xl text-white shadow-lg shadow-indigo-600/25 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl">
                🛍️

                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
              </div>

              <div className="hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-black tracking-tight text-slate-950">
                    Baiskit
                  </h1>

                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-black tracking-wider text-indigo-700">
                    PRO
                  </span>
                </div>

                <p className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Smart local price comparison
                </p>
              </div>
            </button>

            {/* DESKTOP NAV */}

            <nav className="hidden lg:flex items-center gap-1.5">

              {[
                ["home", "Home"],
                ["vendors", "Stores"],
                ["orders", "Orders"]
              ].map(([target, label]) => (
                <button
                  key={target}
                  onClick={() => setPage(target)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    page === target ||
                    (target === "vendors" &&
                      page === "store")
                      ? "bg-indigo-50 text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  {label}
                </button>
              ))}

              <button
                onClick={() => setPage("baiskit")}
                className="ml-1 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                ✨ Demand
              </button>

              <button
                onClick={() => setPage("basket")}
                className="relative ml-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                🛒 Basket

                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>

            </nav>

            {/* MOBILE DEMAND */}

            <button
              onClick={() => setPage("baiskit")}
              className="lg:hidden rounded-full bg-slate-950 px-3.5 py-2 text-[11px] font-black text-white shadow-lg"
            >
              ✨ Demand
            </button>

          </div>

          {/* SEARCH */}

          <div className="relative mt-3">

            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
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
              className="w-full rounded-2xl border border-slate-200/80 bg-slate-100/80 py-3.5 pl-11 pr-24 text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />

            {search && (
              <>
                <button
                  onClick={searchBaiskit}
                  disabled={isLoading}
                  aria-label="Search"
                  className="absolute inset-y-0 right-9 flex items-center px-2 text-indigo-500 transition hover:text-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                  ) : (
                    "🔍"
                  )}
                </button>

                <button
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-700"
                >
                  ✕
                </button>
              </>
            )}

          </div>

        </div>
      </header>

      {/* --------------------------------------------------
          MAIN
      -------------------------------------------------- */}

      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-12">

        {/* ==================================================
            BASKET
        ================================================== */}

        {page === "basket" && (
          <section className="mx-auto max-w-6xl animate-in fade-in duration-300">

            <SectionTitle
              eyebrow="Shopping bag"
              title="Your Basket"
              description={`${cartCount} ${
                cartCount === 1 ? "item" : "items"
              } ready for checkout`}
              action={
                cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="self-start rounded-xl px-3 py-2 text-xs font-bold text-rose-500 transition hover:bg-rose-50"
                  >
                    Clear All
                  </button>
                )
              }
            />

            {cart.length === 0 ? (
              <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-indigo-50 to-violet-100 text-4xl">
                  🛒
                </div>

                <h3 className="mt-5 text-lg font-black text-slate-900">
                  Your basket is empty
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                  Discover great deals from online marketplaces and verified local stores around you.
                </p>

                <button
                  onClick={() => setPage("home")}
                  className="mt-6 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">

                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between gap-3 rounded-3xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex min-w-0 items-center gap-3">

                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 shrink-0 rounded-2xl border border-slate-100 object-cover"
                        />

                        <div className="min-w-0">
                          <h4 className="line-clamp-1 text-xs font-black text-slate-900">
                            {item.name}
                          </h4>

                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {item.vendor}
                          </p>

                          <p className="mt-1.5 text-sm font-black text-indigo-600">
                            ₹
                            {(item.price || 0) *
                              (item.qty || 1)}
                          </p>
                        </div>

                      </div>

                      <div className="flex shrink-0 items-center gap-2">

                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                          <button
                            onClick={() =>
                              updateCartQty(
                                item.id,
                                -1
                              )
                            }
                            className="h-7 w-7 rounded-lg bg-white text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-100"
                          >
                            −
                          </button>

                          <span className="w-8 text-center text-xs font-black text-slate-800">
                            {item.qty || 1}
                          </span>

                          <button
                            onClick={() =>
                              updateCartQty(
                                item.id,
                                1
                              )
                            }
                            className="h-7 w-7 rounded-lg bg-white text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeItem(item.id)
                          }
                          className="rounded-xl p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                        >
                          ✕
                        </button>

                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">

                  <div className="rounded-3xl border border-slate-200/80 bg-white p-3 shadow-sm">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Voucher: BAISKIT20"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(
                            e.target.value
                          )
                        }
                        className="min-w-0 flex-1 rounded-2xl bg-slate-50 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10"
                      />

                      <button
                        onClick={applyPromo}
                        className="rounded-2xl bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-slate-800"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">

                    <div className="space-y-3">

                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Subtotal</span>
                        <span className="font-bold text-slate-800">
                          ₹{subtotal}
                        </span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600">
                          <span>Voucher Discount</span>
                          <span className="font-bold">
                            -₹
                            {Math.round(
                              discountAmount
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Delivery</span>
                        <span className="font-black text-emerald-600">
                          FREE
                        </span>
                      </div>

                    </div>

                    <div className="my-4 border-t border-dashed border-slate-200" />

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-900">
                          Total Payable
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Taxes included
                        </p>
                      </div>

                      <span className="text-2xl font-black text-indigo-600">
                        ₹
                        {Math.round(
                          grandTotal
                        )}
                      </span>
                    </div>

                    <button
                      onClick={placeOrder}
                      className="mt-5 w-full rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 py-3.5 text-xs font-black text-white shadow-xl shadow-indigo-950/10 transition hover:-translate-y-0.5"
                    >
                      Proceed to 1-Tap Checkout ⚡
                    </button>

                    <p className="mt-3 text-center text-[9px] font-semibold text-slate-400">
                      Secure checkout • Free delivery
                    </p>

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
          <section className="mx-auto max-w-5xl animate-in fade-in duration-300">

            <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950 p-6 sm:p-8 text-white shadow-2xl shadow-indigo-950/10">

              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />

              <div className="relative">
                <span className="inline-flex rounded-full border border-indigo-400/20 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-indigo-200 backdrop-blur">
                  Reverse Marketplace
                </span>

                <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight">
                  Create a Baiskit Demand
                </h2>

                <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300">
                  Tell nearby sellers exactly what you need and your target budget. Local shops can compete to fulfill your order.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[28px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm">

              <div className="space-y-5">

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                      Maximum Target Budget
                    </label>

                    <span className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-black text-indigo-600">
                      SMART PRICE AI
                    </span>
                  </div>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={budget}
                      onChange={(e) =>
                        setBudget(
                          e.target.value
                        )
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-8 pr-4 text-xs font-bold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>

                  <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
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
                        className={`rounded-xl px-3 py-2 text-[10px] font-black transition ${
                          budget === amt
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
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
                        className="h-8 w-8 rounded-xl bg-white font-black text-slate-700 shadow-sm"
                      >
                        −
                      </button>

                      <span className="w-10 text-center text-xs font-black text-slate-800">
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(
                            quantity + 1
                          )
                        }
                        className="h-8 w-8 rounded-xl bg-white font-black text-slate-700 shadow-sm"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      Standard warranty
                    </span>
                  </div>
                </div>

                <button
                  onClick={findMatches}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-xs font-black text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Find Matched Sellers ✨
                </button>

              </div>
            </div>

            {matches.length > 0 && (
              <div className="mt-7 space-y-3">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600">
                      Seller Matches
                    </p>

                    <h3 className="mt-0.5 text-lg font-black text-slate-900">
                      {matches.length} Verified Offers
                    </h3>
                  </div>

                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-700">
                    WITHIN BUDGET
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {matches.map((seller) => (
                    <div
                      key={seller.id}
                      className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-slate-900">
                              {seller.name}
                            </h4>

                            {seller.verified && (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[8px] font-black text-white">
                                ✓
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-[10px] text-slate-500">
                            {seller.type} •{" "}
                            {seller.distance}
                          </p>
                        </div>

                        <span className="rounded-xl bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-600">
                          ⭐ {seller.rating}
                        </span>
                      </div>

                      <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">

                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            Offer Price
                          </p>

                          <p className="mt-0.5 text-xl font-black text-indigo-600">
                            ₹{seller.price}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedVendor(
                                seller.name
                              )
                              setPage("store")
                            }}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-700 transition hover:bg-slate-100"
                          >
                            Visit Store
                          </button>

                          <button
                            onClick={() =>
                              showToast(
                                `Connecting to ${seller.name}...`
                              )
                            }
                            className="rounded-xl bg-slate-950 px-3.5 py-2 text-[10px] font-black text-white transition hover:bg-slate-800"
                          >
                            Lock Deal
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ==================================================
            VENDORS
        ================================================== */}

        {page === "vendors" && (
          <section className="mx-auto max-w-6xl animate-in fade-in duration-300">

            <SectionTitle
              eyebrow="Local discovery"
              title="Nearby Stores 🏪"
              description="Real physical stores found near your location"
            />

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

              {apiResults?.nearbyVendors?.length > 0 ? (
                apiResults.nearbyVendors.map(
                  (vendor, index) => (
                    <VendorCard
                      key={
                        vendor.id ||
                        `${vendor.name}-${index}`
                      }
                      name={vendor.name}
                      type={
                        vendor.type ||
                        "Local Store"
                      }
                      distance={vendor.distance}
                      rating={vendor.rating}
                      totalRatings={
                        vendor.totalRatings
                      }
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
                  )
                )
              ) : (
                <div className="col-span-full rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                    🏪
                  </div>

                  <p className="mt-4 text-sm font-black text-slate-800">
                    No nearby stores found
                  </p>

                  <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
                    Allow location access and Baiskit will search the nearby area for physical stores.
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
  <section className="mx-auto max-w-4xl animate-in fade-in duration-300">

    <button
      onClick={() => setPage("vendors")}
      className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:-translate-x-0.5"
    >
      ← Back to Stores
    </button>

    <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-sm">

      {/* STORE HEADER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950 p-6 text-white sm:p-8">

        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <h2 className="truncate text-xl font-black sm:text-2xl">
                {currentStore?.name ||
                  selectedVendor ||
                  "Local Store"}
              </h2>

              {currentStore && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[9px] font-black text-white">
                  ✓
                </span>
              )}

            </div>

            {/* ADDRESS */}
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              📍{" "}
              {currentStore?.address ||
                "Local store near your selected area"}
            </p>

            {/* REAL STORE STATUS */}
            <div className="mt-4 flex flex-wrap gap-2">

              {currentStore?.openNow !== null &&
                currentStore?.openNow !== undefined && (
                  <span
                    className={`rounded-lg border px-2.5 py-1 text-[9px] font-black ${
                      currentStore.openNow
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : "border-red-400/20 bg-red-400/10 text-red-300"
                    }`}
                  >
                    ●{" "}
                    {currentStore.openNow
                      ? "Open Now"
                      : "Closed"}
                  </span>
                )}

              {/* REAL GOOGLE RATING */}
              {currentStore?.rating !== null &&
                currentStore?.rating !== undefined && (
                  <span className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[9px] font-black text-amber-300">
                    ⭐ {currentStore.rating} Rating
                  </span>
                )}

            </div>

          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur">
            🏪
          </div>

        </div>
      </div>

      {/* STORE CONTENT */}
      <div className="p-6">

        <div>

          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            Store Information
          </p>

          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {currentStore?.name
              ? "Store information provided through Google Maps. Availability and pricing may vary."
              : "Local store information is currently unavailable."}
          </p>



        </div>

        {/* STORE DETAILS */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">

          {/* RATING */}
          {currentStore?.rating !== null &&
            currentStore?.rating !== undefined && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Rating
                </p>

                <p className="mt-1 text-lg font-black text-slate-900">
                  ⭐ {currentStore.rating}
                </p>
              </div>
            )}

          {/* DISTANCE */}
          {currentStore?.distance !== null &&
            currentStore?.distance !== undefined && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Distance
                </p>

                <p className="mt-1 text-lg font-black text-slate-900">
                  {currentStore.distance} km
                </p>
              </div>
            )}

            {/* STORE PRICE LISTINGS */}
<div className="mt-8">

  <div className="mb-4">
    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
      Products & Prices
    </p>

    <p className="mt-1 text-xs text-slate-500">
      Products currently available through Baiskit.
    </p>
  </div>

  {(() => {
    const storeListings =
      apiResults?.priceResults?.filter(
        (item) =>
          item.seller === selectedVendor ||
          item.platform === selectedVendor
      ) || []

    if (!storeListings.length) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm font-bold text-slate-700">
            No products found for this store
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Search for a product to see available prices here.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {storeListings.map((item, index) => (
          <div
            key={`${item.product}-${index}`}
            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-800">
                {item.product}
              </p>

              <p className="mt-1 text-[10px] font-bold text-slate-400">
                {item.condition || "Brand New"}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-lg font-black text-indigo-600">
                ₹{Number(item.price).toLocaleString("en-IN")}
              </p>

              {item.distance != null && (
                <p className="mt-1 text-[10px] text-slate-400">
                  {item.distance} km away
                </p>
              )}
            </div>

          </div>
        ))}
      </div>
    )
  })()}

</div>

        </div>

        {/* ACTIONS */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">

          {/* GOOGLE MAPS */}
          {currentStore?.mapsUrl && (
            <a
              href={currentStore.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-indigo-600 py-3 text-center text-xs font-black text-white transition hover:bg-indigo-700"
            >
              📍 View on Google Maps
            </a>
          )}

          {/* MESSAGE */}
          <button
            onClick={() =>
              showToast("Opening Live Chat...")
            }
            className="rounded-2xl bg-slate-950 py-3 text-xs font-black text-white transition hover:bg-slate-800"
          >
            💬 Message
          </button>

        </div>

      </div>

    </div>

  </section>
)}

        {/* ==================================================
            ORDERS
        ================================================== */}

        {page === "orders" && (
          <section className="mx-auto max-w-5xl animate-in fade-in duration-300">

            <SectionTitle
              eyebrow="Purchase history"
              title="Your Orders 📦"
              description="Order status and receipt history"
            />

            {orders.length === 0 ? (
              <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                  📦
                </div>

                <h3 className="mt-4 text-sm font-black text-slate-800">
                  No Orders Placed Yet
                </h3>

                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
                  When you checkout, your delivery updates will appear here.
                </p>

                <button
                  onClick={() => setPage("home")}
                  className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-black text-white transition hover:bg-slate-800"
                >
                  Start Shopping
                </button>

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
        )}

        {/* ==================================================
            HOME
        ================================================== */}

        {page === "home" && (
          <div className="animate-in fade-in duration-300">

            {/* HERO WHEN NO SEARCH */}

            {!apiResults && !isLoading && (
              <section className="relative mb-8 overflow-hidden rounded-[30px] bg-gradient-to-br from-indigo-950 via-slate-950 to-violet-950 p-6 sm:p-8 lg:p-10 text-white shadow-2xl shadow-indigo-950/10">

                <div className="absolute right-[-80px] top-[-90px] h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute bottom-[-100px] left-[-50px] h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />

                <div className="relative max-w-2xl">

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-indigo-200 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Live price intelligence
                  </span>

                  <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.05] tracking-tight">
                    Find the
                    <span className="block bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                      best price.
                    </span>
                  </h2>

                  <p className="mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-300">
                    Compare online offers, Baiskit listings and nearby physical stores from one search.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      "🌐 Online",
                      "🏪 Local",
                      "♻️ Second-Hand"
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold text-slate-200 backdrop-blur"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                </div>
              </section>
            )}

            {/* LOADING */}

            {isLoading && (
              <section className="mb-6 overflow-hidden rounded-[28px] border border-indigo-100 bg-white shadow-sm">

                <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-violet-50 p-5">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Comparing prices...
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Checking online offers, Baiskit listings and nearby stores
                    </p>
                  </div>

                </div>

                <div className="space-y-3 p-5">
                  <div className="h-3 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-3 w-3/5 animate-pulse rounded-full bg-slate-100" />
                </div>

              </section>
            )}

            {/* ==================================================
                PRICE COMPARISON
            ================================================== */}

            {!isLoading && apiResults && (
              <section className="space-y-5">

                {/* COMPARISON HEADER */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600">
                      Live comparison
                    </p>

                    <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                      Price Match
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {apiResults.totalPriceResults ?? 0} available offers for{" "}
                      <span className="font-bold text-slate-700">
                        "{search}"
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setApiResults(null)
                    }
                    className="self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
                  >
                    ✕ Close Results
                  </button>

                </div>

                {/* COUNTS */}

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">

                  {[
                    [
                      apiResults.onlineCount ?? 0,
                      "Online",
                      "bg-blue-50 text-blue-600",
                      "🌐"
                    ],
                    [
                      apiResults.localCount ?? 0,
                      "Local",
                      "bg-indigo-50 text-indigo-600",
                      "🏪"
                    ],
                    [
                      apiResults.secondHandCount ?? 0,
                      "Second-Hand",
                      "bg-emerald-50 text-emerald-600",
                      "♻️"
                    ]
                  ].map(
                    ([count, label, style, icon]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${style}`}
                          >
                            {icon}
                          </span>

                          <span className="text-lg font-black text-slate-900">
                            {count}
                          </span>
                        </div>

                        <p className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                          {label}
                        </p>
                      </div>
                    )
                  )}

                </div>

                {/* LOWEST OVERALL */}

                {apiResults.comparison?.lowestOverall &&
                  (() => {
                    const deal =
                      apiResults.comparison.lowestOverall

                    const isOnline =
                      deal.type === "online"

                      const currentStore =
  apiResults?.nearbyVendors?.find(
    (vendor) => vendor.name === selectedVendor
  ) || null

                    return (
                      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 sm:p-6 text-white shadow-xl shadow-indigo-600/20">

                        <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

                        <div className="relative">

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-indigo-100">
                                🏆 Lowest Price Found
                              </p>

                              <h3 className="mt-1.5 text-base font-black">
                                {deal.seller ||
                                  deal.platform ||
                                  "Baiskit Seller"}
                              </h3>

                              {deal.condition && (
                                <p className="mt-1 text-[11px] text-indigo-100">
                                  {deal.condition}
                                </p>
                              )}
                            </div>

                            <div className="sm:text-right">
                              <p className="text-3xl font-black tracking-tight">
                                ₹{deal.price}
                              </p>

                              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-100">
                                {deal.type}
                              </p>
                            </div>

                          </div>

                          {isOnline && deal.url ? (
                            <a
                              href={deal.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 block rounded-2xl bg-white py-3 text-center text-xs font-black text-indigo-700 transition hover:bg-indigo-50"
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
                              className="mt-4 w-full rounded-2xl bg-white py-3 text-xs font-black text-indigo-700 transition hover:bg-indigo-50"
                            >
                              Add Lowest Price to Basket 🛒
                            </button>
                          )}

                        </div>
                      </div>
                    )
                  })()}

                {/* PRICE CATEGORY CARDS */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                  {/* LOCAL */}

                  <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">

                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        🏪 Lowest Local
                      </p>

                      <span className="rounded-lg bg-indigo-50 px-2 py-1 text-[9px] font-black text-indigo-600">
                        LOCAL
                      </span>
                    </div>

                    {apiResults.comparison?.lowestLocal ? (
                      <>
                        <h3 className="mt-4 line-clamp-1 text-xs font-black text-slate-900">
                          {apiResults.comparison.lowestLocal.seller ||
                            apiResults.comparison.lowestLocal.platform}
                        </h3>

                        <p className="mt-1 text-2xl font-black text-indigo-600">
                          ₹
                          {
                            apiResults.comparison
                              .lowestLocal
                              .price
                          }
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          {apiResults.comparison
                            .lowestLocal
                            .distance ||
                            "Baiskit listing"}
                        </p>
                      </>
                    ) : (
                      <p className="mt-5 text-xs text-slate-400">
                        No local price found
                      </p>
                    )}
                  </div>

                  {/* SECOND HAND */}

                  <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">

                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        ♻️ Second-Hand
                      </p>

                      <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-600">
                        USED
                      </span>
                    </div>

                    {apiResults.comparison?.lowestSecondHand ? (
                      <>
                        <h3 className="mt-4 line-clamp-1 text-xs font-black text-slate-900">
                          {apiResults.comparison.lowestSecondHand.seller ||
                            apiResults.comparison.lowestSecondHand.platform}
                        </h3>

                        <p className="mt-1 text-2xl font-black text-emerald-600">
                          ₹
                          {
                            apiResults.comparison
                              .lowestSecondHand
                              .price
                          }
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          {apiResults.comparison
                            .lowestSecondHand
                            .condition ||
                            "Second-hand"}
                        </p>
                      </>
                    ) : (
                      <p className="mt-5 text-xs text-slate-400">
                        No second-hand price found
                      </p>
                    )}
                  </div>

                  {/* ONLINE */}

                  <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm">

                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        🌐 Lowest Online
                      </p>

                      <span className="rounded-lg bg-blue-50 px-2 py-1 text-[9px] font-black text-blue-600">
                        LIVE
                      </span>
                    </div>

                    {apiResults.comparison?.lowestOnline ? (
                      <>
                        <h3 className="mt-4 line-clamp-1 text-xs font-black text-slate-900">
                          {
                            apiResults.comparison
                              .lowestOnline
                              .platform
                          }
                        </h3>

                        <p className="mt-1 text-2xl font-black text-blue-600">
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
                              apiResults.comparison
                                .lowestOnline
                                .url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-[10px] font-black text-blue-600 hover:underline"
                          >
                            View Online Deal →
                          </a>
                        )}
                      </>
                    ) : (
                      <p className="mt-5 text-xs text-slate-400">
                        Online prices not available yet
                      </p>
                    )}
                  </div>

                </div>

                {/* ALL PRICE RESULTS */}

                {apiResults.priceResults?.length > 0 && (
                  <div className="space-y-3">

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-indigo-600">
                          Marketplace results
                        </p>

                        <h3 className="mt-1 text-lg font-black text-slate-900">
                          All Available Prices
                        </h3>
                      </div>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black text-slate-500">
                        {apiResults.priceResults.length} offers
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

                      {apiResults.priceResults.map(
                        (item, index) => {

                          const isOnline =
                            item.type === "online"

                          const isSecondHand =
                            item.type === "second-hand"

                          return (
                            <div
                              key={`${item.seller || item.platform || "price"}-${index}`}
                              className="group rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >

                              <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                  <div className="flex flex-wrap items-center gap-2">

                                    <h4 className="max-w-[190px] truncate text-xs font-black text-slate-900">
                                      {item.seller ||
                                        item.platform ||
                                        "Seller"}
                                    </h4>

                                    <span
                                      className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-black uppercase ${
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

                                  <p className="mt-1.5 truncate text-[10px] font-medium text-slate-500">
                                    {item.product ||
                                      search}
                                  </p>

                                  <p className="mt-1 text-[9px] text-slate-400">
                                    {item.condition || ""}

                                    {item.distance
                                      ? ` • ${item.distance}`
                                      : ""}
                                  </p>
                                </div>

                                <div className="shrink-0 text-right">

                                  <p className="text-xl font-black tracking-tight text-slate-900">
                                    ₹{item.price}
                                  </p>

                                  {item.rating && (
                                    <p className="mt-0.5 text-[9px] font-black text-amber-500">
                                      ⭐ {item.rating}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">

                                <span className="truncate text-[9px] font-bold text-slate-400">
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
                                    className="shrink-0 rounded-xl bg-blue-600 px-3.5 py-2 text-[10px] font-black text-white transition hover:bg-blue-700"
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
                                    className="shrink-0 rounded-xl bg-slate-950 px-3.5 py-2 text-[10px] font-black text-white transition hover:bg-slate-800"
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

                {/* NO RESULTS */}

                {!apiResults.priceResults?.length && (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                      🔍
                    </div>

                    <p className="mt-3 text-sm font-black text-slate-700">
                      No price results found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try another product name or a more specific model.
                    </p>

                  </div>
                )}

                {/* NEARBY VENDORS */}

                {apiResults.nearbyVendors?.length > 0 && (
                  <div className="space-y-3">

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-indigo-600">
                          Physical stores
                        </p>

                        <h3 className="mt-1 text-lg font-black text-slate-900">
                          Nearby Stores
                        </h3>
                      </div>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black text-slate-500">
                        {apiResults.nearbyVendors.length} found
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      {apiResults.nearbyVendors.map(
                        (vendor, index) => (
                          <div
                            key={`${vendor.name || "vendor"}-${index}`}
                            className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                          >

                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0">

                                <h4 className="truncate text-xs font-black text-slate-900">
                                  {vendor.name ||
                                    "Nearby Store"}
                                </h4>

                                <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                                  {vendor.address ||
                                    "Local store"}
                                </p>

                                {vendor.distance && (
                                  <p className="mt-2 text-[9px] font-black text-indigo-600">
                                    📍 {vendor.distance}
                                  </p>
                                )}

                              </div>

                              <div className="shrink-0 text-right">

                                {vendor.rating && (
                                  <p className="rounded-lg bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-600">
                                    ⭐ {vendor.rating}
                                  </p>
                                )}

                                {vendor.openNow !==
                                  null &&
                                  vendor.openNow !==
                                    undefined && (
                                    <p
                                      className={`mt-1.5 text-[9px] font-black ${
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
                                className="mt-3 inline-flex items-center rounded-xl bg-indigo-50 px-3 py-2 text-[10px] font-black text-indigo-700 transition hover:bg-indigo-100"
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

            {/* ==================================================
                PRODUCT FEED
            ================================================== */}

            {!apiResults && !isLoading && (
              <section className="mt-8 space-y-4">

                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600">
                    Explore
                  </p>

                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                    Popular Products
                  </h2>

                  <p className="text-xs text-slate-500">
                    Browse available Baiskit products and add them to your basket.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

                {filteredProducts.length === 0 && (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                      🔍
                    </div>

                    <h3 className="mt-3 text-sm font-black text-slate-800">
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

      {/* --------------------------------------------------
          MOBILE NAV
      -------------------------------------------------- */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/90 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-2xl lg:hidden">

        <div className="grid grid-cols-4 gap-1">

          {[
            ["home", "🏠", "Home"],
            ["vendors", "🏪", "Stores"],
            ["orders", "📦", "Orders"],
            ["basket", "🛒", "Basket"]
          ].map(([target, icon, label]) => {

            const active =
              page === target ||
              (target === "vendors" &&
                page === "store")

            return (
              <button
                key={target}
                onClick={() =>
                  setPage(target)
                }
                className={`relative flex flex-col items-center gap-1 rounded-2xl py-2 text-[9px] font-black transition ${
                  active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >

                <span className="text-lg leading-none">
                  {icon}
                </span>

                {label}

                {target === "basket" &&
                  cartCount > 0 && (
                    <span className="absolute right-[22%] top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-black text-white ring-2 ring-white">
                      {cartCount}
                    </span>
                  )}

              </button>
            )
          })}

        </div>
      </nav>

    </div>
  )
}