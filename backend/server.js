require("dotenv").config();

console.log(
  "Google API key loaded:",
  process.env.GOOGLE_MAPS_API_KEY ? "YES" : "NO"
);

const { getBaiskitPrices } = require("./priceSources/baiskit");
const { getOnlinePrices } = require("./priceSources/online");

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/api", (req, res) => {
  res.json({
    message: "Baiskit API is working!"
  });
});


// Product database
const products = [
  // Books
  {
    id: 1,
    name: "Let Us C - Yashavant Kanetkar",
    category: "Books",
    seller: "Campus Book Store",
    sellerType: "Verified Store",
    condition: "Brand New",
    price: 450,
    distance: "0.6 km away",
    verified: true
  },
  {
    id: 2,
    name: "Let Us C",
    category: "Books",
    seller: "Rahul Sharma (Student)",
    sellerType: "Individual",
    condition: "Like New (Pre-owned)",
    price: 250,
    distance: "0.3 km away",
    verified: true
  },
  {
    id: 3,
    name: "Let Us C",
    category: "Books",
    seller: "Sharma Book Depot",
    sellerType: "Book Retailer",
    condition: "Brand New",
    price: 420,
    distance: "1.2 km away",
    verified: true
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
    verified: true
  },
  {
    id: 5,
    name: "Atomic Habits",
    category: "Books",
    seller: "Aman K.",
    sellerType: "Individual",
    condition: "Good Condition",
    price: 220,
    distance: "0.8 km away",
    verified: true
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
    verified: true
  },

  // Electronics
  {
    id: 10,
    name: "Wireless Studio Headphones",
    category: "Electronics",
    seller: "Rahul Electronics",
    sellerType: "Authorized Store",
    condition: "Brand New • 1 Yr Warranty",
    price: 2199,
    distance: "0.4 km away",
    verified: true
  },
  {
    id: 11,
    name: "Wireless Studio Headphones",
    category: "Electronics",
    seller: "Digital Hub Indiranagar",
    sellerType: "Retailer",
    condition: "Brand New",
    price: 2350,
    distance: "1.1 km away",
    verified: true
  },
  {
    id: 12,
    name: "Wireless Studio Headphones",
    category: "Electronics",
    seller: "Gadget Resale Hub",
    sellerType: "Certified Refurbished",
    condition: "Open Box (Mint)",
    price: 1650,
    distance: "1.8 km away",
    verified: true
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
    verified: true
  },
  {
    id: 14,
    name: "Wireless Earbuds (TWS)",
    category: "Electronics",
    seller: "Priya Electronics",
    sellerType: "Local Merchant",
    condition: "Brand New",
    price: 1250,
    distance: "0.8 km away",
    verified: true
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
    verified: true
  },
  {
    id: 16,
    name: "Smart Watch Fitness Tracker",
    category: "Electronics",
    seller: "TechZone Gadgets",
    sellerType: "Authorized Retailer",
    condition: "Brand New",
    price: 1799,
    distance: "0.7 km away",
    verified: true
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
    verified: true
  },

  // Home
  {
    id: 20,
    name: "Ergonomic Study Desk",
    category: "Home",
    seller: "City Wooden Furniture",
    sellerType: "Manufacturer Outlet",
    condition: "Brand New • Solid Wood",
    price: 2150,
    distance: "1.4 km away",
    verified: true
  },
  {
    id: 21,
    name: "Ergonomic Study Desk",
    category: "Home",
    seller: "Vikram Living Space",
    sellerType: "Showroom",
    condition: "Brand New",
    price: 2450,
    distance: "2.1 km away",
    verified: true
  },
  {
    id: 22,
    name: "Ergonomic Mesh Office Chair",
    category: "Home",
    seller: "Comfort Seating Hub",
    sellerType: "Authorized Dealer",
    condition: "Brand New • 2 Yr Warranty",
    price: 3499,
    distance: "1.1 km away",
    verified: true
  },

  // Fashion
  {
    id: 30,
    name: "AeroPulse Running Shoes",
    category: "Fashion",
    seller: "Sports Hub Indiranagar",
    sellerType: "Authorized Sports Outlet",
    condition: "Brand New with Box",
    price: 1899,
    distance: "0.6 km away",
    verified: true
  },
  {
    id: 31,
    name: "AeroPulse Running Shoes",
    category: "Fashion",
    seller: "Sneaker Station",
    sellerType: "Retailer",
    condition: "Brand New",
    price: 1999,
    distance: "1.0 km away",
    verified: true
  },
  {
    id: 32,
    name: "Waterproof Casual Backpack",
    category: "Fashion",
    seller: "Travelers Gear Indiranagar",
    sellerType: "Local Store",
    condition: "Brand New",
    price: 899,
    distance: "0.5 km away",
    verified: true
  }
];


// Google Places type
function getGooglePlaceType(productOrCategory) {
  const q = productOrCategory.toLowerCase();

  if (
    q.includes("book") ||
    q.includes("novel") ||
    q.includes("textbook")
  ) {
    return "book_store";
  }

  if (
    q.includes("headphone") ||
    q.includes("earbud") ||
    q.includes("keyboard") ||
    q.includes("charger") ||
    q.includes("electronics") ||
    q.includes("gadget")
  ) {
    return "electronics_store";
  }

  if (
    q.includes("desk") ||
    q.includes("chair") ||
    q.includes("furniture")
  ) {
    return "furniture_store";
  }

  if (
    q.includes("shoe") ||
    q.includes("sneaker")
  ) {
    return "shoe_store";
  }

  if (
    q.includes("shirt") ||
    q.includes("clothing") ||
    q.includes("fashion")
  ) {
    return "clothing_store";
  }

  return "store";
}


