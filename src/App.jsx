
import { useState, useRef } from "react"
import ProductCard from "./components/ProductCard"
import VendorCard from "./components/VendorCard"
import OrderCard from "./components/OrderCard"
import { products as initialProducts, sellers as initialSellers } from "./data/data"

export default function App() {
  const [products] = useState(initialProducts || [])
  const [sellers] = useState(initialSellers || [])
  const [cart, setCart] = useState([])
  const [page, setPage] = useState("home")
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  
  // AI Reverse Demand Matchmaker State
  const [request, setRequest] = useState("")
  const [budget, setBudget] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [matches, setMatches] = useState([])

  // Search, Promo & Order State
  const [search, setSearch] = useState("")
  const [orders, setOrders] = useState([])
  const [promoCode, setPromoCode] = useState("")
  const [discountPercent, setDiscountPercent] = useState(0)
  const [toast, setToast] = useState(null)
  const [apiResults, setApiResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const toastTimerRef = useRef(null)

  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = setTimeout(() => setToast(null), 2500)
  }

  const searchBaiskit = async () => {
    if (!search.trim()) return
    setIsLoading(true)
    setPage("home") // Ensure user sees the search results

    try {
      const response = await fetch(
  `https://baiskit.onrender.com/api/compare/${encodeURIComponent(search)}`
)

      if (!response.ok) {
        setApiResults(null)
        showToast("No comparison found for this product")
        return
      }

      const data = await response.json()
      setApiResults(data)
    } catch (error) {
      console.error("Baiskit API error:", error)
      setApiResults(null)
      showToast("Could not connect to comparison server")
    } finally {
      setIsLoading(false)
    }
  }

  const clearSearch = () => {
    setSearch("")
    setApiResults(null)
  }

  // Cart operations
  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id)
    if (existing) {
      setCart(cart.map((item) => item.id === product.id ? { ...item, qty: (item.qty || 1) + 1 } : item))
    } else {
      setCart([...cart, { ...product, qty: 1 }])
    }
    showToast(`Added ${product.name} to Basket!`)
  }

  const updateCartQty = (id, delta) => {
    setCart(
      cart
        .map((item) => item.id === id ? { ...item, qty: (item.qty || 1) + delta } : item)
        .filter((item) => item.qty > 0)
    )
  }

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id))
    showToast("Item removed from basket")
  }

  // Promo Code
  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "BAISKIT20") {
      setDiscountPercent(0.20)
      showToast("🎉 20% Discount Activated!")
    } else {
      showToast("❌ Invalid Promo Code")
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1), 0)
  const discountAmount = subtotal * discountPercent
  const grandTotal = Math.max(0, subtotal - discountAmount)

  // Place Order
  const placeOrder = () => {
    if (cart.length === 0) return

    const newOrder = {
      id: `BSK-${Math.floor(100000 + Math.random() * 900000)}`,
      products: [...cart],
      total: Math.round(grandTotal),
      date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      status: "Confirmed",
      estimatedDelivery: "Today, by 8:30 PM",
    }

    setOrders([newOrder, ...orders])
    setCart([])
    setDiscountPercent(0)
    setPromoCode("")
    setPage("orders")
    showToast("🎉 Order Placed Successfully!")
  }

  // Filtered Products
  const filteredProducts = products.filter((product) => {
    const productName = product.name?.toLowerCase() || ""
    const vendorName = product.vendor?.toLowerCase() || ""
    const productCategory = product.category?.toLowerCase() || ""
    const query = search.toLowerCase()

    const matchesSearch = productName.includes(query) || vendorName.includes(query)
    const matchesCategory = selectedCategory === "All" || productCategory === selectedCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

  // Reverse Matchmaker
  const findMatches = () => {
    if (!request.trim()) {
      showToast("Please enter what you are looking for")
      return
    }
    const results = sellers.filter((seller) => {
      const productName = seller.product?.toLowerCase() || ""
      const sellerName = seller.name?.toLowerCase() || ""
      const query = request.toLowerCase()

      const matchText = productName.includes(query) || sellerName.includes(query)
      const totalPrice = (Number(seller.price) || 0) * quantity
      const matchBudget = budget ? totalPrice <= Number(budget) : true
      
      return matchText && matchBudget
    })
    setMatches(results)
    if (results.length === 0) {
      showToast("No vendors found within that budget")
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/90 backdrop-blur-xl px-5 py-2.5 text-xs font-bold text-white shadow-2xl border border-slate-800 animate-bounce">
          <span>✨</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80">
        <div className="mx-auto max-w-lg px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div 
              onClick={() => { setPage("home"); clearSearch(); }} 
              className="flex items-center gap-3 cursor-pointer group"
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
                <p className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Indiranagar • 15 min delivery</span>
                </p>
              </div>
            </div>

            <button 
              onClick={() => setPage("baiskit")}
              className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
            >
              <span>✨ Demand</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-3 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search & hit Enter to compare deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchBaiskit()
                }
              }}
              className="w-full rounded-2xl border border-slate-200/90 bg-slate-100/70 pl-10 pr-16 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
            {search && (
                  <>
                    <button
                      onClick={searchBaiskit}
                      disabled={isLoading}
                      aria-label="Search"
                      className="absolute inset-y-0 right-8 flex items-center pr-1 text-indigo-500 hover:text-indigo-700 transition disabled:opacity-50"
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

      {/* Main View Area */}
      <main className="mx-auto max-w-lg px-5 py-5 pb-28">

        {/* 1. Basket View */}
        {page === "basket" && (
          <section className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Your Basket</h2>
                <p className="text-xs font-medium text-slate-500">{cart.reduce((s, i) => s + (i.qty || 1), 0)} items in your cart</p>
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
                <h3 className="text-base font-bold text-slate-800">Your basket is empty</h3>
                <p className="mt-1 text-xs text-slate-500">Discover great deals from verified local stores around you.</p>
                <button
                  onClick={() => setPage("home")}
                  className="mt-5 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition active:scale-95"
                >
                  Browse Trending Products
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-16 w-16 rounded-xl object-cover border border-slate-100"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                          <p className="text-[11px] text-slate-500">{item.vendor}</p>
                          <p className="mt-1 text-xs font-black text-indigo-600">₹{(item.price || 0) * (item.qty || 1)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-1.5 py-1">
                          <button 
                            onClick={() => updateCartQty(item.id, -1)}
                            className="h-6 w-6 rounded-lg bg-white text-xs font-bold text-slate-700 shadow-sm flex items-center justify-center hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-black text-slate-800">{item.qty || 1}</span>
                          <button 
                            onClick={() => updateCartQty(item.id, 1)}
                            className="h-6 w-6 rounded-lg bg-white text-xs font-bold text-slate-700 shadow-sm flex items-center justify-center hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm flex gap-2">
                  <input
                    type="text"
                    placeholder="Voucher (e.g. BAISKIT20)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={applyPromo}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                  >
                    Apply
                  </button>
                </div>

                {/* Bill Breakdown */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-800">₹{subtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600">
                      <span>Voucher Discount</span>
                      <span className="font-bold">-₹{Math.round(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Delivery</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-slate-900">Total Payable</p>
                      <p className="text-[10px] text-slate-400">Taxes Included</p>
                    </div>
                    <span className="text-xl font-black text-indigo-600">₹{Math.round(grandTotal)}</span>
                  </div>

                  <button
                    onClick={placeOrder}
                    className="w-full mt-2 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 py-3.5 text-xs font-black text-white shadow-xl shadow-slate-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Proceed to 1-Tap Checkout</span>
                    <span>⚡</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 2. Baiskit Demand Creator */}
        {page === "baiskit" && (
          <section className="animate-in fade-in duration-300">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-6 text-white shadow-xl">
              <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-violet-500/20 blur-2xl"></div>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-300 border border-indigo-500/30">
                Reverse Marketplace
              </span>
              <h2 className="mt-3 text-2xl font-black tracking-tight">Create a Baiskit Demand</h2>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Tell nearby sellers your exact budget. Verified local shops will compete to fulfill your order.
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
                  onChange={(e) => setRequest(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Max Target Budget (₹)
                  </label>
                  <span className="text-[10px] font-bold text-indigo-600">Smart Price AI</span>
                </div>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                />

                <div className="mt-2 flex gap-2 overflow-x-auto pb-1 text-xs">
                  {["1000", "1500", "2000", "3000"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBudget(amt)}
                      className={`rounded-xl px-3 py-1 text-xs font-bold transition ${
                        budget === amt
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8 rounded-xl bg-white font-bold text-slate-700 shadow-sm flex items-center justify-center hover:bg-slate-100"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-black text-slate-800 text-xs">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8 rounded-xl bg-white font-bold text-slate-700 shadow-sm flex items-center justify-center hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400">1 unit = Standard warranty</span>
                </div>
              </div>

              <button
                onClick={findMatches}
                className="w-full mt-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-xs font-black text-white shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
              >
                <span>Find Matched Sellers</span>
                <span>✨</span>
              </button>
            </div>

            {/* Match Results */}
            {matches.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-900">Found {matches.length} Verified Offers</h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    Within Budget
                  </span>
                </div>

                {matches.map((seller) => (
                  <div 
                    key={seller.id}
                    className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-xs text-slate-900">{seller.name}</h4>
                          {seller.verified && (
                            <span className="h-3.5 w-3.5 rounded-full bg-blue-500 text-[8px] text-white flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{seller.type} • {seller.distance}</p>
                      </div>
                      <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg">
                        ⭐ {seller.rating}
                      </span>
                    </div>

                    <div className="mt-3 border-t border-slate-100 pt-3 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Offer Price</p>
                        <p className="text-lg font-black text-indigo-600">₹{seller.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedVendor(seller.name)
                            setPage("store")
                          }}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                        >
                          Visit Store
                        </button>
                        <button 
                          onClick={() => showToast(`Connecting to ${seller.name}...`)}
                          className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                        >
                          Lock Deal
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. Vendors Directory */}
        {page === "vendors" && (
          <section className="animate-in fade-in duration-300">
            <div className="mb-5">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Local Verified Stores 🏪</h2>
              <p className="text-xs text-slate-500 mt-0.5">Top-rated physical neighborhood retailers with instant pickup</p>
            </div>

            <div className="space-y-3.5">
              {sellers.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  name={vendor.name}
                  type={vendor.type}
                  distance={vendor.distance}
                  rating={vendor.rating}
                  onView={() => {
                    setSelectedVendor(vendor.name)
                    setPage("store")
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* 4. Single Store Page */}
        {page === "store" && (
          <section className="animate-in fade-in duration-300">
            <button
              onClick={() => setPage("vendors")}
              className="mb-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              ← Back to Stores
            </button>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">{selectedVendor || "Local Merchant"}</h2>
                    <span className="h-4 w-4 rounded-full bg-blue-600 text-[9px] text-white flex items-center justify-center font-bold">✓</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">📍 100ft Road, Indiranagar, Bengaluru</p>
                  <div className="mt-2 flex gap-2">
                    <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">● Open Now</span>
                    <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">⭐ 4.8 Rating</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                  🏪
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">About Merchant</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Premier authorized dealer providing authentic product warranties, express home trial, and instant returns on Baiskit.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button 
                  onClick={() => showToast(`Calling ${selectedVendor}...`)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  📞 Call Store
                </button>
                <button 
                  onClick={() => showToast("Opening Live Chat...")}
                  className="rounded-2xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  💬 Message
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 5. Orders Page */}
        {page === "orders" && (
          <section className="animate-in fade-in duration-300">
            <div className="mb-5">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Your Orders 📦</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time status & receipt history</p>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  📦
                </div>
                <h3 className="font-bold text-slate-800 text-sm">No Orders Placed Yet</h3>
                <p className="text-xs text-slate-400 mt-1">When you checkout, your delivery updates will appear here.</p>
                <button
                  onClick={() => setPage("home")}
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 6. Home Product Feed */}
        {page === "home" && (
          <div className="animate-in fade-in duration-300 space-y-6">
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center text-xs font-bold text-indigo-700 animate-pulse">
                🔍 Searching best deals across nearby stores...
              </div>
            )}

            {/* Baiskit Comparison Section */}
            {apiResults && (
              <section className="rounded-3xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>Baiskit Price Match</span>
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">LIVE</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {apiResults.totalMatches ?? 0} local options found for "{apiResults.product || search}"
                    </p>
                  </div>
                  <button 
                    onClick={() => setApiResults(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-xs"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Savings Callout */}
                {apiResults.savings?.amount > 0 && (
                  <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-3.5 text-white shadow-md shadow-emerald-500/20 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">Local Advantage</p>
                      <p className="text-xs font-black mt-0.5">
                        Save ₹{apiResults.savings.amount} ({apiResults.savings.percent}% OFF) vs Online Apps!
                      </p>
                    </div>
                    <span className="text-2xl">💰</span>
                  </div>
                )}

                {/* Best Local Deal vs Commercial Apps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Best Local Deal */}
                  {apiResults.bestDeal && (
                    <div className="rounded-2xl bg-white border-2 border-indigo-500/30 p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl">
                        Local Lowest
                      </div>
                      
                      <div>
                        <span className="inline-block rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 mb-1.5 border border-emerald-200">
                          🏆 Best Local Seller
                        </span>

                        <h3 className="text-sm font-black text-slate-900">
                          {apiResults.bestDeal.seller}
                        </h3>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {apiResults.bestDeal.condition} • {apiResults.bestDeal.distance}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Baiskit Price</p>
                          <p className="text-lg font-black text-indigo-600">
                            ₹{apiResults.bestDeal.price}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            addToCart({
                              id: `compare-${apiResults.bestDeal.id || Date.now()}`,
                              name: `${apiResults.product || search} (${apiResults.bestDeal.condition})`,
                              price: apiResults.bestDeal.price,
                              vendor: apiResults.bestDeal.seller,
                              image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80"
                            })
                          }}
                          className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition active:scale-95 shadow-sm"
                        >
                          Add to Basket 🛒
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Commercial Apps Comparison */}
                  {apiResults.commercialApps?.length > 0 && (
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Commercial Apps</p>
                        <span className="text-[10px] text-slate-400">Market Rates</span>
                      </div>

                      <div className="space-y-2">
                        {apiResults.commercialApps.map((app) => (
                          <div
                            key={app.platform}
                            className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-200/80 shadow-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{app.logo}</span>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{app.platform}</h4>
                                <p className="text-[10px] text-slate-400">{app.delivery}</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-xs font-bold text-slate-700 line-through opacity-75">
                                ₹{app.price}
                              </p>
                              {apiResults.bestDeal && (
                                <span className="text-[9px] font-bold text-rose-500">
                                  +₹{Math.max(0, app.price - apiResults.bestDeal.price)} higher
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Other Local Sellers */}
                {apiResults.options?.length > 1 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Other Local Sellers</p>
                    <div className="space-y-2">
                      {apiResults.options.slice(1).map((option) => (
                        <div
                          key={option.id || option.seller}
                          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {option.seller}
                            </h4>

                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {option.sellerType} • {option.condition} • {option.distance}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs font-black text-slate-900">
                                ₹{option.price}
                              </p>
                              {option.verified && (
                                <p className="text-[10px] text-emerald-600 font-bold">
                                  ✓ Verified
                                </p>
                              )}
                            </div>
                            
                            <button
                              onClick={() => {
                                addToCart({
                                  id: `compare-${option.id || Date.now()}`,
                                  name: `${apiResults.product || search} (${option.condition})`,
                                  price: option.price,
                                  vendor: option.seller,
                                  image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80"
                                })
                              }}
                              className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition active:scale-95"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Categories */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Browse by Category</h2>
                {selectedCategory !== "All" && (
                  <button 
                    onClick={() => setSelectedCategory("All")}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { name: "Electronics", icon: "🎧" },
                  { name: "Home", icon: "🛋️" },
                  { name: "Fashion", icon: "👟" },
                  { name: "Books", icon: "📖" },
                  { name: "Gaming", icon: "🎮" },
                ].map((cat) => {
                  const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(isActive ? "All" : cat.name)}
                      className={`group flex flex-col items-center justify-center rounded-2xl p-3 transition-all duration-200 active:scale-95 ${
                        isActive
                          ? "bg-slate-900 text-white shadow-lg ring-2 ring-indigo-500"
                          : "border border-slate-200/80 bg-white text-slate-700 shadow-sm hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xl group-hover:scale-110 transition">{cat.icon}</span>
                      <p className="mt-1 text-[11px] font-bold">{cat.name}</p>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Promo Banner */}
            <section>
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-5 text-white shadow-xl">
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-indigo-500/20 blur-2xl"></div>
                <span className="rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-200 border border-indigo-500/30">
                  Instant Deal
                </span>
                <h3 className="mt-2 text-xl font-black tracking-tight">Flat 20% Off Local Stores</h3>
                <p className="mt-1 text-xs text-slate-300">
                  Use coupon <span className="font-bold text-white bg-white/15 px-1.5 py-0.5 rounded">BAISKIT20</span> at checkout.
                </p>
                <button
                  onClick={() => {
                    setPromoCode("BAISKIT20")
                    showToast("Applied code BAISKIT20!")
                  }}
                  className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-black text-slate-950 shadow hover:bg-slate-100 transition active:scale-95"
                >
                  <span>Apply Offer</span>
                  <span>→</span>
                </button>
              </div>
            </section>

            {/* Products Feed */}
            <section>
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h2 className="text-base font-black tracking-tight text-slate-900">Trending Nearby</h2>
                  <p className="text-[11px] text-slate-500">{filteredProducts.length} verified listings in stock</p>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
                  No products found matching "{search}".
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAdd={() => addToCart(product)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation Dock */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-2xl px-3 py-2 shadow-2xl shadow-slate-950/15">
        <div className="grid grid-cols-5 items-center text-center">
          
          <button
            onClick={() => setPage("home")}
            className={`flex flex-col items-center py-1 transition ${
              page === "home" ? "text-indigo-600 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="text-lg">🏠</span>
            <span className="text-[10px] mt-0.5">Home</span>
            {page === "home" && <span className="h-1 w-1 rounded-full bg-indigo-600 mt-0.5"></span>}
          </button>

          <button
            onClick={() => setPage("vendors")}
            className={`flex flex-col items-center py-1 transition ${
              page === "vendors" || page === "store" ? "text-indigo-600 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="text-lg">🏪</span>
            <span className="text-[10px] mt-0.5">Stores</span>
            {(page === "vendors" || page === "store") && <span className="h-1 w-1 rounded-full bg-indigo-600 mt-0.5"></span>}
          </button>

          <button
            onClick={() => setPage("baiskit")}
            className="group flex flex-col items-center -mt-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/35 group-hover:scale-105 active:scale-95 transition">
              <span className="text-xl">✨</span>
            </div>
            <span className="text-[10px] font-bold text-slate-700 mt-1">Demand</span>
          </button>

          <button
            onClick={() => setPage("basket")}
            className={`relative flex flex-col items-center py-1 transition ${
              page === "basket" ? "text-indigo-600 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className="relative">
              <span className="text-lg">🛒</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white animate-pulse">
                  {cart.reduce((s, i) => s + (i.qty || 1), 0)}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Basket</span>
            {page === "basket" && <span className="h-1 w-1 rounded-full bg-indigo-600 mt-0.5"></span>}
          </button>

          <button
            onClick={() => setPage("orders")}
            className={`flex flex-col items-center py-1 transition ${
              page === "orders" ? "text-indigo-600 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="text-lg">📦</span>
            <span className="text-[10px] mt-0.5">Orders</span>
            {page === "orders" && <span className="h-1 w-1 rounded-full bg-indigo-600 mt-0.5"></span>}
          </button>
        </div>
      </nav>

    </div>
  )
}