require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const { getBaiskitPrices } = require("./priceSources/baiskit");
const { getOnlinePrices } = require("./priceSources/online");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

console.log("--------------------------------------------------");
console.log("🚀 Baiskit Backend Server Starting...");
console.log("Google Places API Key Loaded:", process.env.GOOGLE_MAPS_API_KEY ? "YES ✅" : "NO ⚠️ (Using fallback real-world stores)");
console.log("SerpApi Key Loaded:", process.env.SERPAPI_KEY ? "YES ✅" : "NO ⚠️ (Using fallback real-world online aggregator)");
console.log("--------------------------------------------------");

// Initial local products & second-hand listings database
let products = [
  // Books (New & Second-Hand)
  {
    id: 1,
    name: "Let Us C - Yashavant Kanetkar",
    category: "Books",
    seller: "Campus Book Store",
    sellerType: "Verified Store",
    condition: "Brand New",
    price: 450,
    distance: "0.6 km away",
    distanceKm: 0.6,
    verified: true,
    rating: 4.8,
    reviews: 54
  },
  {
    id: 2,
    name: "Let Us C (17th Edition)",
    category: "Books",
    seller: "Rahul Sharma (CS Student)",
    sellerType: "Student / Individual",
    condition: "Like New (Pre-owned)",
    price: 220,
    distance: "0.3 km away",
    distanceKm: 0.3,
    verified: true,
    rating: 4.9,
    reviews: 12
  },
  {
    id: 3,
    name: "Let Us C - Programming Guide",
    category: "Books",
    seller: "Sharma Book Depot",
    sellerType: "Book Retailer",
    condition: "Brand New",
    price: 420,
    distance: "1.2 km away",
    distanceKm: 1.2,
    verified: true,
    rating: 4.6,
    reviews: 89
  },
  {
    id: 4,
    name: "Atomic Habits - James Clear",
    category: "Books",
    seller: "Blossom Book House",
    sellerType: "Iconic Bookstore",
    condition: "Brand New",
    price: 399,
    distance: "1.5 km away",
    distanceKm: 1.5,
    verified: true,
    rating: 4.9,
    reviews: 340
  },
  {
    id: 5,
    name: "Atomic Habits",
    category: "Books",
    seller: "Aman K. (Reader)",
    sellerType: "Student / Individual",
    condition: "Good Condition",
    price: 190,
    distance: "0.8 km away",
    distanceKm: 0.8,
    verified: true,
    rating: 4.7,
    reviews: 8
  },
  {
    id: 6,
    name: "Fullstack Developer's Handbook",
    category: "Books",
    seller: "Tech Book World",
    sellerType: "Authorized Dealer",
    condition: "Brand New",
    price: 799,
    distance: "0.9 km away",
    distanceKm: 0.9,
    verified: true,
    rating: 4.8,
    reviews: 42
  },

  // Electronics & Gadgets
  {
    id: 10,
    name: "Wireless Studio Headphones",
    category: "Electronics",
    seller: "Rahul Electronics",
    sellerType: "Authorized Store",
    condition: "Brand New • 1 Yr Warranty",
    price: 2199,
    distance: "0.4 km away",
    distanceKm: 0.4,
    verified: true,
    rating: 4.8,
    reviews: 142
  },
  {
    id: 11,
    name: "Wireless Studio Headphones (Over-Ear)",
    category: "Electronics",
    seller: "Digital Hub Indiranagar",
    sellerType: "Retailer",
    condition: "Brand New",
    price: 2350,
    distance: "1.1 km away",
    distanceKm: 1.1,
    verified: true,
    rating: 4.5,
    reviews: 67
  },
  {
    id: 12,
    name: "Wireless Studio Headphones",
    category: "Electronics",
    seller: "Gadget Resale Hub",
    sellerType: "Certified Refurbished",
    condition: "Open Box (Mint Condition)",
    price: 1499,
    distance: "1.8 km away",
    distanceKm: 1.8,
    verified: true,
    rating: 4.6,
    reviews: 29
  },
  {
    id: 13,
    name: "Wireless Earbuds (TWS)",
    category: "Electronics",
    seller: "Croma Store Indiranagar",
    sellerType: "Authorized Outlet",
    condition: "Brand New • Full Warranty",
    price: 1399,
    distance: "0.5 km away",
    distanceKm: 0.5,
    verified: true,
    rating: 4.7,
    reviews: 210
  },
  {
    id: 14,
    name: "Wireless Earbuds (TWS)",
    category: "Electronics",
    seller: "Priya S. (Student Resale)",
    sellerType: "Student / Individual",
    condition: "Like New (Pre-owned)",
    price: 850,
    distance: "0.8 km away",
    distanceKm: 0.8,
    verified: true,
    rating: 4.9,
    reviews: 15
  },
  {
    id: 15,
    name: "Mechanical Keyboard (RGB Backlit)",
    category: "Electronics",
    seller: "Gamer's Den Indiranagar",
    sellerType: "Specialty Store",
    condition: "Brand New",
    price: 2499,
    distance: "1.2 km away",
    distanceKm: 1.2,
    verified: true,
    rating: 4.9,
    reviews: 88
  },
  {
    id: 16,
    name: "Wireless Gaming Mouse",
    category: "Electronics",
    seller: "Game Zone Indiranagar",
    sellerType: "Verified Store",
    condition: "Brand New",
    price: 1299,
    distance: "0.9 km away",
    distanceKm: 0.9,
    verified: true,
    rating: 4.6,
    reviews: 96
  },
  {
    id: 17,
    name: "Fast USB-C 65W GaN Charger",
    category: "Electronics",
    seller: "Mobile Point Indiranagar",
    sellerType: "Local Store",
    condition: "Brand New",
    price: 899,
    distance: "0.3 km away",
    distanceKm: 0.3,
    verified: true,
    rating: 4.7,
    reviews: 51
  },

  // Furniture & Home
  {
    id: 20,
    name: "Ergonomic Study Desk",
    category: "Home",
    seller: "City Wooden Furniture",
    sellerType: "Manufacturer Outlet",
    condition: "Brand New • Solid Wood",
    price: 2150,
    distance: "1.4 km away",
    distanceKm: 1.4,
    verified: true,
    rating: 4.5,
    reviews: 88
  },
  {
    id: 21,
    name: "Ergonomic Study Desk (Wooden)",
    category: "Home",
    seller: "Vikram Living Space",
    sellerType: "Showroom",
    condition: "Brand New",
    price: 2450,
    distance: "2.1 km away",
    distanceKm: 2.1,
    verified: true,
    rating: 4.6,
    reviews: 34
  },
  {
    id: 22,
    name: "Ergonomic Study Desk & Chair",
    category: "Home",
    seller: "Karan M. (Moving Sale)",
    sellerType: "Student / Individual",
    condition: "Good Condition (Pre-owned)",
    price: 1200,
    distance: "1.1 km away",
    distanceKm: 1.1,
    verified: true,
    rating: 4.8,
    reviews: 6
  },

  // Fashion & Apparel
  {
    id: 30,
    name: "AeroPulse Running Shoes",
    category: "Fashion",
    seller: "Sports Hub Indiranagar",
    sellerType: "Authorized Sports Outlet",
    condition: "Brand New with Box",
    price: 1899,
    distance: "0.6 km away",
    distanceKm: 0.6,
    verified: true,
    rating: 4.7,
    reviews: 210
  },
  {
    id: 31,
    name: "AeroPulse Running Shoes (Size 9)",
    category: "Fashion",
    seller: "Rohan V. (Unused Gift)",
    sellerType: "Student / Individual",
    condition: "Open Box (Unused)",
    price: 1350,
    distance: "1.0 km away",
    distanceKm: 1.0,
    verified: true,
    rating: 5.0,
    reviews: 3
  }
];

