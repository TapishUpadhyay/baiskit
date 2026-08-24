const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
app.get("/api", (req, res) => {
  res.json({
    message: "Baiskit API is working!"
  });
});


// Extended Product Database with realistic local sellers
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

  // Home & Furniture
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

  // Fashion & Lifestyle
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

app.get("/api/products", (req, res) => {
  res.json(products);
});

// Helper to generate dynamic benchmark comparison for any product
function buildComparisonResponse(queryName, matches) {
  let finalMatches = matches;
  let queryTitle = queryName.charAt(0).toUpperCase() + queryName.slice(1);

  // If no static match is found, dynamically generate realistic local sellers!
  if (!finalMatches || finalMatches.length === 0) {
    const baseEstimatedPrice = Math.floor(Math.random() * 400) + 650;
    queryTitle = queryName;

    finalMatches = [
      {
        id: `dyn-1`,
        name: queryTitle,
        category: "General",
        seller: "Indiranagar SuperStore",
        sellerType: "Verified Merchant",
        condition: "Brand New • In Stock",
        price: baseEstimatedPrice,
        distance: "0.5 km away",
        verified: true
      },
      {
        id: `dyn-2`,
        name: queryTitle,
        category: "General",
        seller: "Metro Retail Mart",
        sellerType: "Local Shop",
        condition: "Brand New",
        price: Math.round(baseEstimatedPrice * 1.12),
        distance: "1.2 km away",
        verified: true
      },
      {
        id: `dyn-3`,
        name: queryTitle,
        category: "General",
        seller: "Neighborhood QuickPick",
        sellerType: "Local Retailer",
        condition: "Brand New",
        price: Math.round(baseEstimatedPrice * 1.25),
        distance: "0.9 km away",
        verified: false
      }
    ];
  }

  const sortedMatches = [...finalMatches].sort((a, b) => a.price - b.price);
  const bestLocalPrice = sortedMatches[0].price;

  // Realistically benchmark against Amazon, Flipkart, Blinkit / Zepto
  const commercialApps = [
    {
      platform: "Amazon",
      logo: "📦",
      price: Math.round(bestLocalPrice * 1.35) + 40,
      delivery: "2-3 Days",
      tag: "Online E-comm"
    },
    {
      platform: "Flipkart",
      logo: "🛍️",
      price: Math.round(bestLocalPrice * 1.30) + 50,
      delivery: "Tomorrow",
      tag: "Online E-comm"
    },
    {
      platform: "Blinkit / Zepto",
      logo: "⚡",
      price: Math.round(bestLocalPrice * 1.48),
      delivery: "10-15 Mins",
      tag: "Quick Commerce"
    }
  ];

  const minCommercialPrice = Math.min(...commercialApps.map((a) => a.price));
  const maxSavings = Math.max(0, minCommercialPrice - bestLocalPrice);
  const savingsPercent = Math.round((maxSavings / minCommercialPrice) * 100);

  return {
    product: queryTitle,
    totalMatches: sortedMatches.length,
    bestDeal: sortedMatches[0],
    options: sortedMatches,
    commercialApps: commercialApps,
    savings: {
      amount: maxSavings,
      percent: savingsPercent,
      comparedTo: "Major E-commerce Apps"
    }
  };
}

app.get("/api/compare/:productName", (req, res) => {
  const rawQuery = req.params.productName.trim();
  const searchLower = rawQuery.toLowerCase();

  // Search across product name, category, and seller
  const matches = products.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(searchLower);
    const catMatch = product.category.toLowerCase().includes(searchLower);
    const sellerMatch = product.seller.toLowerCase().includes(searchLower);
    return nameMatch || catMatch || sellerMatch;
  });

  const responseData = buildComparisonResponse(rawQuery, matches);
  res.json(responseData);
});

app.listen(PORT, () => {
  console.log(`Baiskit API running on http://localhost:${PORT}`);
});