// Nearby vendors
app.get("/api/vendors/nearby", async (req, res) => {
  try {
    const { lat, lng, keyword = "store" } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: "Latitude and longitude are required"
      });
    }

    const placeType = getGooglePlaceType(keyword);

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
        }
      }
    );

    const places = response.data.places || [];

    const vendors = places
      .map((place) => {
        const vendorLat = place.location?.latitude;
        const vendorLng = place.location?.longitude;

        const distanceKm =
          vendorLat !== undefined && vendorLng !== undefined
            ? calculateDistanceKm(
                Number(lat),
                Number(lng),
                vendorLat,
                vendorLng
              )
            : null;

        return {
  name: place.displayName?.text || "Unknown",
  type: placeType,
  address: place.formattedAddress || "",

  rating: place.rating || null,
  totalRatings: place.userRatingCount || 0,

  placeId: place.id || null,
  location: place.location || null,

  distanceKm:
    distanceKm !== null
      ? Number(distanceKm.toFixed(2))
      : null,

  distance:
    distanceKm !== null
      ? `${distanceKm.toFixed(2)} km away`
      : "Distance unavailable",

  openNow: place.currentOpeningHours?.openNow ?? null,
  mapsUrl: place.googleMapsUri || null,

  priceAvailable: false,
  source: "Google Places"
};
      })
      .filter(
        (vendor) =>
          vendor.distanceKm === null ||
          vendor.distanceKm <= 5
      )
      .sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });

    res.json({
      success: true,
      keyword,
      placeType,
      location: {
        lat: Number(lat),
        lng: Number(lng)
      },
      totalVendors: vendors.length,
      vendors
    });

  } catch (error) {
    console.error(
      "Google Places API error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      error: "Unable to fetch nearby vendors",
      details: error.response?.data || error.message
    });
  }
});


// Calculate distance
function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}


// Main Baiskit search
app.get("/api/search", async (req, res) => {
  try {
    const { product, lat, lng } = req.query;

    if (!product) {
      return res.status(400).json({
        success: false,
        error: "Product name is required"
      });
    }

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required"
      });
    }

    const searchLower = product.toLowerCase().trim();

    // Baiskit local listings
    const matches = products.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
    );

    // Price sources
    const baiskitPrices = getBaiskitPrices(product, matches);
    const onlinePrices = await getOnlinePrices(product);

    const allPriceResults = [
      ...onlinePrices,
      ...baiskitPrices
    ];

    // Counts
    const onlineCount = allPriceResults.filter(
      (item) => item.type === "online"
    ).length;

    const localCount = allPriceResults.filter(
      (item) => item.type === "local"
    ).length;

    const secondHandCount = allPriceResults.filter(
      (item) => item.type === "second-hand"
    ).length;

    // Lowest prices
    const lowestOverall = allPriceResults.length
      ? allPriceResults.reduce((min, item) =>
          item.price < min.price ? item : min
        )
      : null;

    const lowestOnline =
      allPriceResults
        .filter((item) => item.type === "online")
        .sort((a, b) => a.price - b.price)[0] || null;

    const lowestLocal =
      allPriceResults
        .filter((item) => item.type === "local")
        .sort((a, b) => a.price - b.price)[0] || null;

    const lowestSecondHand =
      allPriceResults
        .filter((item) => item.type === "second-hand")
        .sort((a, b) => a.price - b.price)[0] || null;

    // Google vendor category
    const category =
      matches.length > 0
        ? matches[0].category
        : product;

    const placeType = getGooglePlaceType(category);

    // Nearby Google vendors
    const googleResponse = await axios.post(
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
        }
      }
    );

    const places = googleResponse.data.places || [];

    const vendors = places
      .map((place) => {
        const vendorLat = place.location?.latitude;
        const vendorLng = place.location?.longitude;

        if (
          vendorLat === undefined ||
          vendorLng === undefined
        ) {
          return null;
        }

        const distanceKm = calculateDistanceKm(
          Number(lat),
          Number(lng),
          Number(vendorLat),
          Number(vendorLng)
        );

        return {
          name: place.displayName?.text || "Unknown",
          address: place.formattedAddress || "",
          rating: place.rating || null,
          totalRatings: place.userRatingCount || 0,
          placeId: place.id || null,
          location: place.location || null,

          distanceKm: Number(distanceKm.toFixed(2)),
          distance: `${distanceKm.toFixed(2)} km away`,

          openNow:
            place.currentOpeningHours?.openNow ?? null,

          mapsUrl: place.googleMapsUri || null,

          priceAvailable: false,
          source: "Google Places"
        };
      })
      .filter(Boolean)
      .filter((vendor) => vendor.distanceKm <= 5)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    // Final response
    res.json({
      success: true,

      search: {
        product,
        category,
        googlePlaceType: placeType
      },

      baiskitListings: matches,

      priceResults: allPriceResults,

      comparison: {
        lowestOverall,
        lowestOnline,
        lowestLocal,
        lowestSecondHand
      },

      nearbyVendors: vendors,

      totalListings: matches.length,
      totalNearbyVendors: vendors.length,
      totalPriceResults: allPriceResults.length,

      onlineCount,
      localCount,
      secondHandCount
    });

  } catch (error) {
    console.error(
      "Baiskit search error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      error: "Unable to perform product search",
      details: error.response?.data || error.message
    });
  }
});


app.listen(PORT, () => {
  console.log(
    `Baiskit API running on http://localhost:${PORT}`
  );
});