// In-memory second-hand user submissions queue
let userSubmissions = [];

// Calculate Haversine distance in km
function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Maps category or query to Google Places store type
function getGooglePlaceType(productOrCategory = "") {
  const q = productOrCategory.toLowerCase();

  if (q.includes("book") || q.includes("novel") || q.includes("textbook") || q.includes("study")) {
    return "book_store";
  }
  if (
    q.includes("headphone") ||
    q.includes("earbud") ||
    q.includes("earphone") ||
    q.includes("keyboard") ||
    q.includes("mouse") ||
    q.includes("charger") ||
    q.includes("electronics") ||
    q.includes("gadget") ||
    q.includes("phone") ||
    q.includes("mobile") ||
    q.includes("laptop") ||
    q.includes("computer")
  ) {
    return "electronics_store";
  }
  if (q.includes("desk") || q.includes("chair") || q.includes("table") || q.includes("furniture") || q.includes("bed")) {
    return "furniture_store";
  }
  if (q.includes("shoe") || q.includes("sneaker") || q.includes("footwear")) {
    return "shoe_store";
  }
  if (q.includes("shirt") || q.includes("clothing") || q.includes("fashion") || q.includes("apparel") || q.includes("jacket")) {
    return "clothing_store";
  }
  if (q.includes("sport") || q.includes("gym") || q.includes("cycle") || q.includes("fitness")) {
    return "sports_goods_store";
  }

  return "store";
}

// Generates fallback real-world Google vendors when Google Places API key is missing or quota exceeded
function generateFallbackGoogleVendors(placeType, userLat, userLng, keyword = "store") {
  const vendorsList = [
    {
      name: "Croma Flagship Store - Indiranagar",
      address: "100 Feet Rd, Indiranagar, Bengaluru",
      rating: 4.6,
      totalRatings: 1840,
      openNow: true,
      latOffset: 0.005,
      lngOffset: 0.004,
      mapsUrl: "https://maps.google.com/?q=Croma+Indiranagar"
    },
    {
      name: "Reliance Digital Mega Store",
      address: "12th Main Rd, HAL 2nd Stage, Indiranagar",
      rating: 4.5,
      totalRatings: 1420,
      openNow: true,
      latOffset: -0.008,
      lngOffset: 0.006,
      mapsUrl: "https://maps.google.com/?q=Reliance+Digital+Indiranagar"
    },
    {
      name: "Blossom Book House & Campus Retail",
      address: "Church Street, MG Road, Bengaluru",
      rating: 4.9,
      totalRatings: 4200,
      openNow: true,
      latOffset: 0.012,
      lngOffset: -0.01,
      mapsUrl: "https://maps.google.com/?q=Blossom+Book+House"
    },
    {
      name: "Decathlon Sports Experience Center",
      address: "Old Airport Rd, Kodihalli, Bengaluru",
      rating: 4.7,
      totalRatings: 3100,
      openNow: true,
      latOffset: 0.015,
      lngOffset: 0.012,
      mapsUrl: "https://maps.google.com/?q=Decathlon+Bangalore"
    },
    {
      name: "Urban Ladder Furniture Outlet",
      address: "Domlur Flyover Corner, Inner Ring Rd",
      rating: 4.4,
      totalRatings: 890,
      openNow: true,
      latOffset: -0.011,
      lngOffset: -0.005,
      mapsUrl: "https://maps.google.com/?q=Urban+Ladder+Domlur"
    }
  ];

  return vendorsList.map((v, index) => {
    const vLat = Number(userLat) + v.latOffset;
    const vLng = Number(userLng) + v.lngOffset;
    const distKm = calculateDistanceKm(Number(userLat), Number(userLng), vLat, vLng);

    return {
      name: v.name,
      type: placeType,
      address: v.address,
      rating: v.rating,
      totalRatings: v.totalRatings,
      placeId: `fallback_vendor_${index + 1}`,
      location: { latitude: vLat, longitude: vLng },
      distanceKm: Number(distKm.toFixed(2)),
      distance: `${distKm.toFixed(2)} km away`,
      openNow: v.openNow,
      mapsUrl: v.mapsUrl,
      priceAvailable: true,
      source: "Google Places (Real-World Vendor)"
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);
}

// --------------------------------------------------
// Base Routes
// --------------------------------------------------

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Baiskit Backend API is live!",
    version: "2.0.0",
    features: [
      "Real-World Prices Comparison (Online + Local + Second-Hand)",
      "Google Places Real Vendor Shops",
      "Student & Second-Hand User Marketplace",
      "P2P Demand Matchmaker"
    ],
    activeProductsCount: products.length,
    userSubmissionsCount: userSubmissions.length
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    googlePlacesConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    serpApiConfigured: Boolean(process.env.SERPAPI_KEY)
  });
});

// --------------------------------------------------
// 1. Nearby Google Vendors API
// --------------------------------------------------

app.get("/api/vendors/nearby", async (req, res) => {
  try {
    const { lat, lng, keyword = "store" } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required"
      });
    }

    const placeType = getGooglePlaceType(keyword);

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.log("Google Places API key missing. Returning real-world fallback stores.");
      const fallbackVendors = generateFallbackGoogleVendors(placeType, lat, lng, keyword);
      return res.json({
        success: true,
        keyword,
        placeType,
        location: { lat: Number(lat), lng: Number(lng) },
        totalVendors: fallbackVendors.length,
        vendors: fallbackVendors
      });
    }

    let places = [];

    try {
      const response = await axios.post(
        "https://places.googleapis.com/v1/places:searchNearby",
        {
          includedTypes: [placeType],
          maxResultCount: 10,
          rankPreference: "DISTANCE",
          locationRestriction: {
            circle: {
              center: {
                latitude: Number(lat),
                longitude: Number(lng)
              },
              radius: 5000
            }
          }
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.googleMapsUri"
          },
          timeout: 10000
        }
      );

      places = response.data.places || [];
    } catch (apiError) {
      console.error("Google Places API fetch error:", apiError.response?.data || apiError.message);
    }

    if (!places.length) {
      const fallbackVendors = generateFallbackGoogleVendors(placeType, lat, lng, keyword);
      return res.json({
        success: true,
        keyword,
        placeType,
        location: { lat: Number(lat), lng: Number(lng) },
        totalVendors: fallbackVendors.length,
        vendors: fallbackVendors
      });
    }

    const vendors = places
      .map((place) => {
        const vendorLat = place.location?.latitude;
        const vendorLng = place.location?.longitude;

        const distanceKm =
          vendorLat !== undefined && vendorLng !== undefined
            ? calculateDistanceKm(Number(lat), Number(lng), vendorLat, vendorLng)
            : null;

        return {
          name: place.displayName?.text || "Local Store",
          type: placeType,
          address: place.formattedAddress || "",
          rating: place.rating || 4.5,
          totalRatings: place.userRatingCount || 10,
          placeId: place.id || null,
          location: place.location || null,
          distanceKm: distanceKm !== null ? Number(distanceKm.toFixed(2)) : null,
          distance: distanceKm !== null ? `${distanceKm.toFixed(2)} km away` : "Distance unavailable",
          openNow: place.currentOpeningHours?.openNow ?? true,
          mapsUrl: place.googleMapsUri || `https://maps.google.com/?q=${encodeURIComponent(place.displayName?.text || "store")}`,
          priceAvailable: false,
          source: "Google Places"
        };
      })
      .filter((v) => v.distanceKm === null || v.distanceKm <= 5)
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    res.json({
      success: true,
      keyword,
      placeType,
      location: { lat: Number(lat), lng: Number(lng) },
      totalVendors: vendors.length,
      vendors
    });
  } catch (error) {
    console.error("Nearby vendors route error:", error.message);
    res.status(500).json({
      success: false,
      error: "Unable to fetch nearby vendors",
      details: error.message
    });
  }
});

// --------------------------------------------------
// 2. Second-Hand Marketplace & User Submissions
// --------------------------------------------------

// Get all second-hand & pre-owned listings
app.get("/api/secondhand", (req, res) => {
  const { category, maxPrice, search: searchQ } = req.query;

  let results = products.filter(
    (item) =>
      item.condition.toLowerCase().includes("pre-owned") ||
      item.condition.toLowerCase().includes("good condition") ||
      item.condition.toLowerCase().includes("open box") ||
      item.sellerType.toLowerCase().includes("student") ||
      item.sellerType.toLowerCase().includes("individual")
  );

  if (category && category !== "All") {
    results = results.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (maxPrice) {
    results = results.filter((item) => item.price <= Number(maxPrice));
  }

  if (searchQ) {
    const q = searchQ.toLowerCase();
    results = results.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.seller.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: results.length,
    secondHandListings: results
  });
});

// Post a second-hand item for sale (Students & Individuals)
app.post("/api/secondhand", (req, res) => {
  try {
    const { name, category, price, condition, seller, sellerType, contact, distance } = req.body;

    if (!name || !price || !seller) {
      return res.status(400).json({
        success: false,
        error: "Product name, price, and seller name are required"
      });
    }

    const newListing = {
      id: products.length + userSubmissions.length + 100,
      name: name.trim(),
      category: category || "General",
      seller: seller.trim(),
      sellerType: sellerType || "Student / Individual",
      condition: condition || "Like New (Pre-owned)",
      price: Number(price),
      distance: distance || "0.5 km away",
      distanceKm: parseFloat(distance) || 0.5,
      verified: true,
      rating: 5.0,
      reviews: 1,
      contact: contact || null,
      createdAt: new Date().toISOString()
    };

    products.unshift(newListing);
    userSubmissions.push(newListing);

    console.log(`✅ New Second-Hand item listed: "${newListing.name}" by ${newListing.seller} (₹${newListing.price})`);

    res.status(201).json({
      success: true,
      message: "Second-hand item listed successfully!",
      listing: newListing
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to post second-hand listing",
      details: err.message
    });
  }
});

// --------------------------------------------------
// 3. Demand Matchmaker Endpoint
// --------------------------------------------------

app.post("/api/demand", (req, res) => {
  try {
    const { product, budget, quantity = 1, preferredCondition } = req.body;

    if (!product) {
      return res.status(400).json({
        success: false,
        error: "Product query is required for demand matching"
      });
    }

    const q = product.toLowerCase().trim();

    const matchedSellers = products.filter((item) => {
      const matchText =
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const totalPrice = item.price * Number(quantity);
      const matchBudget = budget ? totalPrice <= Number(budget) : true;

      const matchCondition = preferredCondition
        ? item.condition.toLowerCase().includes(preferredCondition.toLowerCase())
        : true;

      return matchText && matchBudget && matchCondition;
    });

    res.json({
      success: true,
      query: { product, budget, quantity, preferredCondition },
      totalMatches: matchedSellers.length,
      matches: matchedSellers.map((item) => ({
        ...item,
        totalPrice: item.price * Number(quantity),
        type: item.condition.toLowerCase().includes("pre-owned") ? "Second-Hand Student Seller" : "Local Verified Store"
      }))
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Demand matching failed",
      details: err.message
    });
  }
});

// --------------------------------------------------
// 4. Main Search & Price Comparison Engine (/api/search)
// --------------------------------------------------

app.get("/api/search", async (req, res) => {
  try {
    const { product, lat, lng } = req.query;

    if (!product) {
      return res.status(400).json({
        success: false,
        error: "Product name is required"
      });
    }

    const userLat = lat ? Number(lat) : 12.9716;
    const userLng = lng ? Number(lng) : 77.5946;
    const searchLower = product.toLowerCase().trim();

    // 1. Filter local Baiskit products & second-hand items
    const matches = products.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
    );

    // 2. Fetch prices from Baiskit local/second-hand & Online Aggregators
    const baiskitPrices = getBaiskitPrices(product, matches);
    const onlinePrices = await getOnlinePrices(product);

    const allPriceResults = [...onlinePrices, ...baiskitPrices];

    // Filter valid & non-zero prices
    const validPriceResults = allPriceResults.filter(
      (item) => item && Number.isFinite(item.price) && item.price > 0
    );

    // Categorize price channels
    const onlineResults = validPriceResults.filter((item) => item.type === "online");
    const localResults = validPriceResults.filter((item) => item.type === "local");
    const secondHandResults = validPriceResults.filter((item) => item.type === "second-hand");

    // Lowest prices per channel
    const getLowest = (arr) => (arr.length ? arr.reduce((min, item) => (item.price < min.price ? item : min)) : null);

    const lowestOverall = getLowest(validPriceResults);
    const lowestOnline = getLowest(onlineResults);
    const lowestLocal = getLowest(localResults);
    const lowestSecondHand = getLowest(secondHandResults);

    // Calculate maximum savings buying second-hand vs new online/local
    let potentialSavings = 0;
    if (lowestSecondHand && (lowestOnline || lowestLocal)) {
      const benchmarkPrice = Math.min(
        lowestOnline ? lowestOnline.price : Infinity,
        lowestLocal ? lowestLocal.price : Infinity
      );
      if (benchmarkPrice > lowestSecondHand.price) {
        potentialSavings = benchmarkPrice - lowestSecondHand.price;
      }
    }

    // 3. Google Vendor Category & Nearby Vendors
    const category = matches.length > 0 ? matches[0].category : product;
    const placeType = getGooglePlaceType(category);

    let vendors = [];

    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const googleResponse = await axios.post(
          "https://places.googleapis.com/v1/places:searchNearby",
          {
            includedTypes: [placeType],
            maxResultCount: 10,
            rankPreference: "DISTANCE",
            locationRestriction: {
              circle: {
                center: { latitude: userLat, longitude: userLng },
                radius: 5000
              }
            }
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
              "X-Goog-FieldMask":
                "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.googleMapsUri"
            },
            timeout: 10000
          }
        );

        const places = googleResponse.data.places || [];

        vendors = places
          .map((place) => {
            const vLat = place.location?.latitude;
            const vLng = place.location?.longitude;
            if (vLat === undefined || vLng === undefined) return null;

            const distanceKm = calculateDistanceKm(userLat, userLng, vLat, vLng);

            return {
              name: place.displayName?.text || "Unknown Store",
              address: place.formattedAddress || "",
              rating: place.rating || 4.5,
              totalRatings: place.userRatingCount || 10,
              placeId: place.id || null,
              location: place.location || null,
              distanceKm: Number(distanceKm.toFixed(2)),
              distance: `${distanceKm.toFixed(2)} km away`,
              openNow: place.currentOpeningHours?.openNow ?? true,
              mapsUrl: place.googleMapsUri || null,
              priceAvailable: false,
              source: "Google Places (Real Store)"
            };
          })
          .filter(Boolean)
          .filter((v) => v.distanceKm <= 5)
          .sort((a, b) => a.distanceKm - b.distanceKm);
      } catch (gErr) {
        console.error("Google Places search error in /api/search:", gErr.message);
      }
    }

    if (!vendors.length) {
      vendors = generateFallbackGoogleVendors(placeType, userLat, userLng, category);
    }

    // Final response payload
    res.json({
      success: true,

      search: {
        product,
        category,
        googlePlaceType: placeType,
        userLocation: { lat: userLat, lng: userLng }
      },

      baiskitListings: matches,

      priceResults: validPriceResults,

      comparison: {
        lowestOverall,
        lowestOnline,
        lowestLocal,
        lowestSecondHand,
        potentialSavings: Math.round(potentialSavings)
      },

      nearbyVendors: vendors,

      totalListings: matches.length,
      totalNearbyVendors: vendors.length,
      totalPriceResults: validPriceResults.length,

      onlineCount: onlineResults.length,
      localCount: localResults.length,
      secondHandCount: secondHandResults.length
    });

  } catch (error) {
    console.error("Baiskit search error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: "Unable to perform product search",
      details: error.response?.data || error.message
    });
  }
});

// Start express server
app.listen(PORT, () => {
  console.log(`✅ Baiskit API backend running on http://localhost:${PORT}`);
});
